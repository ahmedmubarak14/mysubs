'use client';

import { Bell, Check, X, ArrowUpRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function NotificationsSidebar({ open, onClose }: Props) {
    const [filter, setFilter] = useState('All');

    // Mock data based on the requested design
    const notifications = [
        { id: 1, type: 'price_hike', title: 'Salesforce CRM', desc: 'Price increasing by 8%. New monthly: $1,250 (+$92)', time: 'TODAY', unread: true },
        { id: 2, type: 'renewal', title: 'Figma Professional', desc: 'Renewal in 2 days • $144.00', time: 'TODAY', unread: true },
        { id: 3, type: 'trial', title: 'Notion AI', desc: 'Trial ended yesterday. Auto-converted to Pro', time: 'YESTERDAY', unread: false },
        { id: 4, type: 'added', title: 'Linear', desc: 'New seat added by @sarah_j. Total seats: 12', time: 'YESTERDAY', unread: false },
        { id: 5, type: 'error', title: 'QuickBooks Sync', desc: 'Sync failed 2 hours ago', time: 'YESTERDAY', unread: false },
    ];

    const getIcon = (type: string) => {
        if (type === 'price_hike') return <ArrowUpRight size={14} color="var(--color-red)" />;
        if (type === 'renewal') return <Bell size={14} color="var(--color-orange)" />;
        if (type === 'trial') return <AlertCircle size={14} color="var(--color-blue)" />;
        if (type === 'added') return <Plus size={14} color="var(--color-green)" />;
        if (type === 'error') return <RefreshCw size={14} color="var(--color-purple)" />;
        return <Bell size={14} />;
    };

    const getColor = (type: string) => {
        if (type === 'price_hike') return 'var(--color-red-bg)';
        if (type === 'renewal') return 'var(--color-orange-bg)';
        if (type === 'trial') return 'var(--color-blue-bg)';
        if (type === 'added') return 'var(--color-green-bg)';
        if (type === 'error') return 'var(--color-purple-bg)';
        return 'var(--color-bg-secondary)';
    };

    if (!open) return null;

    return (
        <>
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)'
                }}
                onClick={onClose}
            />
            <div
                style={{
                    position: 'fixed', top: 12, bottom: 12, right: 12, width: 380, zIndex: 9999,
                    background: 'var(--color-bg-secondary)', backdropFilter: 'blur(60px) saturate(200%)', WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                    border: '1px solid var(--color-border-glass)', borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column',
                    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Notifications</h2>
                        <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>5 New</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><Check size={16} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={onClose}><X size={16} /></button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ padding: '16px 24px', display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--color-border)' }}>
                    {['All', 'Renewals', 'Price Hikes', 'Trials'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: filter === f ? 'var(--color-accent)' : 'transparent',
                                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                                border: filter === f ? 'none' : '1px solid var(--color-border)',
                                transition: 'all 0.2s', whiteSpace: 'nowrap'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {['TODAY', 'YESTERDAY'].map(group => (
                        <div key={group} style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', marginBottom: 12 }}>{group}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {notifications.filter(n => n.time === group).map(n => (
                                    <div key={n.id} style={{
                                        background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: 16,
                                        padding: 16, position: 'relative', display: 'flex', gap: 14,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)'
                                    }}>
                                        {n.unread && <div style={{ position: 'absolute', top: 16, right: 16, width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: getColor(n.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, paddingRight: 10 }}>{n.title}</div>
                                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.desc}</div>

                                            {/* Action Buttons Mock */}
                                            {n.type === 'renewal' && (
                                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                                    <button className="btn btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: 12 }}>Approve</button>
                                                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 12px', fontSize: 12 }}>Review</button>
                                                </div>
                                            )}
                                            {n.type === 'price_hike' && (
                                                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 12px', fontSize: 12, marginTop: 12, width: '100%', justifyContent: 'center' }}>See Details</button>
                                            )}
                                            {n.type === 'trial' && (
                                                <div style={{ color: 'var(--color-accent)', fontSize: 12, fontWeight: 600, marginTop: 8, cursor: 'pointer' }}>Manage</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                        View All Notifications <ArrowUpRight size={16} style={{ marginLeft: 4 }} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
