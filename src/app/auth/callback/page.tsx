'use client';
// Auth callback is handled client-side for static export.
// Supabase automatically handles the OAuth/magic-link redirect
// via the browser client when the page loads with the token in the URL.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
            const session = data.session;
            if (session) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        });
    }, [router]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="spinner" />
        </div>
    );
}
