import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeamClient from './TeamClient';

export default async function TeamPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const orgId = profile?.org_id;

    let members: any[] = [];
    let subscriptions: any[] = [];

    if (orgId) {
        const [membersResult, subsResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('org_id', orgId).order('full_name'),
            supabase.from('subscriptions').select('owner_id, cost, billing_cycle, seats').eq('org_id', orgId).neq('status', 'cancelled'),
        ]);
        members = membersResult.data ?? [];
        subscriptions = subsResult.data ?? [];
    }

    return (
        <TeamClient
            members={members ?? []}
            subscriptions={subscriptions ?? []}
            currentProfile={profile}
            orgId={orgId}
        />
    );
}
