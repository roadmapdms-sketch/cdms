# Vercel `api/` entry

**`api/index.js`** loads the **full Express app** from `server/dist/app.js`. Vercel rewrites `/api/*` to this function, so the SPA and API share one deployment (e.g. `https://cdms-phi.vercel.app`).

- **Local development:** run `cd server && npm run dev` (or root `npm run dev`). Do not rely on this file locally.
- **Legacy:** the old Supabase-only handler was moved to `legacy-supabase-serverless.js` if you need to reference it.

## Build

Root `npm run build` (used by Vercel) runs `build.sh`: CRA → `client/build`, then `server/` → `prisma generate` + `tsc`.

## Vercel environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Postgres (e.g. Supabase **transaction** pooler + `?pgbouncer=true`). |
| `DIRECT_URL` | Yes* | Prisma schema expects it; use the same as `DATABASE_URL` if you only have the pooler, or Supabase **direct** `:5432` when available. |
| `JWT_SECRET` | Yes | Strong random string. |
| `FRONTEND_URL` | Yes | Your site origin(s), comma-separated, e.g. `https://cdms-phi.vercel.app`. CORS + `VERCEL_URL` is also allowed automatically when `VERCEL=1`. |
| `NODE_ENV` | Recommended | `production` |

**Optional (client):** leave **`REACT_APP_API_URL`** unset on Vercel so the app uses **same-origin** `/api`. Only set it if the API is hosted elsewhere.

Prisma on Vercel uses `binaryTargets` including `rhel-openssl-3.0.x` in `schema.prisma`.
