# Vercel serverless API (optional)

This directory is **not** the main CDMS backend.

- **Default / full API:** `server/` (Express + Prisma + PostgreSQL). See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).
- **`api/index.js`:** A serverless router for Vercel that uses **Supabase** (`@supabase/supabase-js`) for a narrow set of endpoints (e.g. login/register against a Supabase `users` table). It does **not** mirror all routes under `server/src/routes/`.

`vercel.json` rewrites `/api/*` to `api/index.js` for deployments that use this layout.

Use this only when you intentionally deploy the CRA build to Vercel and want auth against Supabase without running the Express server. For normal development, run `npm run dev` from the repo root and use Prisma + `server`.
