-- ── Feature 1: Contract Duration ─────────────────────────────────────────────
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS contract_end_date DATE;

-- ── Feature 3: Payment History ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  paid_at         DATE NOT NULL DEFAULT CURRENT_DATE,
  amount          NUMERIC(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_payments_sub ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_payments_org ON subscription_payments(org_id);

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_payments_org" ON subscription_payments FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- ── Feature 4: Historical Change Log ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  changed_by      UUID REFERENCES profiles(id),
  field_name      TEXT NOT NULL,
  old_value       TEXT,
  new_value       TEXT,
  changed_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_history_sub ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_history_org ON subscription_history(org_id);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_history_org" ON subscription_history FOR ALL
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));
