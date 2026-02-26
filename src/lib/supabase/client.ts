'use client';
import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const IS_CONFIGURED = SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('your_supabase');

export function createClient() {
    if (!IS_CONFIGURED) {
        // Return a mock-like proxy so the UI renders without crashing in dev
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signInWithPassword: async () => ({ error: { message: 'Supabase not configured. Add your .env.local credentials.' } }),
                signInWithOAuth: async () => ({ error: null }),
                signOut: async () => ({}),
            },
            from: () => ({
                select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ data: [], error: null }), limit: () => ({ data: [], error: null }) }), neq: () => ({ data: [], error: null }) }),
                insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
                update: () => ({ eq: () => ({ data: null, error: null }) }),
                delete: () => ({ eq: async () => ({ error: null }) }),
            }),
        } as any;
    }
    return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
