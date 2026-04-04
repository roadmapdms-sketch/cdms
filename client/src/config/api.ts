const raw = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');

/**
 * REST API base (must end with `/api` path). Vercel: same-origin `/api` when env is unset so production
 * does not fall back to localhost. Local: `REACT_APP_API_URL` or http://localhost:5001/api.
 */
function resolveApiBase(): string {
  if (raw) return raw;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5001/api';
}

export const API_BASE_URL = resolveApiBase();
