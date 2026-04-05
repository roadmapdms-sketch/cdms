const raw = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');

/**
 * REST API base (must end with `/api`).
 * - Explicit `REACT_APP_API_URL` always wins (required when the API is on another host).
 * - Production build without env: same-origin `/api` (Vercel rewrites to `api/index.js` — auth only).
 * - Development (`npm start`): default Express on :5001 — do NOT use window.origin (CRA is on :3000).
 */
function resolveApiBase(): string {
  if (raw) return raw;
  if (
    process.env.NODE_ENV === 'production' &&
    typeof window !== 'undefined' &&
    window.location?.origin
  ) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5001/api';
}

export const API_BASE_URL = resolveApiBase();

/**
 * Login/register only. Use when `REACT_APP_API_URL` points at an offline Express host but auth
 * should hit Vercel serverless on the main app: set e.g. REACT_APP_AUTH_API_URL=https://YOUR-APP.vercel.app/api
 */
const authRaw = process.env.REACT_APP_AUTH_API_URL?.trim().replace(/\/$/, '');
export const AUTH_API_BASE_URL = authRaw || API_BASE_URL;

/** Liveness check path (Express exposes `/api/health` for same-origin / Vercel). */
export function getMainApiHealthUrl(): string {
  return `${API_BASE_URL.replace(/\/$/, '')}/health`;
}
