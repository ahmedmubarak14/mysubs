'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import TeamClient from './TeamClient';

export default function TeamPage() {
    const [data, setData] = useState<{ members: any[]; subscriptions: any[]; profile: any; orgId: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const orgId = profile?.org_id ?? '';
            let members: any[] = [], subscriptions: any[] = [];
            if (orgId) {
                const [m, s] = await Promise.all([
                    supabase.from('profiles').select('*').eq('org_id', orgId).order('full_name'),
                    supabase.from('subscriptions').select('owner_id, cost, billing_cycle, seats').eq('org_id', orgId).neq('status', 'cancelled'),
                ]);
                members = m.data ?? [];
                subscriptions = s.data ?? [];
            }
            setData({ members, subscriptions, profile, orgId });
        })();
    }, []);

    if (!data) return <div className="page-content"><div className="spinner" /></div>;

    return <TeamClient members={data.members} subscriptions={data.subscriptions} currentProfile={data.profile} orgId={data.orgId} />;
}
