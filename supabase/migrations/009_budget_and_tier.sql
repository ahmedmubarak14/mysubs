-- Add budget limit to organizations (monthly spend cap)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS budget_limit NUMERIC(12,2);

-- Add tier (free/paid/trial) to subscriptions
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'paid'
  CHECK (tier IN ('free', 'paid', 'trial'));
