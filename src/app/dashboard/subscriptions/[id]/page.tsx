import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { differenceInDays, format } from 'date-fns';
import { ArrowLeft, Edit2, Calendar, Users, DollarSign, Tag, Building2 } from 'lucide-react';

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('*, owner:profiles(full_name, email)')
        .eq('id', id)
        .single();

    if (!sub) notFound();

    const daysLeft = differenceInDays(new Date(sub.renewal_date), new Date());
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.billing_cycle === 'quarterly' ? sub.cost / 3 : sub.cost;

    const STATUS_COLORS: Record<string, string> = {
        active: '#22c55e', expiring: '#f97316', trial: '#3b82f6', cancelled: '#ef4444',
    };

    return (
        <div>
            <div className="topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/dashboard/subscriptions" className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                        <ArrowLeft size={16} />
                    </Link>
                    <span className="topbar-title">{sub.name}</span>
                    <span style={{ padding: '2px 10px', borderRadius: 6, background: `${STATUS_COLORS[sub.status]}20`, color: STATUS_COLORS[sub.status], fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                        {sub.status}
                    </span>
                </div>
                <div className="topbar-actions">
                    <Link href={`/dashboard/subscriptions/${id}/edit`} className="btn btn-primary">
                        <Edit2 size={15} /> Edit
                    </Link>
                </div>
            </div>

            <div className="page-content" style={{ maxWidth: 700 }}>
                {/* Header card with logo */}
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

                {/* Stat cards */}
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

                {/* Details */}
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
        </div>
    );
}
