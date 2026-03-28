#!/bin/bash

echo "🔨 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🏗️ Building React client..."
cd client
ESLINT_NO_DEV_ERRORS=true npm run build
cd ..

echo "✅ Build completed successfully!"
echo "📁 Build output available in client/build/"
