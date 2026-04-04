const raw = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');

/** Base URL for REST API (include `/api`). Default matches server PORT=5001 (macOS often uses :5000 for AirPlay). */
export const API_BASE_URL = raw || 'http://localhost:5001/api';
