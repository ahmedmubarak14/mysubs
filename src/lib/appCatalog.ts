// App catalog — 70+ popular B2B SaaS tools
// Logo URL: https://www.google.com/s2/favicons?domain={domain}&sz=128

export interface AppEntry {
    name: string;
    vendor: string;
    domain: string;
    category: string;
    defaultSeats?: number;
}

export const APP_CATALOG: AppEntry[] = [
    // Communication
    { name: 'Slack', vendor: 'Slack Technologies', domain: 'slack.com', category: 'Communication', defaultSeats: 10 },
    { name: 'Microsoft Teams', vendor: 'Microsoft', domain: 'microsoft.com', category: 'Communication', defaultSeats: 20 },
    { name: 'Zoom', vendor: 'Zoom Video', domain: 'zoom.us', category: 'Communication', defaultSeats: 10 },
    { name: 'Google Meet', vendor: 'Google', domain: 'meet.google.com', category: 'Communication' },
    { name: 'Loom', vendor: 'Loom Inc', domain: 'loom.com', category: 'Communication', defaultSeats: 5 },
    { name: 'Intercom', vendor: 'Intercom Inc', domain: 'intercom.com', category: 'Communication', defaultSeats: 3 },
    { name: 'Zendesk', vendor: 'Zendesk', domain: 'zendesk.com', category: 'Communication', defaultSeats: 5 },

    // Design
    { name: 'Figma', vendor: 'Figma Inc', domain: 'figma.com', category: 'Design', defaultSeats: 5 },
    { name: 'Sketch', vendor: 'Sketch BV', domain: 'sketch.com', category: 'Design', defaultSeats: 3 },
    { name: 'Adobe Creative Cloud', vendor: 'Adobe', domain: 'adobe.com', category: 'Design', defaultSeats: 3 },
    { name: 'Canva', vendor: 'Canva', domain: 'canva.com', category: 'Design', defaultSeats: 5 },
    { name: 'Miro', vendor: 'RealtimeBoard', domain: 'miro.com', category: 'Design', defaultSeats: 5 },
    { name: 'Framer', vendor: 'Framer', domain: 'framer.com', category: 'Design', defaultSeats: 2 },
    { name: 'InVision', vendor: 'InVision', domain: 'invisionapp.com', category: 'Design', defaultSeats: 3 },

    // Development
    { name: 'GitHub', vendor: 'GitHub Inc', domain: 'github.com', category: 'Development', defaultSeats: 10 },
    { name: 'GitLab', vendor: 'GitLab', domain: 'gitlab.com', category: 'Development', defaultSeats: 10 },
    { name: 'Jira', vendor: 'Atlassian', domain: 'atlassian.com', category: 'Development', defaultSeats: 10 },
    { name: 'Linear', vendor: 'Linear Inc', domain: 'linear.app', category: 'Development', defaultSeats: 5 },
    { name: 'Sentry', vendor: 'Sentry Inc', domain: 'sentry.io', category: 'Development', defaultSeats: 5 },
    { name: 'PagerDuty', vendor: 'PagerDuty', domain: 'pagerduty.com', category: 'Development', defaultSeats: 3 },
    { name: 'Postman', vendor: 'Postman Inc', domain: 'postman.com', category: 'Development', defaultSeats: 5 },
    { name: 'Vercel', vendor: 'Vercel Inc', domain: 'vercel.com', category: 'Cloud', defaultSeats: 3 },
    { name: 'Netlify', vendor: 'Netlify', domain: 'netlify.com', category: 'Cloud', defaultSeats: 2 },
    { name: 'Railway', vendor: 'Railway Corp', domain: 'railway.app', category: 'Cloud', defaultSeats: 2 },

    // Cloud & Infrastructure
    { name: 'AWS', vendor: 'Amazon Web Services', domain: 'aws.amazon.com', category: 'Cloud', defaultSeats: 5 },
    { name: 'Google Cloud', vendor: 'Google', domain: 'cloud.google.com', category: 'Cloud', defaultSeats: 3 },
    { name: 'Microsoft Azure', vendor: 'Microsoft', domain: 'azure.microsoft.com', category: 'Cloud', defaultSeats: 3 },
    { name: 'DigitalOcean', vendor: 'DigitalOcean', domain: 'digitalocean.com', category: 'Cloud', defaultSeats: 2 },
    { name: 'Cloudflare', vendor: 'Cloudflare', domain: 'cloudflare.com', category: 'Security', defaultSeats: 2 },
    { name: 'Datadog', vendor: 'Datadog Inc', domain: 'datadoghq.com', category: 'Analytics', defaultSeats: 3 },

    // Analytics & Marketing
    { name: 'Google Analytics', vendor: 'Google', domain: 'analytics.google.com', category: 'Analytics' },
    { name: 'Mixpanel', vendor: 'Mixpanel Inc', domain: 'mixpanel.com', category: 'Analytics', defaultSeats: 5 },
    { name: 'Segment', vendor: 'Twilio', domain: 'segment.com', category: 'Analytics', defaultSeats: 3 },
    { name: 'HubSpot', vendor: 'HubSpot Inc', domain: 'hubspot.com', category: 'Marketing', defaultSeats: 5 },
    { name: 'Salesforce', vendor: 'Salesforce', domain: 'salesforce.com', category: 'Marketing', defaultSeats: 10 },
    { name: 'Mailchimp', vendor: 'Intuit', domain: 'mailchimp.com', category: 'Marketing', defaultSeats: 2 },
    { name: 'Klaviyo', vendor: 'Klaviyo', domain: 'klaviyo.com', category: 'Marketing', defaultSeats: 2 },
    { name: 'Amplitude', vendor: 'Amplitude Inc', domain: 'amplitude.com', category: 'Analytics', defaultSeats: 5 },

    // Productivity & Operations
    { name: 'Google Workspace', vendor: 'Google', domain: 'workspace.google.com', category: 'Operations', defaultSeats: 10 },
    { name: 'Notion', vendor: 'Notion Labs', domain: 'notion.so', category: 'Operations', defaultSeats: 10 },
    { name: 'Confluence', vendor: 'Atlassian', domain: 'atlassian.com', category: 'Operations', defaultSeats: 10 },
    { name: 'Asana', vendor: 'Asana', domain: 'asana.com', category: 'Operations', defaultSeats: 5 },
    { name: 'Monday.com', vendor: 'Monday.com', domain: 'monday.com', category: 'Operations', defaultSeats: 5 },
    { name: 'ClickUp', vendor: 'ClickUp', domain: 'clickup.com', category: 'Operations', defaultSeats: 5 },
    { name: 'Airtable', vendor: 'Airtable', domain: 'airtable.com', category: 'Operations', defaultSeats: 5 },
    { name: 'Trello', vendor: 'Atlassian', domain: 'trello.com', category: 'Operations', defaultSeats: 5 },
    { name: 'Coda', vendor: 'Coda', domain: 'coda.io', category: 'Operations', defaultSeats: 5 },

    // AI & ML
    { name: 'ChatGPT (OpenAI)', vendor: 'OpenAI', domain: 'openai.com', category: 'AI & ML', defaultSeats: 5 },
    { name: 'Claude', vendor: 'Anthropic', domain: 'anthropic.com', category: 'AI & ML', defaultSeats: 3 },
    { name: 'GitHub Copilot', vendor: 'GitHub', domain: 'github.com', category: 'AI & ML', defaultSeats: 5 },
    { name: 'Jasper', vendor: 'Jasper AI', domain: 'jasper.ai', category: 'AI & ML', defaultSeats: 3 },
    { name: 'Grammarly Business', vendor: 'Grammarly', domain: 'grammarly.com', category: 'AI & ML', defaultSeats: 5 },

    // Finance & HR
    { name: 'QuickBooks', vendor: 'Intuit', domain: 'quickbooks.intuit.com', category: 'Finance', defaultSeats: 2 },
    { name: 'Xero', vendor: 'Xero', domain: 'xero.com', category: 'Finance', defaultSeats: 2 },
    { name: 'Rippling', vendor: 'Rippling', domain: 'rippling.com', category: 'HR', defaultSeats: 20 },
    { name: 'Gusto', vendor: 'Gusto', domain: 'gusto.com', category: 'HR', defaultSeats: 5 },
    { name: 'BambooHR', vendor: 'BambooHR', domain: 'bamboohr.com', category: 'HR', defaultSeats: 10 },
    { name: 'Workday', vendor: 'Workday', domain: 'workday.com', category: 'HR', defaultSeats: 20 },
    { name: 'Expensify', vendor: 'Expensify', domain: 'expensify.com', category: 'Finance', defaultSeats: 5 },

    // Security
    { name: '1Password', vendor: 'AgileBits', domain: '1password.com', category: 'Security', defaultSeats: 10 },
    { name: 'LastPass', vendor: 'LastPass', domain: 'lastpass.com', category: 'Security', defaultSeats: 10 },
    { name: 'Okta', vendor: 'Okta', domain: 'okta.com', category: 'Security', defaultSeats: 20 },
    { name: 'DocuSign', vendor: 'DocuSign', domain: 'docusign.com', category: 'Operations', defaultSeats: 5 },

    // Customer Success
    { name: 'Pendo', vendor: 'Pendo', domain: 'pendo.io', category: 'Analytics', defaultSeats: 3 },
    { name: 'Typeform', vendor: 'Typeform', domain: 'typeform.com', category: 'Marketing', defaultSeats: 3 },
    { name: 'Hotjar', vendor: 'Hotjar', domain: 'hotjar.com', category: 'Analytics', defaultSeats: 3 },
    { name: 'Calendly', vendor: 'Calendly', domain: 'calendly.com', category: 'Operations', defaultSeats: 5 },
    { name: 'Stripe', vendor: 'Stripe', domain: 'stripe.com', category: 'Finance' },
    { name: 'Supabase', vendor: 'Supabase', domain: 'supabase.com', category: 'Development', defaultSeats: 3 },

    // Domain & Hosting
    { name: 'Namecheap', vendor: 'Namecheap Inc', domain: 'namecheap.com', category: 'Domain & Hosting' },
    { name: 'GoDaddy', vendor: 'GoDaddy Inc', domain: 'godaddy.com', category: 'Domain & Hosting' },
];

export function getLogoUrl(domain: string): string {
    // Google's S2 favicon service — no auth, no rate limits, works for any domain
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
