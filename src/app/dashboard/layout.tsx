'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/Sidebar';
import NotificationsSidebar from '@/components/NotificationsSidebar';
import type { Profile } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(async (result: { data: { user: any } }) => {
            const user = result.data.user;
            if (!user) {
                router.replace('/login');
                return;
            }
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(data as Profile | null);
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="app-shell">
            <Sidebar profile={profile} onToggleNotifications={() => setShowNotifications(true)} />
            <div className="main-content">
                {children}
            </div>
            <NotificationsSidebar open={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
    );
}
