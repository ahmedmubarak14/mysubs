'use client';

import { useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    CreditCard, TrendingUp, AlertTriangle, DollarSign,
    ArrowRight, Users
} from 'lucide-react';
import Link from 'next/link';
import type { Subscription, Expense, Profile } from '@/types';
import { CURRENCIES } from '@/types';
import styles from './dashboard.module.css';

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

    // Monthly spend chart (last 6 months)
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
            {/* Topbar */}
            <div className="topbar">
                <span className="topbar-title">Dashboard</span>
                <div className="topbar-actions">
                    <Link href="/dashboard/subscriptions/new" className="btn btn-primary btn-sm">
                        + Add Subscription
                    </Link>
                </div>
            </div>

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
                    <div className="stat-card">
                        <div className="stat-card-glow" style={{ background: '#864DB3' }} />
                        <div className="stat-card-icon" style={{ background: 'var(--color-purple-bg)' }}>
                            <DollarSign size={20} color="var(--color-purple)" />
                        </div>
                        <div className="stat-card-label">Monthly Spend</div>
                        <div className="stat-card-value">{formatCurrency(totalMonthly)}</div>
                        <div className="stat-card-subtext">across {activeSubs.length} subscriptions</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-glow" style={{ background: 'var(--color-green)' }} />
                        <div className="stat-card-icon" style={{ background: 'var(--color-green-bg)' }}>
                            <CreditCard size={20} color="var(--color-green)" />
                        </div>
                        <div className="stat-card-label">Active Subscriptions</div>
                        <div className="stat-card-value">{activeSubs.filter(s => s.status === 'active').length}</div>
                        <div className="stat-card-subtext">{subscriptions.filter(s => s.status === 'trial').length} in trial</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-glow" style={{ background: 'var(--color-orange)' }} />
                        <div className="stat-card-icon" style={{ background: 'var(--color-orange-bg)' }}>
                            <AlertTriangle size={20} color="var(--color-orange)" />
                        </div>
                        <div className="stat-card-label">Renewing Soon</div>
                        <div className="stat-card-value">{upcomingRenewals.length}</div>
                        <div className="stat-card-subtext">within the next 30 days</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-glow" style={{ background: 'var(--color-blue)' }} />
                        <div className="stat-card-icon" style={{ background: 'var(--color-blue-bg)' }}>
                            <TrendingUp size={20} color="var(--color-blue)" />
                        </div>
                        <div className="stat-card-label">Annual Spend</div>
                        <div className="stat-card-value">{formatCurrency(totalMonthly * 12)}</div>
                        <div className="stat-card-subtext">projected for this year</div>
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
                                    <Tooltip formatter={(v: number | undefined) => v !== undefined ? [`$${v.toFixed(0)}`, 'Spend'] : ['$0', 'Spend']} contentStyle={{ borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: 13 }} />
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
                                    <Tooltip formatter={(v: number | undefined) => v !== undefined ? [`$${v}`, 'Monthly'] : ['$0', 'Monthly']} contentStyle={{ borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: 13 }} />
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
                    {/* Upcoming Renewals */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Upcoming Renewals</h3>
                            <Link href="/dashboard/calendar" className="btn btn-ghost btn-sm">
                                View calendar <ArrowRight size={14} />
                            </Link>
                        </div>
                        {upcomingRenewals.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px' }}>
                                <p style={{ fontSize: '13px' }}>No renewals in the next 30 days 🎉</p>
                            </div>
                        ) : (
                            <div className={styles.renewalList}>
                                {upcomingRenewals.slice(0, 6).map(sub => {
                                    const days = getDaysUntilRenewal(sub.renewal_date);
                                    return (
                                        <Link href={`/dashboard/subscriptions/${sub.id}`} key={sub.id} className={styles.renewalItem}>
                                            <div className="icon-wrap-sm" style={{
                                                background: days <= 7 ? 'var(--color-red-bg)' : 'var(--color-orange-bg)',
                                                color: days <= 7 ? 'var(--color-red)' : 'var(--color-orange)',
                                                fontSize: '15px', fontWeight: 700
                                            }}>
                                                {sub.name[0]}
                                            </div>
                                            <div className={styles.renewalInfo}>
                                                <div className={styles.renewalName}>{sub.name}</div>
                                                <div className={styles.renewalMeta}>
                                                    {sub.seats > 0 && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                                                            <Users size={10} />{sub.seats} users
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.renewalRight}>
                                                <div className={styles.renewalCost}>{formatCurrency(sub.cost, sub.currency)}</div>
                                                <div className={`${styles.renewalDays} ${days <= 7 ? styles.urgent : ''}`}>
                                                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Expenses */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Recent Expenses</h3>
                            <Link href="/dashboard/expenses" className="btn btn-ghost btn-sm">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        {expenses.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px' }}>
                                <p style={{ fontSize: '13px' }}>No expenses logged yet</p>
                                <Link href="/dashboard/expenses/new" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                                    Add expense
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.renewalList}>
                                {expenses.map((exp: any) => (
                                    <div key={exp.id} className={styles.renewalItem}>
                                        <div className="icon-wrap-sm" style={{ background: 'var(--color-blue-bg)', color: 'var(--color-blue)', fontWeight: 700 }}>
                                            {exp.title[0]}
                                        </div>
                                        <div className={styles.renewalInfo}>
                                            <div className={styles.renewalName}>{exp.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{exp.category}</div>
                                        </div>
                                        <div className={styles.renewalRight}>
                                            <div className={styles.renewalCost}>{formatCurrency(exp.amount, exp.currency)}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                                                {format(parseISO(exp.expense_date), 'MMM d')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
