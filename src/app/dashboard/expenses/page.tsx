'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ExpensesClient from './ExpensesClient';

export default function ExpensesPage() {
    const [data, setData] = useState<{ expenses: any[]; orgId: string; profile: any } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const orgId = profile?.org_id ?? '';
            let expenses: any[] = [];
            if (orgId) {
                const { data } = await supabase
                    .from('expenses')
                    .select('*, submitter:profiles(id, full_name, email)')
                    .eq('org_id', orgId)
                    .order('expense_date', { ascending: false });
                expenses = data ?? [];
            }
            setData({ expenses, orgId, profile });
        })();
    }, []);

    if (!data) return <div className="page-content"><div className="spinner" /></div>;

    return <ExpensesClient expenses={data.expenses} orgId={data.orgId} profile={data.profile} />;
}
