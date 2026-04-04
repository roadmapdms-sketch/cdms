# syntax=docker/dockerfile:1
# Production image: API + optional CRA static (SERVE_STATIC=true)

FROM node:20-bookworm-slim AS client-builder
WORKDIR /build
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci
COPY client ./client
ENV CI=false
RUN cd client && ESLINT_NO_DEV_ERRORS=true npm run build

FROM node:20-bookworm-slim AS server-builder
WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server .
RUN npx prisma generate && npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app/server
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json ./
COPY server/prisma ./prisma
RUN npm ci --omit=dev && npm install -g prisma@5.22.0 && prisma generate
COPY --from=server-builder /build/server/dist ./dist
COPY --from=client-builder /build/client/build /app/client/build

ENV NODE_ENV=production
ENV PORT=5000
ENV SERVE_STATIC=true
ENV CLIENT_DIST_PATH=/app/client/build
# Prisma requires DIRECT_URL for migrations; docker-compose sets both URLs (same for internal Postgres).

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "prisma migrate deploy && node dist/index.js"]
