-- Tracks which renewal notifications were already sent to prevent duplicates
CREATE TABLE IF NOT EXISTS notifications_sent (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id   UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  integration_type  TEXT NOT NULL,
  days_before       INT NOT NULL,
  sent_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subscription_id, integration_type, days_before)
);

CREATE INDEX IF NOT EXISTS idx_notifications_sent_org ON notifications_sent(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_sub ON notifications_sent(subscription_id);

ALTER TABLE notifications_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_sent_select" ON notifications_sent
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "notifications_sent_all" ON notifications_sent
  FOR ALL USING (true); -- Edge Function uses service_role key, bypasses RLS
