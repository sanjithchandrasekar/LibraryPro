-- ══════════════════════════════════════════════════════════════════════════════
-- LibraryPro — Database Migration
-- Run this in Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add missing columns to users table ─────────────────────────────────────
--    These columns are inserted during StudentSignup but were missing from the
--    original schema.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_no  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob      DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender   TEXT;

-- ── 2. Add 'Admin' to user_role enum (if not already present) ─────────────────
--    Required so the RoleBadge in Users page can display Admin members.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'Admin'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'Admin';
  END IF;
END
$$;

-- ── 3. Ensure admin table has password column ──────────────────────────────────
ALTER TABLE admin ADD COLUMN IF NOT EXISTS password TEXT;

-- ── 4. RLS Policies — ensure they exist ───────────────────────────────────────
--    Safe to re-run: uses CREATE POLICY IF NOT EXISTS (Postgres 15+).
--    If on older Postgres, drop & recreate manually.

-- Users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Allow admin read') THEN
    CREATE POLICY "Allow admin read" ON users FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Allow admin insert') THEN
    CREATE POLICY "Allow admin insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Allow admin update') THEN
    CREATE POLICY "Allow admin update" ON users FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='Allow admin delete') THEN
    CREATE POLICY "Allow admin delete" ON users FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Admin table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin' AND policyname='Allow admin read') THEN
    CREATE POLICY "Allow admin read" ON admin FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin' AND policyname='Allow admin insert') THEN
    CREATE POLICY "Allow admin insert" ON admin FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- ── 5. Verify ──────────────────────────────────────────────────────────────────
--    Run this SELECT to confirm all columns are present:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
