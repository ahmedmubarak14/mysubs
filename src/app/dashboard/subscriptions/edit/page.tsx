'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AddSubscriptionModal from '../AddSubscriptionModal';

function EditSubscriptionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const [data, setData] = useState<{ sub: any; orgId: string; teamMembers: any[] } | null | 'not-found'>(null);

    useEffect(() => {
        if (!id) { setData('not-found'); return; }
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const orgId = profile?.org_id ?? '';
            const [{ data: sub }, { data: teamMembers }] = await Promise.all([
                supabase.from('subscriptions').select('*').eq('id', id).single(),
                supabase.from('profiles').select('id, full_name, email, role, org_id, avatar_url, created_at').eq('org_id', orgId),
            ]);
            if (!sub) { setData('not-found'); return; }
            setData({ sub, orgId, teamMembers: teamMembers ?? [] });
        })();
    }, [id]);

    if (data === null) return <div className="page-content"><div className="spinner" /></div>;
    if (data === 'not-found') return <div className="page-content"><p>Subscription not found.</p></div>;

    return (
        <AddSubscriptionModal
            orgId={data.orgId}
            teamMembers={data.teamMembers}
            subscription={data.sub}
            onClose={() => router.push('/dashboard/subscriptions')}
        />
    );
}

export default function EditSubscriptionPage() {
    return <Suspense fallback={<div className="page-content"><div className="spinner" /></div>}><EditSubscriptionContent /></Suspense>;
}
