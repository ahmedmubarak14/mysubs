import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const IS_CONFIGURED = SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('your_supabase');

export async function createClient() {
    if (!IS_CONFIGURED) {
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: null }),
                        order: () => ({ data: [], error: null }),
                        limit: () => ({ data: [], error: null }),
                        neq: () => ({ data: [], error: null }),
                    }),
                    neq: () => ({ data: [], error: null }),
                }),
                update: () => ({ eq: async () => ({ error: null }) }),
                insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
            }),
        } as any;
    }

    const cookieStore = await cookies();
    return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
        cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch { }
            },
        },
    });
}
