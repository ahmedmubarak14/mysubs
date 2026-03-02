// send-webhook-alert/index.ts
// On-demand Supabase Edge Function triggered from the client when a user confirms a renewal.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function sendTelegram(botToken: string, chatId: string, text: string) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
}

async function sendSlack(webhookUrl: string, text: string) {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
}

async function sendDiscord(webhookUrl: string, text: string) {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
    });
}

Deno.serve(async (req) => {
    const { orgId, subscriptionName, renewalDate, cost, currency, daysUntilRenewal, eventType } = await req.json();

    const dateStr = new Date(renewalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let message = '';

    if (eventType === 'renewal_confirmed') {
        message = `✅ <b>Renewal Confirmed — ${subscriptionName}</b>\n📅 Next renewal: <b>${dateStr}</b>\n💰 <b>${currency} ${cost}</b>\n\n▶ <a href="https://ahmedmubarak14.github.io/SubTrack/dashboard/subscriptions">View in SubTrack</a>`;
    } else {
        const emoji = daysUntilRenewal <= 1 ? '🚨' : daysUntilRenewal <= 3 ? '⚠️' : '🔔';
        const when = daysUntilRenewal === 0 ? 'TODAY' : daysUntilRenewal === 1 ? 'tomorrow' : `in ${daysUntilRenewal} days`;
        message = `${emoji} <b>Renewal Alert — ${subscriptionName}</b>\n📅 Renews <b>${when}</b> (${dateStr})\n💰 Cost: <b>${currency} ${cost}</b>`;
    }

    const { data: integrations } = await supabase
        .from('org_integrations').select('*').eq('org_id', orgId).eq('enabled', true);

    if (!integrations?.length) {
        return new Response(JSON.stringify({ message: 'No integrations' }), { status: 200 });
    }

    const plain = message.replace(/<[^>]+>/g, '');
    await Promise.allSettled(integrations.map((i: Record<string, any>) => {
        if (i.type === 'telegram' && i.bot_token && i.chat_id) return sendTelegram(i.bot_token, i.chat_id, message);
        if (i.type === 'slack' && i.webhook_url) return sendSlack(i.webhook_url, plain);
        if (i.type === 'discord' && i.webhook_url) return sendDiscord(i.webhook_url, plain);
        return Promise.resolve();
    }));

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
