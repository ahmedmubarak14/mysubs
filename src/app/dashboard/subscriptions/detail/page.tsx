'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { differenceInDays, format } from 'date-fns';
import { ArrowLeft, Edit2, Calendar, Users, DollarSign, Tag, Plus, Trash2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

function SubscriptionDetail() {
    const { openPanel } = useNotifications();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [sub, setSub] = useState<any | null | 'not-found'>('loading');
    const [team, setTeam] = useState<any[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState('user');
    const [addingUser, setAddingUser] = useState(false);
    const [removingUserId, setRemovingUserId] = useState('');

    useEffect(() => {
        if (!id) { setSub('not-found'); return; }
        const supabase = createClient();
        supabase.from('subscriptions')
            .select('*, owner:profiles(full_name, email), subscription_users(*, profile:profiles(id, full_name, email, avatar_url))')
            .eq('id', id).single()
            .then((result: { data: any }) => {
                setSub(result.data ?? 'not-found');
                if (result.data?.org_id) {
                    supabase.from('profiles').select('id, full_name, email').eq('org_id', result.data.org_id)
                        .then((res: any) => setTeam(res.data || []));
                }
            });
    }, [id]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !sub) return;
        setAddingUser(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('subscription_users').insert({
            subscription_id: sub.id,
            profile_id: selectedUserId,
            role: selectedRole
        }).select('*, profile:profiles(id, full_name, email, avatar_url)').single();

        if (data) {
            setSub({ ...sub, subscription_users: [...(sub.subscription_users || []), data] });
            setShowAddUser(false);
            setSelectedUserId('');
            setSelectedRole('user');
        }
        setAddingUser(false);
    };

    const handleRemoveUser = async (suId: string) => {
        setRemovingUserId(suId);
        const supabase = createClient();
        const { error } = await supabase.from('subscription_users').delete().eq('id', suId);
        if (!error) {
            setSub({ ...sub, subscription_users: sub.subscription_users.filter((u: any) => u.id !== suId) });
        }
        setRemovingUserId('');
    };

    if (sub === 'loading') return <div className="page-content"><div className="spinner" /></div>;
    if (sub === 'not-found') return <div className="page-content"><p>Subscription not found.</p></div>;

    const daysLeft = differenceInDays(new Date(sub.renewal_date), new Date());
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.billing_cycle === 'quarterly' ? sub.cost / 3 : sub.cost;

    const STATUS_COLORS: Record<string, string> = {
        active: '#22c55e', expiring: '#f97316', trial: '#3b82f6', cancelled: '#ef4444',
    };

    return (
        <div>
            <Topbar
                title={sub.name}
                onToggleNotifications={openPanel}
            >
                <Link href="/dashboard/subscriptions" className="btn btn-ghost" style={{ padding: '6px 10px', order: -1 }}>
                    <ArrowLeft size={16} />
                </Link>
                <span style={{ padding: '2px 10px', borderRadius: 6, background: `${STATUS_COLORS[sub.status]}20`, color: STATUS_COLORS[sub.status], fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                    {sub.status}
                </span>
                <Link href={`/dashboard/subscriptions/edit?id=${id}`} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                    <Edit2 size={15} /> Edit
                </Link>
            </Topbar>

            <div className="page-content" style={{ maxWidth: 700 }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 'var(--space-5)' }}>
                    {sub.logo_url ? (
                        <img src={sub.logo_url} alt={sub.name} width={64} height={64} style={{ borderRadius: 14, objectFit: 'contain', border: '1px solid var(--color-border)' }} />
                    ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg, #864DB3, #5B2D8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22 }}>
                            {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 22 }}>{sub.name}</div>
                        {sub.vendor && <div style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>{sub.vendor}</div>}
                        {sub.category && <div style={{ marginTop: 4, fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'var(--color-purple-bg)', color: 'var(--color-purple)', display: 'inline-block', fontWeight: 600 }}>{sub.category}</div>}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                    {[
                        { label: 'Monthly Cost', value: `${sub.currency} ${monthlyCost.toFixed(2)}`, icon: <DollarSign size={18} color="var(--color-purple)" />, bg: 'var(--color-purple-bg)' },
                        { label: 'Total Cost', value: `${sub.currency} ${sub.cost.toFixed(2)} / ${sub.billing_cycle}`, icon: <Tag size={18} color="var(--color-blue)" />, bg: 'var(--color-blue-bg)' },
                        { label: daysLeft < 0 ? 'Overdue' : 'Days Until Renewal', value: daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`, icon: <Calendar size={18} color={daysLeft < 7 ? 'var(--color-orange)' : 'var(--color-green)'} />, bg: daysLeft < 7 ? 'var(--color-orange-bg)' : 'var(--color-green-bg)' },
                        { label: 'Users / Seats', value: sub.seats || '—', icon: <Users size={18} color="var(--color-text-tertiary)" />, bg: 'var(--color-bg-secondary)' },
                    ].map(({ label, value, icon, bg }) => (
                        <div key={label} className="card" style={{ padding: 'var(--space-4)', background: bg }}>
                            <div style={{ marginBottom: 6 }}>{icon}</div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 16 }}>Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                        {[
                            { label: 'Renewal Date', value: format(new Date(sub.renewal_date), 'dd MMM yyyy') },
                            { label: 'Start Date', value: sub.start_date ? format(new Date(sub.start_date), 'dd MMM yyyy') : '—' },
                            { label: 'Billing Cycle', value: sub.billing_cycle, capitalize: true },
                            { label: 'Currency', value: sub.currency },
                            { label: 'Owner', value: (sub.owner as any)?.full_name || (sub.owner as any)?.email || 'Unassigned' },
                            { label: 'Status', value: sub.status, capitalize: true },
                        ].map(({ label, value, capitalize }) => (
                            <div key={label}>
                                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                                <div style={{ fontWeight: 600, textTransform: capitalize ? 'capitalize' : undefined }}>{value}</div>
                            </div>
                        ))}
                    </div>
                    {sub.notes && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notes</div>
                            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{sub.notes}</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="card" style={{ marginTop: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700 }}>Assigned Users</div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(true)}>
                        <Plus size={14} /> Add User
                    </button>
                </div>
                {!sub.subscription_users || sub.subscription_users.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', padding: 20, textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                        No users are assigned to this app yet.
                    </div>
                ) : (
                    <div className="table-wrapper" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', margin: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Added</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sub.subscription_users.map((su: any) => (
                                    <tr key={su.id}>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-purple-bg)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                                                {su.profile?.full_name?.[0] || su.profile?.email?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{su.profile?.full_name || su.profile?.email}</div>
                                                {su.profile?.full_name && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{su.profile?.email}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${su.role === 'admin' ? 'badge-purple' : su.role === 'manager' ? 'badge-blue' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                                                {su.role}
                                            </span>
                                        </td>
                                        <td><span style={{ fontSize: 13 }}>{format(new Date(su.created_at), 'dd MMM yyyy')}</span></td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-red)' }} onClick={() => handleRemoveUser(su.id)} disabled={removingUserId === su.id}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showAddUser && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddUser(false); }}>
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <span className="modal-title">Assign User to {sub.name}</span>
                            <button className="modal-close" onClick={() => setShowAddUser(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Team Member</label>
                                    <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                                        <option value="" disabled>Select a user...</option>
                                        {team.filter(t => !sub.subscription_users?.some((su: any) => su.profile_id === t.id)).map(member => (
                                            <option key={member.id} value={member.id}>{member.full_name || member.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">App Role</label>
                                    <select className="form-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                                        <option value="user">User</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <p className="form-hint" style={{ marginTop: 6 }}>Managers and admins can view and edit usage data for this specific subscription.</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={addingUser || !selectedUserId}>
                                    {addingUser ? 'Assigning...' : 'Assign User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SubscriptionDetailPage() {
    return <Suspense fallback={<div className="page-content"><div className="spinner" /></div>}><SubscriptionDetail /></Suspense>;
}
