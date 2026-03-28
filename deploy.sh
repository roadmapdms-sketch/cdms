#!/bin/bash

# Vercel Deployment Script for Church Data Management System

echo "🚀 Starting Vercel Deployment Setup..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the application
echo "🔨 Building application..."
cd client
npm run build
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app is now live on Vercel!"
