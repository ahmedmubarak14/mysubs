import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sendSlack(webhookUrl: string, message: string): Promise<void> {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
    })
}

async function sendDiscord(webhookUrl: string, message: string): Promise<void> {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
    })
}

async function sendTelegram(botToken: string, chatId: string, message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    })
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const {
            orgId,
            subscriptionName,
            renewalDate,
            cost,
            currency,
            daysUntilRenewal,
        } = await req.json()

        if (!orgId) {
            return new Response(JSON.stringify({ error: 'Missing orgId' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { persistSession: false } }
        )

        // Fetch all enabled integrations for this org
        const { data: integrations, error } = await supabase
            .from('org_integrations')
            .select('*')
            .eq('org_id', orgId)
            .eq('enabled', true)

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        if (!integrations || integrations.length === 0) {
            return new Response(JSON.stringify({ sent: 0, message: 'No active integrations' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Build the alert message
        const urgency = daysUntilRenewal === 0
            ? '🚨 *TODAY*'
            : daysUntilRenewal === 1
                ? '⚠️ *TOMORROW*'
                : `📅 in *${daysUntilRenewal} days*`

        const message =
            `🔔 *SubTrack Renewal Alert*\n` +
            `*${subscriptionName}* renews ${urgency}\n` +
            `💰 Amount: *${cost} ${currency}*\n` +
            `📆 Date: ${renewalDate}`

        let sentCount = 0
        const errors: string[] = []

        for (const integration of integrations) {
            try {
                switch (integration.type) {
                    case 'slack':
                        if (integration.webhook_url) {
                            await sendSlack(integration.webhook_url, message)
                            sentCount++
                        }
                        break
                    case 'discord':
                        if (integration.webhook_url) {
                            await sendDiscord(integration.webhook_url, message)
                            sentCount++
                        }
                        break
                    case 'telegram':
                        if (integration.bot_token && integration.chat_id) {
                            await sendTelegram(integration.bot_token, integration.chat_id, message)
                            sentCount++
                        }
                        break
                    // Other integration types can be handled here in the future
                }
            } catch (e: any) {
                errors.push(`${integration.type}: ${e.message}`)
            }
        }

        return new Response(JSON.stringify({ sent: sentCount, errors }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
