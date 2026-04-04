-- Fix P2022: column `users.firstName` does not exist
-- ---------------------------------------------------------------------------
-- If you created `users` with legacy scripts (e.g. setup_database*.sql) using
-- unquoted identifiers, PostgreSQL stores names in lowercase: firstname, lastname, …
-- Prisma expects camelCase columns: "firstName", "lastName", … (as in migrations).
--
-- Run once in Supabase → SQL Editor. Safe to re-run: each step only runs if needed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'firstname'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN firstname TO "firstName";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lastname'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN lastname TO "lastName";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'isactive'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN isactive TO "isActive";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'createdat'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN createdat TO "createdAt";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updatedat'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN updatedat TO "updatedAt";
  END IF;
END $$;
