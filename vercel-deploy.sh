#!/bin/bash

echo "🚀 Church Data Management System - Vercel Deployment"
echo "======================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the client
echo "🔨 Building React client..."
cd client
npm run build
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "📝 You'll need to:"
echo "   1. Login to Vercel (if not already logged in)"
echo "   2. Set up environment variables"
echo "   3. Choose deployment settings"

# Run Vercel deployment
npx vercel

echo ""
echo "✅ Deployment process started!"
echo "📋 Next Steps:"
echo "   1. Follow the Vercel prompts"
echo "   2. Set up environment variables in Vercel dashboard"
echo "   3. Configure your production database"
echo "   4. Test your deployed application"
echo ""
echo "🔗 Your app will be available at: https://your-app-name.vercel.app"
echo "📖 For detailed deployment guide, see: VERCEL_DEPLOYMENT.md"
