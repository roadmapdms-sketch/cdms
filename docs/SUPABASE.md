# Connect CDMS to your Supabase project

The **canonical backend** uses **Prisma + PostgreSQL**. Supabase gives you a hosted Postgres instance — you only need the **database connection strings** from the Supabase dashboard (not the old `api/` Supabase JS serverless path unless you choose that deployment model).

## 1. Open your Supabase project

1. Sign in: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your **project** (or create one).

## 2. Get connection strings

1. In the left sidebar: **Project Settings** (gear) → **Database**.
2. Scroll to **Connection string**.
3. Use **URI** format.

You need two values for Prisma (see `server/prisma/schema.prisma`):

| Variable | Purpose |
|----------|---------|
| **`DATABASE_URL`** | App runtime + Prisma Client. With Supabase **pooler**, use **Transaction mode** (port **6543**) and add **`?pgbouncer=true`**. |
| **`DIRECT_URL`** | **Migrations** (`prisma migrate deploy` / `migrate dev`). Use the **direct** database host on port **5432** (not the pooler). |

Official Supabase connection docs: [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)

Prisma + Supabase: [Prisma — Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase)

### Example shape (replace placeholders)

```env
# Pooled (IPv4-compatible pooler; good for the running API)
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct (migrations; host often db.PROJECT_REF.supabase.co)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

Copy the exact strings from the dashboard; regions and hostnames differ per project.

**Note:** If the project was **paused** (free tier), wake it in the dashboard before connecting.

## 3. Put them in `server/.env.local` (recommended)

We load **`server/.env`** first, then **`server/.env.local`** (overrides). Keep secrets out of git — `.env.local` is gitignored.

```bash
cd server
cp .env.example .env.local
# Edit .env.local: set DATABASE_URL, DIRECT_URL, JWT_SECRET, FRONTEND_URL
```

## 4. Apply schema and run the API

```bash
cd server
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## 5. Client API URL

Your React app must point at the same machine/port as the API, e.g. in `client/.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

(Adjust port if you changed `PORT` in `server/.env.local`.)

## Troubleshooting

| Error | What to check |
|-------|----------------|
| **P1001** Can’t reach server | Project not paused; firewall/VPN; **`DATABASE_URL`** host/port/password correct. |
| Migration errors on pooler | Ensure **`DIRECT_URL`** uses port **5432** direct host, not **6543** pooler. |
| **localhost:5432** failures | That means **`DATABASE_URL` points at local Postgres** — either start local Postgres or switch **`DATABASE_URL`** to Supabase in **`.env.local`**. |

## Relation to `api/` folder

The root **`api/index.js`** path is an **optional** Vercel + Supabase **REST** demo, not the main CDMS API. For day-to-day development with this repo, use **`server/`** + **`DATABASE_URL`** / **`DIRECT_URL`** as above. See [ARCHITECTURE.md](./ARCHITECTURE.md).
