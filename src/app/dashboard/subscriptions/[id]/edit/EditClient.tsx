'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Subscription, Profile } from '@/types';
import AddSubscriptionModal from '../AddSubscriptionModal';

interface Props {
    sub: Subscription;
    orgId: string;
    teamMembers: Profile[];
}

export default function EditSubscriptionClient({ sub, orgId, teamMembers }: Props) {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <AddSubscriptionModal
            orgId={orgId}
            teamMembers={teamMembers}
            subscription={sub}
            onClose={handleClose}
        />
    );
}
