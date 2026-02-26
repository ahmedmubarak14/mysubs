'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SubscriptionsClient from './SubscriptionsClient';

export default function SubscriptionsPage() {
    const [data, setData] = useState<{ subscriptions: any[]; teamMembers: any[]; profile: any; orgId: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const orgId = profile?.org_id ?? '';
            let subscriptions: any[] = [], teamMembers: any[] = [];
            if (orgId) {
                const [s, m] = await Promise.all([
                    supabase.from('subscriptions').select('*, owner:profiles(id, full_name, email)').eq('org_id', orgId).order('renewal_date'),
                    supabase.from('profiles').select('id, full_name, email').eq('org_id', orgId),
                ]);
                subscriptions = s.data ?? [];
                teamMembers = m.data ?? [];
            }
            setData({ subscriptions, teamMembers, profile, orgId });
        })();
    }, []);

    if (!data) return <div className="page-content"><div className="spinner" /></div>;

    return <SubscriptionsClient subscriptions={data.subscriptions} teamMembers={data.teamMembers} currentProfile={data.profile} orgId={data.orgId} />;
}
