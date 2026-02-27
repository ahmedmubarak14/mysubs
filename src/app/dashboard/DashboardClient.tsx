'use client';

import { useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line
} from 'recharts';
import {
    CreditCard, TrendingUp, AlertTriangle, DollarSign,
    ArrowRight, Users
} from 'lucide-react';
import Link from 'next/link';
import type { Subscription, Expense, Profile } from '@/types';
import { CURRENCIES } from '@/types';
import styles from './dashboard.module.css';
import DashboardCalendar from '@/components/DashboardCalendar';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

interface Props {
    profile: Profile | null;
    subscriptions: Subscription[];
    expenses: Expense[];
}

const STATUS_COLORS: Record<string, string> = {
    active: 'var(--color-green)',
    expiring: 'var(--color-orange)',
    cancelled: 'var(--color-red)',
    trial: 'var(--color-blue)',
};

const PIE_COLORS = ['#864DB3', '#1F0434', '#DDFF55', '#2563EB', '#16A34A', '#D97706', '#DC2626'];

function formatCurrency(amount: number, currency = 'USD') {
    const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getStatusBadge(status: string) {
    const classes: Record<string, string> = {
        active: 'badge badge-green',
        expiring: 'badge badge-orange',
        cancelled: 'badge badge-red',
        trial: 'badge badge-blue',
    };
    return classes[status] ?? 'badge badge-gray';
}

function getDaysUntilRenewal(renewalDate: string) {
    return differenceInDays(parseISO(renewalDate), new Date());
}

export default function DashboardClient({ profile, subscriptions, expenses }: Props) {
    const { openPanel } = useNotifications();
    const activeSubs = subscriptions.filter(s => s.status !== 'cancelled');

    // Stat calculations
    const totalMonthly = useMemo(() => {
        return activeSubs.reduce((sum, s) => {
            if (s.billing_cycle === 'monthly') return sum + s.cost;
            if (s.billing_cycle === 'yearly') return sum + s.cost / 12;
            if (s.billing_cycle === 'quarterly') return sum + s.cost / 3;
            return sum;
        }, 0);
    }, [activeSubs]);

    const upcomingRenewals = useMemo(() => {
        return activeSubs
            .filter(s => {
                const days = getDaysUntilRenewal(s.renewal_date);
                return days >= 0 && days <= 30;
            })
            .sort((a, b) => getDaysUntilRenewal(a.renewal_date) - getDaysUntilRenewal(b.renewal_date));
    }, [activeSubs]);

    const spendChartData = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                month: format(d, 'MMM'),
                spend: totalMonthly * (0.85 + Math.random() * 0.3),
            });
        }
        return months;
    }, [totalMonthly]);

    const sparklineData = useMemo(() => {
        return Array.from({ length: 10 }).map((_, i) => ({ val: 50 + Math.random() * 50 + i * 5 }));
    }, []);

    // Category breakdown for pie chart
    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        activeSubs.forEach(s => {
            const monthCost = s.billing_cycle === 'yearly' ? s.cost / 12 : s.billing_cycle === 'quarterly' ? s.cost / 3 : s.cost;
            map[s.category] = (map[s.category] ?? 0) + monthCost;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
    }, [activeSubs]);

    const orgName = profile?.full_name ? `${profile.full_name.split(' ')[0]}'s Workspace` : 'Your Workspace';

    return (
        <div>
            <Topbar title="Dashboard" onToggleNotifications={openPanel}>
                <Link href="/dashboard/subscriptions" className="btn btn-primary btn-sm">
                    + Add Subscription
                </Link>
            </Topbar>

            <div className="page-content">
                {/* Welcome */}
                <div className={styles.welcomeRow}>
                    <div>
                        <h1 className={styles.welcomeTitle}>
                            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
                            {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
                        </h1>
                        <p className={styles.welcomeSub}>{orgName} · {activeSubs.length} active subscriptions</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="stat-grid">
                    <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.45)' }}>
                        <div className="stat-card-glow" style={{ background: '#864DB3', width: 140, height: 140, filter: 'blur(40px)', opacity: 0.2 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(134, 77, 179, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)', width: 40, height: 40, marginBottom: 0 }}>
                                <DollarSign size={20} color="var(--color-purple)" />
                            </div>
                            <div className="stat-card-label" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Monthly Spend</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div>
                                <div className="stat-card-value">{formatCurrency(totalMonthly)}</div>
                                <div className="stat-card-subtext" style={{ color: 'var(--color-green)', fontWeight: 600 }}>+4.2% from last month</div>
                            </div>
                            <div style={{ width: 80, height: 40, opacity: 0.8 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineData}>
                                        <Line type="monotone" dataKey="val" stroke="var(--color-purple)" strokeWidth={2.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.45)' }}>
                        <div className="stat-card-glow" style={{ background: 'var(--color-green)', width: 140, height: 140, filter: 'blur(40px)', opacity: 0.2 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(52, 199, 89, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)', width: 40, height: 40, marginBottom: 0 }}>
                                <CreditCard size={20} color="var(--color-green)" />
                            </div>
                            <div className="stat-card-label" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Active Subscriptions</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div>
                                <div className="stat-card-value">{activeSubs.filter(s => s.status === 'active').length}</div>
                                <div className="stat-card-subtext" style={{ fontWeight: 600 }}>{subscriptions.filter(s => s.status === 'trial').length} in trial</div>
                            </div>
                            <div style={{ width: 80, height: 40, opacity: 0.8 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineData}>
                                        <Line type="monotone" dataKey="val" stroke="var(--color-green)" strokeWidth={2.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.45)' }}>
                        <div className="stat-card-glow" style={{ background: 'var(--color-orange)', width: 140, height: 140, filter: 'blur(40px)', opacity: 0.2 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(255, 149, 0, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)', width: 40, height: 40, marginBottom: 0 }}>
                                <AlertTriangle size={20} color="var(--color-orange)" />
                            </div>
                            <div className="stat-card-label" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Renewing Soon</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div>
                                <div className="stat-card-value">{upcomingRenewals.length}</div>
                                <div className="stat-card-subtext" style={{ fontWeight: 600 }}>within the next 30 days</div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.45)' }}>
                        <div className="stat-card-glow" style={{ background: 'var(--color-blue)', width: 140, height: 140, filter: 'blur(40px)', opacity: 0.2 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div className="stat-card-icon" style={{ background: 'rgba(0, 122, 255, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)', width: 40, height: 40, marginBottom: 0 }}>
                                <TrendingUp size={20} color="var(--color-blue)" />
                            </div>
                            <div className="stat-card-label" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Annual Spend</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div>
                                <div className="stat-card-value">{formatCurrency(totalMonthly * 12)}</div>
                                <div className="stat-card-subtext" style={{ fontWeight: 600 }}>projected for this year</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className={styles.chartsRow}>
                    {/* Area Chart */}
                    <div className={`card ${styles.spendChart}`}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Monthly Spend</h3>
                            <span className="badge badge-green" style={{ fontSize: '11px' }}>Last 6 months</span>
                        </div>
                        {totalMonthly > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={spendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#864DB3" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#864DB3" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                    <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(0)}`, 'Spend']} contentStyle={{ borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: 13 }} />
                                    <Area type="monotone" dataKey="spend" stroke="#864DB3" strokeWidth={2.5} fill="url(#spendGrad)" dot={false} activeDot={{ r: 5, fill: '#864DB3' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px' }}>
                                <p>Add subscriptions to see your spend chart</p>
                            </div>
                        )}
                    </div>

                    {/* Pie Chart */}
                    <div className={`card ${styles.categoryChart}`}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>By Category</h3>
                        </div>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                                        dataKey="value" paddingAngle={3}>
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => [`$${v}`, 'Monthly']} contentStyle={{ borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: 13 }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px' }}>
                                <p>No categories yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className={styles.bottomRow}>
                    {/* Calendar View */}
                    <div style={{ flex: 1, minWidth: 320 }}>
                        <DashboardCalendar subscriptions={subscriptions} />
                    </div>

                    {/* All Subscriptions Table */}
                    <div className="card" style={{ flex: 2, padding: 0, overflow: 'hidden' }}>
                        <div className={styles.cardHeader} style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
                            <h3 className={styles.cardTitle}>Detailed Subscriptions</h3>
                            <Link href="/dashboard/subscriptions" className="btn btn-ghost btn-sm">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, marginTop: 'var(--space-4)' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>App / Service</th>
                                        <th>Cost</th>
                                        <th>Billing</th>
                                        <th>Renewal Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSubs.slice(0, 5).map(sub => (
                                        <tr key={sub.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    {sub.logo_url ? (
                                                        <img src={sub.logo_url} alt={sub.name} width={28} height={28} style={{ borderRadius: 8, objectFit: 'contain', border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', padding: 2 }} />
                                                    ) : (
                                                        <div className="icon-wrap-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontWeight: 800, fontSize: 13 }}>
                                                            {sub.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>{sub.name}</span>
                                                </div>
                                            </td>
                                            <td><span style={{ fontWeight: 700 }}>{formatCurrency(sub.cost, sub.currency)}</span></td>
                                            <td><span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{sub.billing_cycle}</span></td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{format(parseISO(sub.renewal_date), 'MMM d, yyyy')}</div>
                                            </td>
                                            <td>
                                                <span className={getStatusBadge(sub.status)} style={{ textTransform: 'capitalize' }}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
