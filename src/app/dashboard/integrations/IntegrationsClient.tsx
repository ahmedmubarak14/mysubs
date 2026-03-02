'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';
import { CheckCircle2, Circle, ExternalLink, Search, X, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Brand SVG Icons ──────────────────────────────────────────────────────────

const SlackIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
        <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
        <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
        <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
        <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#2CA5E0" />
        <path d="M5.5 11.8l10-4.3-1.8 9-3-2.5-1.7 1.6.4-3.2 4.2-3.9-5.3 3.3-2.8-1z" fill="white" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" fill="#5865F2" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" fill="#25D366" />
    </svg>
);

const GithubIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="#181717" />
    </svg>
);

const JiraIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005z" fill="#2684FF" />
        <path d="M6.208 6.337H17.77a5.215 5.215 0 0 1-5.215-5.215H6.207a1.004 1.004 0 0 0-1.004 1.005V7.68a5.217 5.217 0 0 0 5.215 5.198h2.136v2.057A5.215 5.215 0 0 0 17.77 20.15V7.34a1.003 1.003 0 0 0-1.003-1.003H6.208z" fill="url(#jg1)" />
        <path d="M11.993 1.122H23.556A5.215 5.215 0 0 1 18.34 6.337h-2.135v2.057A5.213 5.213 0 0 1 11.993 12.605V2.127a1.005 1.005 0 0 1 1.004-1.005H11.993z" fill="url(#jg2)" />
        <defs>
            <linearGradient id="jg1" x1="17.52" y1="6.41" x2="12.25" y2="11.68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0052CC" /><stop offset="100%" stopColor="#2684FF" />
            </linearGradient>
            <linearGradient id="jg2" x1="12.25" y1="1.2" x2="17.52" y2="6.47" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0052CC" /><stop offset="100%" stopColor="#2684FF" />
            </linearGradient>
        </defs>
    </svg>
);

const ZapierIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.09 13.636h-3.455l2.454 2.454-1.273 1.273-2.454-2.454v3.455h-1.8v-3.455l-2.455 2.454-1.273-1.273 2.455-2.454H5.835v-1.8h3.454L6.835 9.382l1.273-1.272 2.455 2.454V7.091h1.8v3.454l2.454-2.455 1.273 1.273-2.455 2.454H17.09v1.8z" fill="#FF4A00" />
    </svg>
);

const PagerDutyIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M15.999 0H8.001C3.582 0 0 3.582 0 8.001v7.998C0 20.418 3.582 24 8.001 24h7.998C20.418 24 24 20.418 24 15.999V8.001C24 3.582 20.418 0 15.999 0zM8.5 19H7v-7h1.5V19zm-.75-8.25a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25zM17 11.5c0 2.485-2.015 4.5-4.5 4.5H11v3h-1.5V5H12.5C14.985 5 17 7.015 17 9.5V11.5zm-4.5-5H11v8h1.5C14.157 14.5 15.5 13.157 15.5 11.5V9.5C15.5 7.843 14.157 6.5 12.5 6.5z" fill="#25C151" />
    </svg>
);

// ── Integration Definitions ───────────────────────────────────────────────────

type IntegrationType = 'slack' | 'telegram' | 'discord' | 'whatsapp' | 'github' | 'jira' | 'zapier' | 'pagerduty';

interface IntegrationDef {
    id: IntegrationType;
    name: string;
    desc: string;
    icon: React.FC;
    category: string;
    docsUrl?: string;
    badge?: 'popular' | 'new';
    fields: IntegrationField[];
}

interface IntegrationField {
    key: 'webhook_url' | 'bot_token' | 'chat_id';
    label: string;
    placeholder: string;
    hint?: string;
}

