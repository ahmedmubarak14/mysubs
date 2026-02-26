'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import CalendarClient from './CalendarClient';

export default function CalendarPage() {
    const [subscriptions, setSubscriptions] = useState<any[] | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
            const orgId = profile?.org_id;
            if (orgId) {
                const { data } = await supabase
                    .from('subscriptions')
                    .select('id, name, cost, currency, billing_cycle, renewal_date, status, seats')
                    .eq('org_id', orgId)
                    .neq('status', 'cancelled');
                setSubscriptions(data ?? []);
            } else {
                setSubscriptions([]);
            }
        })();
    }, []);

    if (subscriptions === null) return <div className="page-content"><div className="spinner" /></div>;

    return <CalendarClient subscriptions={subscriptions} />;
}
