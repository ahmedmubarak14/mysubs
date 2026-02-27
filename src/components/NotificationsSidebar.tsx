'use client';

import { Bell, Check, X, ArrowUpRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function NotificationsSidebar({ open, onClose }: Props) {
    const [filter, setFilter] = useState('All');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;
        const supabase = createClient();

        async function fetchNotifs() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (data) setNotifications(data);

                // Mark seen
                await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
            }
            setLoading(false);
        }

        fetchNotifs();
    }, [open]);

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
                        {notifications.filter(n => !n.is_read).length > 0 && (
                            <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                                {notifications.filter(n => !n.is_read).length} New
                            </span>
                        )}
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
                    {loading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <Bell size={32} style={{ opacity: 0.2 }} />
                            All caught up!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {notifications.map(n => {
                                const date = new Date(n.created_at);
                                const timeStr = isToday(date) ? formatDistanceToNow(date, { addSuffix: true }) : isYesterday(date) ? 'Yesterday' : date.toLocaleDateString();

                                return (
                                    <div key={n.id} style={{
                                        background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: 16,
                                        padding: 16, position: 'relative', display: 'flex', gap: 14,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
                                        opacity: n.is_read ? 0.7 : 1
                                    }}>
                                        {!n.is_read && <div style={{ position: 'absolute', top: 16, right: 16, width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: getColor(n.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, paddingRight: 10 }}>Notification</div>
                                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{timeStr}</div>

                                            {/* Action Buttons conditionally */}
                                            {n.type === 'renewal_reminder' && (
                                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 12px', fontSize: 12 }}>Review</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
