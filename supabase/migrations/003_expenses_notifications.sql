-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'USD',
  category     TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department   TEXT,
  project      TEXT,
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receipt_url  TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(org_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select" ON expenses
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('renewal_reminder', 'expiry_alert', 'new_member', 'info')),
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  notify_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_org ON notifications(org_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notif_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
