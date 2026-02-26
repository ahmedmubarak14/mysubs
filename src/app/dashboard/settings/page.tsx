import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    let orgName = '';
    if (profile?.org_id) {
        const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.org_id).single();
        orgName = org?.name ?? '';
    }

    return (
        <SettingsClient
            profile={profile}
            orgName={orgName}
            orgId={profile?.org_id ?? null}
        />
    );
}