const INTEGRATIONS: IntegrationDef[] = [
    {
        id: 'slack', name: 'Slack',
        desc: 'Get renewal alerts and budget reports directly in your Slack channels.',
        icon: SlackIcon, category: 'Communication', docsUrl: 'https://api.slack.com/messaging/webhooks', badge: 'popular',
        fields: [{ key: 'webhook_url', label: 'Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/...', hint: 'Create one at api.slack.com → Your Apps → Incoming Webhooks' }],
    },
    {
        id: 'telegram', name: 'Telegram',
        desc: 'Receive instant notifications via Telegram bot.',
        icon: TelegramIcon, category: 'Communication', docsUrl: 'https://core.telegram.org/bots',
        fields: [
            { key: 'bot_token', label: 'Bot Token', placeholder: '123456:ABC-DEF...', hint: 'Get from @BotFather on Telegram' },
            { key: 'chat_id', label: 'Chat ID', placeholder: '-1001234567890', hint: 'Use @userinfobot to find your chat ID' },
        ],
    },
    {
        id: 'discord', name: 'Discord',
        desc: 'Post subscription updates to any Discord server channel.',
        icon: DiscordIcon, category: 'Communication', docsUrl: 'https://discord.com/developers/docs/resources/webhook',
        fields: [{ key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://discord.com/api/webhooks/...', hint: 'Create in your Discord channel settings → Integrations → Webhooks' }],
    },
    {
        id: 'whatsapp', name: 'WhatsApp',
        desc: 'Send WhatsApp alerts when a subscription is about to renew.',
        icon: WhatsAppIcon, category: 'Communication', badge: 'new',
        fields: [{ key: 'webhook_url', label: 'WhatsApp API Webhook URL', placeholder: 'https://...', hint: 'Requires WhatsApp Business API access' }],
    },
    {
        id: 'github', name: 'GitHub',
        desc: 'Link subscriptions to repos and track dev tool spending per project.',
        icon: GithubIcon, category: 'Developer Tools', docsUrl: 'https://github.com',
        fields: [{ key: 'webhook_url', label: 'GitHub Webhook URL (optional)', placeholder: 'https://...', hint: 'For receiving GitHub events' }],
    },
    {
        id: 'jira', name: 'Jira',
        desc: 'Sync team changes with Jira boards and create tickets automatically.',
        icon: JiraIcon, category: 'Developer Tools', docsUrl: 'https://developer.atlassian.com/',
        fields: [{ key: 'webhook_url', label: 'Jira Webhook URL', placeholder: 'https://yourorg.atlassian.net/...', hint: 'Set up in Jira System → Webhooks' }],
    },
    {
        id: 'zapier', name: 'Zapier',
        desc: 'Automate workflows with 5,000+ apps using Zapier triggers.',
        icon: ZapierIcon, category: 'Automation', docsUrl: 'https://zapier.com/apps/webhook', badge: 'popular',
        fields: [{ key: 'webhook_url', label: 'Zapier Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...', hint: 'From a Zapier Zap using the Webhooks app' }],
    },
    {
        id: 'pagerduty', name: 'PagerDuty',
        desc: 'Escalate critical renewal and budget alerts through PagerDuty.',
        icon: PagerDutyIcon, category: 'Automation', docsUrl: 'https://developer.pagerduty.com/',
        fields: [{ key: 'webhook_url', label: 'PagerDuty Events API URL', placeholder: 'https://events.pagerduty.com/...', hint: 'From PagerDuty → Services → Integrations → Events API v2' }],
    },
];

const CATEGORY_ORDER = ['Communication', 'Developer Tools', 'Automation'];

// ── Types ─────────────────────────────────────────────────────────────────────
interface DbIntegration {
    id: string;
    type: IntegrationType;
    webhook_url?: string;
    bot_token?: string;
    chat_id?: string;
    enabled: boolean;
    remind_days_before?: number[];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IntegrationsClient() {
    const { t } = useLanguage();
    const { openPanel } = useNotifications();
    const supabase = createClient();

    const [dbIntegrations, setDbIntegrations] = useState<DbIntegration[]>([]);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Connect modal state
    const [modalIntegration, setModalIntegration] = useState<IntegrationDef | null>(null);
    const [modalValues, setModalValues] = useState<Record<string, string>>({});
    const [remindDays, setRemindDays] = useState<number[]>([1, 7]); // reminder days selection
    const [modalSaving, setModalSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    // Load data
    const loadIntegrations = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
        if (!profile?.org_id) return;
        setOrgId(profile.org_id);
        const { data } = await supabase.from('org_integrations').select('*').eq('org_id', profile.org_id);
        setDbIntegrations(data ?? []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { loadIntegrations(); }, [loadIntegrations]);

    const getDbRecord = (id: IntegrationType) => dbIntegrations.find(d => d.type === id);
    const isConnected = (id: IntegrationType) => !!getDbRecord(id)?.enabled;

    const openConnectModal = (integration: IntegrationDef) => {
        const existing = getDbRecord(integration.id);
        const prefilled: Record<string, string> = {};
        integration.fields.forEach(f => { prefilled[f.key] = (existing as any)?.[f.key] ?? ''; });
        setModalValues(prefilled);
        setRemindDays((existing?.remind_days_before && existing.remind_days_before.length > 0)
            ? existing.remind_days_before
            : [1, 7]);
        setModalError('');
        setModalIntegration(integration);
    };

    const handleDisconnect = async (id: IntegrationType) => {
        if (!orgId) return;
        await supabase.from('org_integrations').update({ enabled: false }).eq('org_id', orgId).eq('type', id);
        setDbIntegrations(prev => prev.map(d => d.type === id ? { ...d, enabled: false } : d));
    };

    const handleSaveConnection = async () => {
        if (!modalIntegration || !orgId) return;
        setModalSaving(true);
        setModalError('');

        const payload: any = {
            org_id: orgId,
            type: modalIntegration.id,
            enabled: true,
            remind_days_before: remindDays,
            ...modalValues,
        };

        const { error } = await supabase.from('org_integrations').upsert(payload, { onConflict: 'org_id,type' });
        setModalSaving(false);
        if (error) { setModalError(error.message); return; }

        await loadIntegrations();
        setModalIntegration(null);
    };

    const filtered = INTEGRATIONS.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.desc.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = CATEGORY_ORDER.reduce<Record<string, IntegrationDef[]>>((acc, cat) => {
        const items = filtered.filter(i => i.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {});

    const connectedCount = dbIntegrations.filter(d => d.enabled).length;

    return (
        <div>
            <Topbar title={t('nav_integrations')} onToggleNotifications={openPanel} />

            <div className="page-content">
                {/* Stats */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {[
                        { emoji: '⚡', value: INTEGRATIONS.length, label: 'Available', color: 'var(--color-purple)', bg: 'var(--color-purple-bg)' },
                        { emoji: '✅', value: connectedCount, label: 'Connected', color: 'var(--color-green)', bg: 'var(--color-green-bg)' },
                        { emoji: '🔔', value: INTEGRATIONS.length - connectedCount, label: 'Not connected', color: 'var(--color-orange)', bg: 'var(--color-orange-bg)' },
                    ].map(({ emoji, value, label, color, bg }) => (
                        <div key={label} className="card" style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji}</div>
                            <div>
                                <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color }}>{value}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
                    <Search size={16} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
                    <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations…" style={{ paddingLeft: 38 }} />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-purple)' }} />
                    </div>
                ) : (
                    <>
                        {/* Integration Groups */}
                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category} style={{ marginBottom: 'var(--space-8)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>{category}</div>
                                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                                    {items.map(integration => {
                                        const connected = isConnected(integration.id);
                                        return (
                                            <div key={integration.id} className="card" style={{
                                                display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
                                                padding: '20px', position: 'relative', overflow: 'hidden',
                                                border: connected ? '1.5px solid var(--color-green)' : '1.5px solid var(--color-border)',
                                                transition: 'border-color 0.2s',
                                            }}>
                                                {connected && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--color-green), var(--color-accent))' }} />}

                                                {integration.badge && (
                                                    <span style={{
                                                        position: 'absolute', top: 12, right: 12,
                                                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                        padding: '2px 8px', borderRadius: 20,
                                                        background: integration.badge === 'popular' ? 'var(--color-purple-bg)' : 'var(--color-orange-bg)',
                                                        color: integration.badge === 'popular' ? 'var(--color-purple)' : 'var(--color-orange)',
                                                    }}>{integration.badge}</span>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <integration.icon />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{integration.name}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{integration.category}</div>
                                                    </div>
                                                    {connected && <CheckCircle2 size={18} style={{ color: 'var(--color-green)', flexShrink: 0 }} />}
                                                </div>

                                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>{integration.desc}</p>

                                                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => connected ? handleDisconnect(integration.id) : openConnectModal(integration)}
                                                        style={{
                                                            flex: 1, padding: '8px 0', borderRadius: 8,
                                                            border: connected ? '1.5px solid var(--color-red)' : '1.5px solid var(--color-purple)',
                                                            background: connected ? 'var(--color-red-bg)' : 'var(--color-purple-bg)',
                                                            color: connected ? 'var(--color-red)' : 'var(--color-purple)',
                                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        {connected ? <><X size={14} /> Disconnect</> : <><Circle size={14} /> Connect</>}
                                                    </button>
                                                    {integration.docsUrl && (
                                                        <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer"
                                                            style={{
                                                                padding: '8px 12px', borderRadius: 8,
                                                                border: '1.5px solid var(--color-border)', background: 'transparent',
                                                                color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600,
                                                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            <ExternalLink size={14} /> Docs
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
                                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No integrations found</div>
                                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>Try a different search term</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Connect Modal */}
            {modalIntegration && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden' }}>
                        {/* Modal header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <modalIntegration.icon />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 17 }}>Connect {modalIntegration.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Enter your credentials below</div>
                            </div>
                            <button type="button" onClick={() => setModalIntegration(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {modalError && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--color-red-bg)', color: 'var(--color-red)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                                    {modalError}
                                </div>
                            )}

                            {modalIntegration.fields.map(field => (
                                <div key={field.key} className="form-group">
                                    <label className="form-label">{field.label}</label>
                                    <input
                                        className="form-input"
                                        value={modalValues[field.key] ?? ''}
                                        onChange={e => setModalValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                    />
                                    {field.hint && <span className="form-hint">{field.hint}</span>}
                                </div>
                            ))}

                            {/* Reminder timing */}
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: 10 }}>Remind me before renewal</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {[1, 3, 7, 14, 30].map(day => {
                                        const on = remindDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setRemindDays(prev =>
                                                    on ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
                                                )}
                                                style={{
                                                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                                    border: on ? '1.5px solid var(--color-purple)' : '1.5px solid var(--color-border)',
                                                    background: on ? 'var(--color-purple-bg)' : 'transparent',
                                                    color: on ? 'var(--color-purple)' : 'var(--color-text-secondary)',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {day === 1 ? '1 day' : `${day} days`}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="form-hint">You'll receive an alert on each selected day before the renewal date.</span>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setModalIntegration(null)}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSaveConnection}
                                disabled={modalSaving}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                {modalSaving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <>Save & Connect</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
