-- NairaTracker Schema — run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('in','out')) NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  target NUMERIC(15,2) DEFAULT 100000000,
  year INT DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "txn select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "txn insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "txn update" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "txn delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "goal select" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goal insert" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goal update" ON goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profile select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name') ON CONFLICT DO NOTHING;
  INSERT INTO goals (user_id, target, year) VALUES (NEW.id, 100000000, EXTRACT(YEAR FROM NOW())::INT) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: idempotency key for n8n webhook (run this if schema already exists)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT DEFAULT NULL;

-- Unique constraint: same user can't have two transactions with same key
-- This is the database-level safety net even if the app-level check above is bypassed
CREATE UNIQUE INDEX IF NOT EXISTS transactions_idempotency_key_idx
  ON transactions (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
