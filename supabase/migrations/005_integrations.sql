-- ── org_integrations table ──────────────────────────────────────────────────
-- Stores one row per integration per org (e.g. Slack webhook URL for org X)
CREATE TABLE IF NOT EXISTS org_integrations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type               TEXT NOT NULL CHECK (type IN ('slack','telegram','discord','whatsapp','github','jira','zapier','pagerduty')),
  webhook_url        TEXT,
  bot_token          TEXT,
  chat_id            TEXT,
  enabled            BOOLEAN NOT NULL DEFAULT true,
  remind_days_before JSONB NOT NULL DEFAULT '[1, 7]',  -- e.g. [1, 3, 7, 14, 30]
  connected_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, type)
);

CREATE INDEX IF NOT EXISTS idx_org_integrations_org ON org_integrations(org_id);

ALTER TABLE org_integrations ENABLE ROW LEVEL SECURITY;

-- Any member of the org can read integrations
CREATE POLICY "integrations_select" ON org_integrations
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Only admins / managers can upsert
CREATE POLICY "integrations_upsert" ON org_integrations
  FOR ALL USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
  );
