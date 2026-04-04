-- Run this in Supabase → SQL Editor when:
--   • init tables already exist (you ran migration.sql earlier), and
--   • `prisma migrate resolve` / `db:deploy` fail with P1001 locally (no route to :5432).
--
-- This creates `_prisma_migrations` if needed and records 20260402120000_init with the
-- same SHA-256 checksum Prisma uses for server/prisma/migrations/20260402120000_init/migration.sql
-- (recompute with: shasum -a 256 that/file.sql if you change the migration).

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "finished_at",
    "migration_name",
    "logs",
    "rolled_back_at",
    "started_at",
    "applied_steps_count"
)
SELECT
    gen_random_uuid()::text,
    '9ac2d2e0009129fa5a71580f088012982db4d1ad704fed1980e7d39fa1cd131a',
    NOW(),
    '20260402120000_init',
    NULL,
    NULL,
    NOW(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '20260402120000_init'
);
