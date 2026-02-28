-- Subscription Users: M:N relationship between subscriptions and profiles
CREATE TABLE IF NOT EXISTS subscription_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subscription_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_users_sub ON subscription_users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_users_profile ON subscription_users(profile_id);

ALTER TABLE subscription_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_users_select" ON subscription_users
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "sub_users_insert" ON subscription_users
  FOR INSERT WITH CHECK (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "sub_users_update" ON subscription_users
  FOR UPDATE USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "sub_users_delete" ON subscription_users
  FOR DELETE USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );
