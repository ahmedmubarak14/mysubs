'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
    const [data, setData] = useState<{ profile: any; subscriptions: any[]; expenses: any[] } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const orgId = profile?.org_id;
            let subscriptions: any[] = [], expenses: any[] = [];
            if (orgId) {
                const [s, e] = await Promise.all([
                    supabase.from('subscriptions').select('*, owner:profiles(full_name, email)').eq('org_id', orgId).order('renewal_date'),
                    supabase.from('expenses').select('*').eq('org_id', orgId).order('expense_date', { ascending: false }).limit(5),
                ]);
                subscriptions = s.data ?? [];
                expenses = e.data ?? [];
            }
            setData({ profile, subscriptions, expenses });
        })();
    }, []);

    if (!data) return <div className="page-content"><div className="spinner" /></div>;

    return <DashboardClient profile={data.profile} subscriptions={data.subscriptions} expenses={data.expenses} />;
}
