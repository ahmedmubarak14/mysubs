import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CalendarClient from './CalendarClient';

export default async function CalendarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const orgId = profile?.org_id;

    let subscriptions: any[] = [];
    if (orgId) {
        const { data } = await supabase.from('subscriptions').select('id, name, cost, currency, billing_cycle, renewal_date, status, seats').eq('org_id', orgId).neq('status', 'cancelled');
        subscriptions = data ?? [];
    }

    return <CalendarClient subscriptions={subscriptions} />;
}
