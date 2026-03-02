-- Add currency preference to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- Add notification preferences to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{"renewal_alerts": true, "expiry_alerts": true, "member_changes": false}';
