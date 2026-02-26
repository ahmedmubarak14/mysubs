import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ExpensesClient from './ExpensesClient';

export default async function ExpensesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const orgId = profile?.org_id;

    let expenses: any[] = [];
    if (orgId) {
        const { data } = await supabase
            .from('expenses')
            .select('*, submitter:profiles(id, full_name, email)')
            .eq('org_id', orgId)
            .order('expense_date', { ascending: false });
        expenses = data ?? [];
    }

    return <ExpensesClient expenses={expenses} orgId={orgId} profile={profile} />;
}
