import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SubscriptionsClient from './SubscriptionsClient';

export default async function SubscriptionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const orgId = profile?.org_id;

    let subscriptions: any[] = [];
    let teamMembers: any[] = [];

    if (orgId) {
        const [subsResult, membersResult] = await Promise.all([
            supabase.from('subscriptions').select('*, owner:profiles(id, full_name, email)').eq('org_id', orgId).order('renewal_date'),
            supabase.from('profiles').select('id, full_name, email').eq('org_id', orgId),
        ]);
        subscriptions = subsResult.data ?? [];
        teamMembers = membersResult.data ?? [];
    }

    return (
        <SubscriptionsClient
            subscriptions={subscriptions}
            teamMembers={teamMembers}
            currentProfile={profile}
            orgId={orgId ?? ''}
        />
    );
}
