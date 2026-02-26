import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const orgId = profile?.org_id;

    let subscriptions: any[] = [];
    let expenses: any[] = [];

    if (orgId) {
        const [subsResult, expResult] = await Promise.all([
            supabase.from('subscriptions').select('*, owner:profiles(full_name, email)').eq('org_id', orgId).order('renewal_date'),
            supabase.from('expenses').select('*').eq('org_id', orgId).order('expense_date', { ascending: false }).limit(5),
        ]);
        subscriptions = subsResult.data ?? [];
        expenses = expResult.data ?? [];
    }

    return (
        <DashboardClient
            profile={profile}
            subscriptions={subscriptions ?? []}
            expenses={expenses ?? []}
        />
    );
}
