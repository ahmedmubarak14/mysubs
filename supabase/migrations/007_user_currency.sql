-- Move currency preference to profiles so any user can set their local display currency
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
