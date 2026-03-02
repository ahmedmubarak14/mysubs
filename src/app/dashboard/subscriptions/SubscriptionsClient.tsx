'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, differenceInDays, parseISO, addMonths, addYears, addWeeks, addDays } from 'date-fns';
import { Search, Plus, Users, ChevronUp, ChevronDown, Edit2, Trash2, Download, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AddSubscriptionModal from './AddSubscriptionModal';
import type { Subscription, Profile } from '@/types';
import { CURRENCIES } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

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

/** Advance a date by one billing cycle */
function nextRenewalDate(currentDate: string, billingCycle: string): string {
    const base = parseISO(currentDate);
    const cycleMap: Record<string, Date> = {
        monthly: addMonths(base, 1),
        quarterly: addMonths(base, 3),
        biannual: addMonths(base, 6),
        yearly: addYears(base, 1),
        annual: addYears(base, 1),
        weekly: addWeeks(base, 1),
        daily: addDays(base, 1),
    };
    return (cycleMap[billingCycle] ?? addMonths(base, 1)).toISOString().split('T')[0];
}

type SortKey = 'name' | 'cost' | 'renewal_date' | 'seats' | 'status';
type SortDir = 'asc' | 'desc';

export default function SubscriptionsClient({ subscriptions: initialSubs, teamMembers, currentProfile, orgId }: Props) {
    const { openPanel } = useNotifications();
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
    const [confirmRenew, setConfirmRenew] = useState<string | null>(null); // subscription id awaiting renewal confirm
    const [renewingId, setRenewingId] = useState<string | null>(null);
    // Exchange rates relative to USD (SAR is pegged at 3.75)
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1, SAR: 3.75, EUR: 0.92, GBP: 0.79 });

    // Fetch live exchange rates
    useEffect(() => {
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(r => r.json())
            .then(d => { if (d.rates) setRates(d.rates); })
            .catch(() => { }); // silently fall back to defaults
    }, []);

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
            // Normalize each sub to USD first using live rates
            const toUsd = 1 / (rates[s.currency] ?? 1);
            const monthly = s.billing_cycle === 'monthly' ? s.cost
                : s.billing_cycle === 'yearly' ? s.cost / 12
                    : s.billing_cycle === 'quarterly' ? s.cost / 3
                        : 0;
            return sum + monthly * toUsd;
        }, 0); // result in USD
    }, [subscriptions, rates]);

    const totalMonthlyUSD = totalMonthly;
    const totalMonthlySAR = totalMonthly * (rates['SAR'] ?? 3.75);

    const handleDelete = async (id: string) => {
        setDeleting(id);
        await supabase.from('subscriptions').delete().eq('id', id);
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        setDeleting(null);
        setConfirmDelete(null);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
        }
    };

    /** Confirm renewal: advance renewal_date by one cycle, notify integrations */
    const handleConfirmRenewal = async (sub: Subscription) => {
        setRenewingId(sub.id);
        const newDate = nextRenewalDate(sub.renewal_date, sub.billing_cycle);
        const { error } = await supabase
            .from('subscriptions')
            .update({ renewal_date: newDate, status: 'active' })
            .eq('id', sub.id);

        if (!error) {
            setSubscriptions(prev =>
                prev.map(s => s.id === sub.id ? { ...s, renewal_date: newDate, status: 'active' } : s)
            );
            // Fire webhook alerts for connected integrations
            supabase.functions.invoke('send-webhook-alert', {
                body: {
                    orgId,
                    subscriptionName: sub.name,
                    renewalDate: newDate,
                    cost: sub.cost,
                    currency: sub.currency,
                    daysUntilRenewal: 0,
                    eventType: 'renewal_confirmed',
                },
            }).catch(() => { }); // fire and forget — UI doesn't depend on it
        }
        setRenewingId(null);
        setConfirmRenew(null);
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
            <Topbar title={t('subs_title')} onToggleNotifications={openPanel}>
                <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
                    <Download size={14} /> {t('subs_import_csv').replace('Import', 'Export')}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                    <Plus size={14} /> {t('subs_add')}
                </button>
            </Topbar>

            <div className="page-content">
                {/* Summary strip */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {/* Total Monthly — dual currency card */}
                    <div className="card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', minWidth: 160, flex: 1 }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Monthly</span>
                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-purple)' }}>${totalMonthlyUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 1 }}>﷼ {totalMonthlySAR.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} SAR</span>
                    </div>
                    {[
                        { label: 'Active', value: subscriptions.filter(s => s.status === 'active').length, color: 'var(--color-green)' },
                        { label: 'Expiring', value: subscriptions.filter(s => s.status === 'expiring').length, color: 'var(--color-orange)' },
                        { label: 'Trial', value: subscriptions.filter(s => s.status === 'trial').length, color: 'var(--color-blue)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="card" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', minWidth: 120, flex: 1 }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-input-wrapper">
                        <Search size={15} />
                        <input className="form-input" placeholder={t('subs_search_ph')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">{t('subs_status_all')}</option>
                        <option value="active">{t('subs_status_active')}</option>
                        <option value="expiring">{t('subs_status_expiring')}</option>
                        <option value="trial">{t('subs_status_trial')}</option>
                        <option value="cancelled">{t('subs_status_cancelled')}</option>
                    </select>
                    <select className="form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? t('subs_cat_all') : c}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{t('dash_col_app')} <SortIcon k="name" /></span>
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('seats')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {t('subs_col_users')} <SortIcon k="seats" /></span>
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('cost')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{t('dash_col_cost')} <SortIcon k="cost" /></span>
                                </th>
                                <th>{t('dash_col_billing')}</th>
                                <th>{t('subs_col_owner')}</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('renewal_date')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{t('dash_col_renewal')} <SortIcon k="renewal_date" /></span>
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{t('dash_col_status')} <SortIcon k="status" /></span>
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
                                            <h3>{t('subs_empty_title')}</h3>
                                            <p>{t('subs_empty_sub')}</p>
                                            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                                                <Plus size={14} /> {t('dash_add_subscription')}
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
                                                    <img src={sub.logo_url} alt={sub.name} width={32} height={32} style={{ borderRadius: 8, objectFit: 'contain', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', padding: 2 }} />
                                                ) : (
                                                    <div className="icon-wrap-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontWeight: 800, fontSize: 13 }}>
                                                        {sub.name[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Link href={`/dashboard/subscriptions/detail?id=${sub.id}`} style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                                            {sub.name}
                                                        </Link>
                                                        {sub.tier && (
                                                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: sub.tier === 'free' ? 'var(--color-green-bg)' : sub.tier === 'trial' ? 'var(--color-blue-bg)' : 'var(--color-bg-tertiary)', color: sub.tier === 'free' ? 'var(--color-green)' : sub.tier === 'trial' ? 'var(--color-blue)' : 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                                {t(('subs_tier_' + sub.tier) as any) || sub.tier}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {sub.category && <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{t(('cat_' + sub.category) as any) || sub.category}</div>}
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
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{format(parseISO(sub.renewal_date), 'MMM d, yyyy')}</div>
                                                {sub.status !== 'cancelled' && (
                                                    <div style={{
                                                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 12, display: 'inline-flex', alignSelf: 'flex-start',
                                                        background: days < 0 ? 'var(--color-red-bg)' : days <= 7 ? 'var(--color-orange-bg)' : 'var(--color-bg-tertiary)',
                                                        color: days < 0 ? 'var(--color-red)' : days <= 7 ? 'var(--color-orange)' : 'var(--color-text-secondary)'
                                                    }}>
                                                        {days < 0 ? 'Overdue' : days === 0 ? 'Renews Today' : `Renews in ${days}d`}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <select
                                                    value={sub.status}
                                                    onChange={(e) => updateStatus(sub.id, e.target.value)}
                                                    className={getStatusBadgeClass(sub.status)}
                                                    style={{
                                                        textTransform: 'capitalize',
                                                        padding: '4px 22px 4px 10px',
                                                        border: 'none',
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                        MozAppearance: 'none'
                                                    }}
                                                >
                                                    {['active', 'expiring', 'paused', 'trial', 'cancelled'].map(st => (
                                                        <option key={st} value={st} style={{ color: 'var(--color-text-primary)', background: 'var(--color-bg-primary)' }}>
                                                            {t(('subs_status_' + st) as any) || st}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                                {/* ── Confirm Renewal pill – only for overdue / due today ── */}
                                                {days <= 0 && sub.status !== 'cancelled' && (
                                                    confirmRenew === sub.id ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-green-bg)', border: '1.5px solid var(--color-green)', borderRadius: 8, padding: '4px 8px' }}>
                                                            <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                                Next: {format(parseISO(nextRenewalDate(sub.renewal_date, sub.billing_cycle)), 'MMM d, yyyy')}
                                                            </span>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ background: 'var(--color-green)', color: '#fff', fontSize: 11, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                                                                onClick={() => handleConfirmRenewal(sub)}
                                                                disabled={renewingId === sub.id}
                                                            >
                                                                {renewingId === sub.id ? '…' : <><CheckCircle2 size={11} /> Confirm</>}
                                                            </button>
                                                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '3px 6px' }} onClick={() => setConfirmRenew(null)}>✕</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: 'var(--color-orange-bg)', color: 'var(--color-orange)', border: '1.5px solid var(--color-orange)', fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                                                            onClick={() => { setConfirmRenew(sub.id); setConfirmDelete(null); }}
                                                        >
                                                            <RefreshCw size={11} /> Confirm Renewal
                                                        </button>
                                                    )
                                                )}
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
