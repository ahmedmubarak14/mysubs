-- Add dark mode preference to user profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN NOT NULL DEFAULT false;
