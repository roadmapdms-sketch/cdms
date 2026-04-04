# CDMS release runbook (Stage 6)

## What ships

- **API:** Express in `server/` (default port **5000**).
- **UI:** Create React App build in `client/build`, or any static host with `REACT_APP_API_URL` pointing at the API.
- **Single-origin option:** Set **`SERVE_STATIC=true`** and **`CLIENT_DIST_PATH`** (or rely on default path next to `server/dist`) so Express serves the CRA `index.html` and assets from the same server (see `Dockerfile`).

## Health checks

| Path | Use |
|------|-----|
| `GET /health` | Liveness — process is up (no DB call). |
| `GET /health/ready` | Readiness — `SELECT 1` via Prisma; **503** if DB is down. |

Configure load balancers / Kubernetes: liveness → `/health`, readiness → `/health/ready`. These paths are excluded from the default rate limiter.

## Required environment (production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection for the running app (pooler URL ok for Supabase + `?pgbouncer=true`). |
| `DIRECT_URL` | Direct Postgres URL for **migrations** (port 5432). Same as `DATABASE_URL` for local Docker/simple Postgres. See [SUPABASE.md](./SUPABASE.md). |
| `JWT_SECRET` | Strong secret (32+ chars). |
| `FRONTEND_URL` | Comma-separated allowed browser origins for CORS (your real site URL(s)). |
| `NODE_ENV` | `production` |
| `PORT` | Listen port (default 5000). |

Optional:

| Variable | Purpose |
|----------|---------|
| `SERVE_STATIC` | `true` to serve CRA build from this process. |
| `CLIENT_DIST_PATH` | Absolute path to `client/build` (Docker: `/app/client/build`). |

Client build-time:

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | API base including `/api`, e.g. `https://api.example.com/api` or same-origin `https://app.example.com/api`. |

Rebuild the client (or the Docker image) whenever this changes — Create React App bakes it in at build time.

## Deploy sequence (typical)

1. **Database:** Ensure Postgres is reachable; create DB/user if needed.
2. **Migrations:** `cd server && npx prisma migrate deploy` (or rely on Docker `CMD` which runs `prisma migrate deploy` before `node`).
3. **API + UI:** Either:
   - **Docker:** `docker compose up --build` (see repo `docker-compose.yml`), or build/push image and run with the same env vars; or
   - **Node:** `cd server && npm ci && npm run build && npm start`, and host `client/build` on CDN/nginx **or** set `SERVE_STATIC=true` with the build copied next to the server layout expected by `CLIENT_DIST_PATH`.
4. **Smoke:** `curl -sf https://your-host/health` and `curl -sf https://your-host/health/ready`.

## Rollback

- **App:** Redeploy the previous container image or git tag; no automatic down-migration.
- **Database:** Prisma migrations are **forward-only** in normal operation. Reverting schema requires a new migration or manual DBA work — avoid `migrate deploy` of a broken migration in prod; test in staging first.

## Incidents (short)

- **503 on `/health/ready`:** DB connectivity, credentials, or network from app to Postgres.
- **CORS errors:** `FRONTEND_URL` must include the exact browser origin (scheme + host + port).
- **401 on API:** Missing/expired JWT; clock skew rare but possible on tokens.

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, auth, testing, CI.
- [DEPLOYMENT.md](../DEPLOYMENT.md) — longer legacy deployment notes.
