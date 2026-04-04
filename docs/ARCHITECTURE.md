# CDMS architecture (single source of truth)

## Canonical stack (default — use this for serious development)

| Layer | Source of truth |
|--------|------------------|
| **HTTP API** | `server/` — Express + TypeScript |
| **Database schema** | `server/prisma/schema.prisma` |
| **Migrations** | `server/prisma/migrations/` |
| **PostgreSQL** | Any host (local, RDS, Neon, **Supabase Postgres**, etc.) — `DATABASE_URL` + **`DIRECT_URL`** (see [SUPABASE.md](./SUPABASE.md)) |

### Local workflow

1. Copy `server/.env.example` → `server/.env` and set `DATABASE_URL`, `JWT_SECRET`, and (for production) `FRONTEND_URL`.
2. From repo root: `npm run install:all`, then `npm run dev` (starts `client` + `server`).
3. Apply schema: from `server/`, run `npx prisma migrate deploy` (or `npx prisma migrate dev` when iterating). For a throwaway local DB you may use `npx prisma db push`, but **migrations are the versioned contract** for shared environments. If the database was created earlier without migrations, use Prisma’s **baselining** workflow (`migrate resolve`, etc.) once so history matches reality—do not apply the baseline SQL twice to a non-empty database.

### Frontend API URL

The React app calls the Express API. Set **`REACT_APP_API_URL`** (see `client/.env.example`) to the base URL including `/api`, e.g. `http://localhost:5000/api`.

---

## Optional path: Vercel serverless + Supabase (`api/`)

The **`api/`** folder is a **separate, limited** backend intended for static hosting on Vercel: a single serverless entry (`api/index.js`) that talks to **Supabase** (Postgres + REST) for a small subset of behaviour (notably auth-style routes in that file).

- It does **not** implement the full REST surface under `server/src/routes/`.
- The **React app is built for the Express API** (`axios` + `API_BASE_URL`), not for this handler, unless you deliberately re-point `REACT_APP_API_URL` and accept reduced functionality.

Use **`api/`** only when you explicitly choose “static site on Vercel + Supabase” and understand the gap. Otherwise ignore it and run **`server`**.

Details: `api/README.md`, `vercel.json`.

---

## Root `*.sql` files and `DATABASE_SCHEMA.md`

Files such as `setup_database.sql`, `quick_setup.sql`, and **`DATABASE_SCHEMA.md`** are **historical / design / Supabase SQL editor** artifacts. They are **not** the schema source of truth and may disagree with Prisma.

When changing the data model: edit **`server/prisma/schema.prisma`**, generate a migration, and deploy it — do not hand-maintain parallel SQL in the repo root.

---

## API authorization

- **JWT:** All module routes under `/api/*` (except `POST /api/auth/login`, `POST /api/auth/register`, and unauthenticated health checks) require `Authorization: Bearer <token>`.
- **Role groups** live in **`server/src/constants/accessRoles.ts`:**
  - **`STAFF_MODULE_ROLES`** — members, attendance, events, volunteers, communications, pastoral care, inventory, reports (everyone who uses the main staff shell except **MEMBER**).
  - **`FINANCE_CORE_ROLES`** — **ADMIN** and **ACCOUNTANT** only for `/api/financial`, `/api/budget`, `/api/vendors`, `/api/expenses`.
- **MEMBER** can only use **`/api/auth/*`** (e.g. profile) until dedicated member APIs are added. The UI should not expose staff module links to that role (see client `LAYOUT_ALLOWED_ROLES` vs member dashboard).
- **Public registration** (`POST /api/auth/register`) may assign only **`USER`** or **`MEMBER`**. Any other requested role is ignored and stored as **`USER`**. Create **ADMIN** / **ACCOUNTANT** / etc. via a trusted path (Prisma Studio, SQL, or a future admin-only invite API).

**Row-level security:** The Express API does not yet scope lists to “only my records” per user; that is a follow-up for sensitive modules. **Supabase RLS** applies only if you use the optional **`api/`** path.

### Role dashboard summaries (aggregates)

| Method | Path | Roles |
|--------|------|--------|
| GET | `/api/admin/stats` | `ADMIN` |
| GET | `/api/accountant/stats` | `ADMIN`, `ACCOUNTANT` |
| GET | `/api/pastor/stats` | `ADMIN`, `PASTOR`, `STAFF` |
| GET | `/api/volunteer/stats` | `ADMIN`, `VOLUNTEER_COORDINATOR` |
| GET | `/api/member/me/dashboard` | `MEMBER` (JWT user only; no `:id` in URL) |

Implemented in `server/src/routes/roleDashboards.ts`.

---

## Testing and CI

- **Server:** Jest + ts-jest (`cd server && npm test`). Tests live next to code as `*.test.ts` (see `src/middleware/auth.test.ts`, `src/constants/accessRoles.test.ts`). `JWT_SECRET` is set in `src/test/setupEnv.ts` for tests. Production `npm run build` uses `tsconfig.build.json` so `*.test.ts` is not emitted to `dist/`.
- **Client:** React Testing Library (`cd client && CI=true npm test -- --watchAll=false`). `src/setupTests.ts` loads `@testing-library/jest-dom`.
- **Root:** `npm test` runs server then client tests.
- **GitHub Actions:** `.github/workflows/ci.yml` runs `prisma generate`, server build + tests, client build (`CI=false` so ESLint warnings do not fail the build), and client tests.

---

## Release and operations (Stage 6)

- **Runbook:** [RUNBOOK.md](./RUNBOOK.md) — env vars, deploy order, `/health` vs `/health/ready`, rollback notes.
- **Container:** Root **`Dockerfile`** builds the CRA app + server; **`docker compose up`** starts Postgres + API (migrations run on container start). See **`docker-compose.yml`**.
- **Single process + static UI:** Set **`SERVE_STATIC=true`** (and optionally **`CLIENT_DIST_PATH`**) so Express serves `client/build` and the UI can use a same-origin **`REACT_APP_API_URL`** such as `http://localhost:5000/api`.

---

## Dependencies

- **`@supabase/supabase-js`** is used under **`api/`** (and optional tooling like `diagnostic.js`). It is **not** required for the canonical Express + Prisma server (`server/src` does not import Supabase).
- The **client** talks to the backend over HTTP only; it does not need a Supabase client for the default stack.
