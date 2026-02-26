'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SettingsClient from './SettingsClient';

export default function SettingsPage() {
    const [data, setData] = useState<{ profile: any; orgName: string; orgId: string | null } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            let orgName = '';
            if (profile?.org_id) {
                const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.org_id).single();
                orgName = org?.name ?? '';
            }
            setData({ profile, orgName, orgId: profile?.org_id ?? null });
        })();
    }, []);

    if (!data) return <div className="page-content"><div className="spinner" /></div>;

    return <SettingsClient profile={data.profile} orgName={data.orgName} orgId={data.orgId} />;
}
