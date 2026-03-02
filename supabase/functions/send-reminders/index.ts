// send-reminders/index.ts
// Supabase Edge Function — runs on a daily cron schedule.
// Queries subscriptions renewing within remind_days_before windows and
// fires Telegram / Slack / Discord messages for each enabled integration.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ─── Notification dispatchers ─────────────────────────────────────────────────

async function sendTelegram(botToken: string, chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    if (!res.ok) {
        const err = await res.text();
        console.error('Telegram error:', err);
    }
}

async function sendSlack(webhookUrl: string, text: string) {
    const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) {
        const err = await res.text();
        console.error('Slack error:', err);
    }
}

async function sendDiscord(webhookUrl: string, text: string) {
    const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
    });
    if (!res.ok) {
        const err = await res.text();
        console.error('Discord error:', err);
    }
}

// ─── Message builder ──────────────────────────────────────────────────────────

function buildMessage(sub: Record<string, any>, daysUntil: number, orgName: string): string {
    const dateStr = new Date(sub.renewal_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const emoji = daysUntil === 0 ? '🚨' : daysUntil <= 3 ? '⚠️' : '🔔';
    const when = daysUntil === 0
        ? 'TODAY'
        : daysUntil === 1 ? 'tomorrow'
            : `in ${daysUntil} days`;

    return [
        `${emoji} <b>Renewal Alert — ${sub.name}</b>`,
        `📅 Renews <b>${when}</b> (${dateStr})`,
        `💰 Cost: <b>${sub.currency} ${sub.cost}/${sub.billing_cycle}</b>`,
        `🏷️ Category: ${sub.category ?? 'N/A'}`,
        `🏢 ${orgName}`,
        '',
        '▶ <a href="https://ahmedmubarak14.github.io/SubTrack/dashboard/subscriptions">View in SubTrack</a>',
    ].join('\n');
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all enabled integrations
    const { data: integrations, error: intErr } = await supabase
        .from('org_integrations')
        .select('*')
        .eq('enabled', true);

    if (intErr || !integrations?.length) {
        return new Response(JSON.stringify({ message: 'No enabled integrations', error: intErr }), { status: 200 });
    }

    let notificationsSent = 0;

    for (const integration of integrations) {
        const remindDays: number[] = integration.remind_days_before ?? [1, 7];
        const orgId = integration.org_id;

        // Fetch org name
        const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', orgId)
            .single();

        const orgName = org?.name ?? 'Your Organization';

        for (const daysBefore of remindDays) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysBefore);
            const targetStr = targetDate.toISOString().split('T')[0];

            // Find subscriptions renewing on targetDate for this org
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('org_id', orgId)
                .eq('renewal_date', targetStr)
                .neq('status', 'cancelled');

            if (!subs?.length) continue;

            for (const sub of subs) {
                // Dedup: skip if already sent today
                const { data: already } = await supabase
                    .from('notifications_sent')
                    .select('id')
                    .eq('subscription_id', sub.id)
                    .eq('integration_type', integration.type)
                    .eq('days_before', daysBefore)
                    .single();

                if (already) continue;

                const message = buildMessage(sub, daysBefore, orgName);

                try {
                    if (integration.type === 'telegram' && integration.bot_token && integration.chat_id) {
                        await sendTelegram(integration.bot_token, integration.chat_id, message);
                    } else if (integration.type === 'slack' && integration.webhook_url) {
                        // Slack doesn't support HTML, use plain text
                        await sendSlack(integration.webhook_url, message.replace(/<[^>]+>/g, ''));
                    } else if (integration.type === 'discord' && integration.webhook_url) {
                        // Discord supports markdown but not HTML
                        await sendDiscord(integration.webhook_url, message.replace(/<[^>]+>/g, ''));
                    }

                    // Record as sent
                    await supabase.from('notifications_sent').insert({
                        org_id: orgId,
                        subscription_id: sub.id,
                        integration_type: integration.type,
                        days_before: daysBefore,
                    });

                    notificationsSent++;
                } catch (err) {
                    console.error(`Failed to send ${integration.type} for ${sub.name}:`, err);
                }
            }
        }
    }

    return new Response(
        JSON.stringify({ success: true, notificationsSent }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
});
