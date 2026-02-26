'use client';

import { useState, useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Search, Plus, Users, ChevronUp, ChevronDown, Edit2, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AddSubscriptionModal from './AddSubscriptionModal';
import type { Subscription, Profile } from '@/types';
import { CURRENCIES } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
    subscriptions: Subscription[];
    teamMembers: Profile[];
    currentProfile: Profile | null;
    orgId: string;
}

function formatCurrency(amount: number, currency = 'USD') {
    const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getStatusBadgeClass(status: string) {
    const map: Record<string, string> = {
        active: 'badge badge-green', expiring: 'badge badge-orange',
        cancelled: 'badge badge-red', trial: 'badge badge-blue',
    };
    return map[status] ?? 'badge badge-gray';
}

function getDaysUntil(date: string) {
    return differenceInDays(parseISO(date), new Date());
}

type SortKey = 'name' | 'cost' | 'renewal_date' | 'seats' | 'status';
type SortDir = 'asc' | 'desc';

export default function SubscriptionsClient({ subscriptions: initialSubs, teamMembers, currentProfile, orgId }: Props) {
    const router = useRouter();
    const supabase = createClient();
    const { t } = useLanguage();

    const [subscriptions, setSubscriptions] = useState(initialSubs);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('renewal_date');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [showAdd, setShowAdd] = useState(false);
    const [editSub, setEditSub] = useState<Subscription | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const SortIcon = ({ k }: { k: SortKey }) => {
        if (sortKey !== k) return null;
        return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    };

    const filtered = useMemo(() => {
        let data = [...subscriptions];
        if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.vendor?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all') data = data.filter(s => s.status === statusFilter);
        if (catFilter !== 'all') data = data.filter(s => s.category === catFilter);
        return data.sort((a, b) => {
            let av: any = a[sortKey], bv: any = b[sortKey];
            if (sortKey === 'cost') { av = Number(av); bv = Number(bv); }
            if (sortKey === 'seats') { av = Number(av); bv = Number(bv); }
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [subscriptions, search, statusFilter, catFilter, sortKey, sortDir]);

    const categories = useMemo(() => {
        return ['all', ...Array.from(new Set(subscriptions.map(s => s.category).filter(Boolean)))];
    }, [subscriptions]);

    const totalMonthly = useMemo(() => {
        return subscriptions.filter(s => s.status !== 'cancelled').reduce((sum, s) => {
            if (s.billing_cycle === 'monthly') return sum + s.cost;
            if (s.billing_cycle === 'yearly') return sum + s.cost / 12;
            if (s.billing_cycle === 'quarterly') return sum + s.cost / 3;
            return sum;
        }, 0);
    }, [subscriptions]);

    const handleDelete = async (id: string) => {
        setDeleting(id);
        await supabase.from('subscriptions').delete().eq('id', id);
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        setDeleting(null);
        setConfirmDelete(null);
    };

    const exportCSV = () => {
        const headers = ['Name', 'Vendor', 'Category', 'Cost', 'Currency', 'Billing Cycle', 'Seats', 'Renewal Date', 'Status', 'Owner'];
        const rows = filtered.map(s => [
            s.name, s.vendor ?? '', s.category ?? '', s.cost, s.currency,
            s.billing_cycle, s.seats ?? 0, s.renewal_date, s.status,
            (s.owner as any)?.full_name ?? ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'subscriptions.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            {/* Topbar */}
            <div className="topbar">
                <span className="topbar-title">{t('subs_title')}</span>
                <div className="topbar-actions">
                    <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
                        <Download size={14} /> {t('subs_import_csv').replace('Import', 'Export')}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                        <Plus size={14} /> {t('subs_add')}
                    </button>
                </div>
            </div>

            <div className="page-content">
                {/* Summary strip */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Monthly', value: formatCurrency(totalMonthly), color: 'var(--color-purple)' },
                        { label: 'Active', value: subscriptions.filter(s => s.status === 'active').length, color: 'var(--color-green)' },
                        { label: 'Expiring', value: subscriptions.filter(s => s.status === 'expiring').length, color: 'var(--color-orange)' },
                        { label: 'Trial', value: subscriptions.filter(s => s.status === 'trial').length, color: 'var(--color-blue)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '10px 18px', display: 'flex', flexDirection: 'column', minWidth: 100 }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-input-wrapper">
                        <Search size={15} />
                        <input className="form-input" placeholder="Search subscriptions…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="expiring">Expiring</option>
                        <option value="trial">Trial</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select className="form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>App / Service <SortIcon k="name" /></span>
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('seats')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> Users <SortIcon k="seats" /></span>
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('cost')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Cost <SortIcon k="cost" /></span>
                                </th>
                                <th>Billing</th>
                                <th>Owner</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('renewal_date')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Renewal <SortIcon k="renewal_date" /></span>
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Status <SortIcon k="status" /></span>
                                </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon"><Plus size={28} /></div>
                                            <h3>No subscriptions yet</h3>
                                            <p>Add your first subscription to start tracking.</p>
                                            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                                                <Plus size={14} /> Add Subscription
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(sub => {
                                const days = getDaysUntil(sub.renewal_date);
                                return (
                                    <tr key={sub.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {sub.logo_url ? (
                                                    <img src={sub.logo_url} alt={sub.name} width={28} height={28} style={{ borderRadius: 6, objectFit: 'contain', border: '1px solid var(--color-border)', background: '#fff', padding: 2 }} />
                                                ) : (
                                                    <div className="icon-wrap-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontWeight: 800, fontSize: 13 }}>
                                                        {sub.name[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <Link href={`/dashboard/subscriptions/detail?id=${sub.id}`} style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                                        {sub.name}
                                                    </Link>
                                                    {sub.category && <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{sub.category}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: sub.seats > 0 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontSize: '13px', fontWeight: sub.seats > 0 ? 600 : 400 }}>
                                                <Users size={13} color="var(--color-text-tertiary)" />
                                                {sub.seats > 0 ? `${sub.seats}` : '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{formatCurrency(sub.cost, sub.currency)}</span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{sub.billing_cycle}</span>
                                        </td>
                                        <td>
                                            {sub.owner ? (
                                                <span style={{ fontSize: '13px' }}>{(sub.owner as any)?.full_name ?? '—'}</span>
                                            ) : <span style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Unassigned</span>}
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{format(parseISO(sub.renewal_date), 'MMM d, yyyy')}</div>
                                                <div style={{ fontSize: '11px', color: days < 7 ? 'var(--color-red)' : days < 30 ? 'var(--color-orange)' : 'var(--color-text-tertiary)', fontWeight: 600 }}>
                                                    {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d left`}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(sub.status)} style={{ textTransform: 'capitalize' }}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                <button className="btn btn-ghost btn-sm" title="Edit"
                                                    onClick={() => setEditSub(sub)}>
                                                    <Edit2 size={14} />
                                                </button>
                                                {confirmDelete === sub.id ? (
                                                    <>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: 'var(--color-red)', color: '#fff', fontSize: 11, padding: '3px 8px' }}
                                                            onClick={() => handleDelete(sub.id)}
                                                            disabled={deleting === sub.id}
                                                        >
                                                            {deleting === sub.id ? '…' : 'Delete?'}
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setConfirmDelete(null)}>✕</button>
                                                    </>
                                                ) : (
                                                    <button className="btn btn-ghost btn-sm" title="Delete"
                                                        onClick={() => setConfirmDelete(sub.id)}
                                                        style={{ color: 'var(--color-red)' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {(showAdd || editSub) && (
                <AddSubscriptionModal
                    orgId={orgId}
                    teamMembers={teamMembers}
                    subscription={editSub ?? undefined}
                    onClose={() => { setShowAdd(false); setEditSub(null); }}
                />
            )}
        </div>
    );
}
