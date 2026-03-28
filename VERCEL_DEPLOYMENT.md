# 🚀 Vercel Deployment Guide

## Automatic Deployment Setup

### Prerequisites
- Vercel account (free)
- GitHub account
- PostgreSQL database (Railway, Supabase, or similar)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Project
```bash
cd /path/to/church-cdms
vercel link
```

### Step 4: Configure Environment Variables
```bash
# Set up your production environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
```

### Step 5: Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Environment Variables Required

### Server Environment
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Your JWT secret key
- `JWT_EXPIRES_IN`: Token expiration (default: "7d")
- `FRONTEND_URL`: Your Vercel app URL
- `NODE_ENV`: "production"

### Example Setup
```bash
vercel env add DATABASE_URL production
# Enter: postgresql://user:password@host:5432/database

vercel env add JWT_SECRET production
# Enter: your-super-secret-jwt-key

vercel env add FRONTEND_URL production
# Enter: https://your-app.vercel.app
```

## Database Setup for Production

### Option 1: Railway (Recommended)
1. Create account at [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Get connection string
4. Add to Vercel environment variables

### Option 2: Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Add to Vercel environment variables

### Option 3: Heroku Postgres
1. Create Heroku account
2. Add Postgres add-on
3. Get connection string
4. Add to Vercel environment variables

## Automatic Deployment from GitHub

### Step 1: Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select `roadmapdms-sketch/cdms` repository

### Step 2: Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm run install:all`

### Step 3: Environment Variables
Add all required environment variables in Vercel dashboard

### Step 4: Deploy
Click "Deploy" - Vercel will automatically deploy on every push to main branch

## Custom Domain (Optional)

### Step 1: Add Domain in Vercel
1. Go to project settings
2. Click "Domains"
3. Add your custom domain

### Step 2: Update DNS
Add the CNAME record provided by Vercel to your DNS settings

## Monitoring and Analytics

### Vercel Analytics
- Automatically enabled
- View page views, visitors, and performance

### Error Tracking
- Check Vercel logs for any errors
- Monitor API endpoints

## Performance Optimization

### Automatic Optimizations
- Vercel automatically optimizes:
  - Static assets
  - Images
  - API routes
  - Edge caching

### Manual Optimizations
- Enable caching headers
- Optimize database queries
- Use CDN for static assets

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Can't reach database server
```
**Solution**: Check DATABASE_URL and ensure database is accessible

#### 2. JWT Token Error
```
Error: JWT_SECRET is not defined
```
**Solution**: Add JWT_SECRET to environment variables

#### 3. CORS Error
```
Error: Access-Control-Allow-Origin
```
**Solution**: Update FRONTEND_URL environment variable

#### 4. Build Failure
```
Error: Build failed
```
**Solution**: Check build logs and ensure all dependencies are installed

### Debug Commands
```bash
# Check deployment logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod --force
```

## Scaling and Performance

### Vercel Pro (Optional)
- Custom domains
- Advanced analytics
- Edge functions
- Higher limits

### Database Scaling
- Monitor database performance
- Add indexes for frequently queried fields
- Consider read replicas for high traffic

## Security Considerations

### Environment Variables
- Never commit secrets to Git
- Use Vercel environment variables
- Rotate secrets regularly

### Database Security
- Use SSL connections
- Implement proper user permissions
- Regular backups

### API Security
- Rate limiting implemented
- JWT authentication
- Input validation
- CORS protection

---

**Need help? Check [Vercel Documentation](https://vercel.com/docs)**
