import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email, role, orgId } = await req.json();

        if (!email || !role || !orgId) {
            return NextResponse.json({ error: 'email, role, and orgId are required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                org_id: orgId,
                role: role,
            },
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Pre-create the profile entry so they show up in Team immediately
        await supabaseAdmin.from('profiles').upsert({
            id: data.user.id,
            org_id: orgId,
            email: email,
            full_name: email.split('@')[0],
            role: role,
        }, { onConflict: 'id' });

        return NextResponse.json({ success: true, userId: data.user.id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
    }
}
