import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import EditClient from './EditClient';

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const orgId = profile?.org_id ?? '';

    const { data: sub } = await supabase.from('subscriptions').select('*').eq('id', id).single();
    if (!sub) notFound();

    const { data: teamMembers } = await supabase
        .from('profiles').select('id, full_name, email, role, org_id, avatar_url, created_at, email').eq('org_id', orgId);

    return (
        <EditClient
            sub={sub}
            orgId={orgId}
            teamMembers={teamMembers ?? []}
        />
    );
}
