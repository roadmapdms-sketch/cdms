#!/bin/bash
set -e

echo "🔨 Building CDMS for Vercel (client + server)…"

echo "🏗️ React client…"
cd client
ESLINT_NO_DEV_ERRORS=true npm run build
cd ..

echo "🏗️ Express API + Prisma…"
cd server
npx prisma generate
npm run build
cd ..

echo "✅ Build complete — client/build + server/dist"
