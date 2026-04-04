# Vercel serverless API (optional)

This directory is **not** the main CDMS backend.

- **Default / full API:** `server/` (Express + Prisma + PostgreSQL). See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).
- **`api/index.js`:** A serverless router for Vercel that uses **Supabase** (`@supabase/supabase-js`) for a narrow set of endpoints (e.g. login/register against a Supabase `users` table). It does **not** mirror all routes under `server/src/routes/`.

`vercel.json` rewrites `/api/*` to `api/index.js` for deployments that use this layout.

Use this only when you intentionally deploy the CRA build to Vercel and want auth against Supabase without running the Express server. For normal development, run `npm run dev` from the repo root and use Prisma + `server`.

## Vercel environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **Strongly recommended** | From Supabase → Project Settings → API → **service_role** (secret). Server-only; never `NEXT_PUBLIC_*`. Without it, register/login usually fails because **RLS** blocks the publishable key. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | If no service role | Publishable key; often insufficient for `INSERT` into `users` under default RLS. |
| `JWT_SECRET` | Yes (production) | Signs JWTs for register/login responses. |

Get the service role key in [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API**.

---

## Full dashboards & data pages (reports, members, finance, …)

The React app is built for the **Express + Prisma API** under `server/` (`/api/reports/dashboard`, `/api/members`, role dashboards, etc.).

**`api/index.js` on Vercel only implements a small subset** (e.g. register/login/health). Any other route returns **“API endpoint not found”**.

To use the full app in production:

1. **Deploy Express** (`server/`) to a Node host (Railway, Render, Fly.io, VPS, etc.) with `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (your Vercel site URL), and CORS allowing that origin.
2. In **Vercel** → **Environment variables**, set **`REACT_APP_API_URL`** to your Express API base, e.g. `https://api.yourdomain.com/api` (include `/api`, no trailing slash).
3. **Redeploy** the Vercel project so the client bundle is rebuilt with that value.

Local dev: keep **`REACT_APP_API_URL=http://localhost:5001/api`** in `client/.env.local` and run **`npm run dev`** (or start client + server separately).
