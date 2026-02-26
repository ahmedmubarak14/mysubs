'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[] | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
            setNotifications(data ?? []);
            // Mark all as read
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
        })();
    }, []);

    if (notifications === null) return <div className="page-content"><div className="spinner" /></div>;

    return (
        <div>
            <div className="topbar">
                <span className="topbar-title">Notifications</span>
            </div>
            <div className="page-content" style={{ maxWidth: 640 }}>
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Bell size={28} /></div>
                        <h3>All caught up!</h3>
                        <p>No notifications yet. Renewal alerts will appear here.</p>
                        <Link href="/dashboard" className="btn btn-secondary btn-sm">Back to Dashboard</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {notifications.map((n: any) => (
                            <div key={n.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', opacity: n.is_read ? 0.7 : 1 }}>
                                <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)', marginTop: 2, flexShrink: 0 }}>
                                    {n.type === 'renewal_reminder' ? <Bell size={16} color="var(--color-purple)" /> : <CheckCircle2 size={16} color="var(--color-green)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{n.message}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0, marginTop: 6 }} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
