/**
 * Vercel serverless entry: full Express CDMS API from `server/` (Prisma + all /api routes).
 * `vercel.json` rewrites `/api/*` here. Local dev: run `cd server && npm run dev` instead.
 */
module.exports = require('../server/dist/app.js').default;
