-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  vendor        TEXT,
  logo_url      TEXT,
  category      TEXT,
  cost          NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'quarterly', 'one-time')),
  start_date    DATE,
  renewal_date  DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'cancelled', 'trial')),
  seats         INTEGER DEFAULT 0,
  seat_cost     NUMERIC(10,2),
  owner_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal ON subscriptions(renewal_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON subscriptions(owner_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs_select" ON subscriptions
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "subs_insert" ON subscriptions
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "subs_update" ON subscriptions
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "subs_delete" ON subscriptions
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-mark expiring (within 30 days)
CREATE OR REPLACE FUNCTION update_subscription_statuses()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expiring'
  WHERE status = 'active'
    AND renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';
END;
$$;
