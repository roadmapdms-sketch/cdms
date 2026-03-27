# Church Data Management System - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Church Data Management System (CDMS) to various environments including development, staging, and production.

## Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **PostgreSQL**: 14.0 or higher
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **Network**: Stable internet connection

### Software Dependencies
- Git
- Docker (optional, for containerized deployment)
- SSL certificate (for production HTTPS)

## Environment Setup

### 1. Database Configuration

#### PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql
```

#### Database Creation
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE church_db;

# Create user
CREATE USER church_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE church_db TO church_user;

# Exit
\q
```

### 2. Environment Variables

Create `.env` file in server directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://church_user:secure_password@localhost:5432/church_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="production"

# CORS Configuration
CORS_ORIGIN="https://yourdomain.com"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"  # 10MB
```

## Deployment Options

### Option 1: Traditional Server Deployment

#### 1. Server Setup

```bash
# Clone repository
git clone <repository-url>
cd Church

# Install dependencies
cd server
npm ci --production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build
```

#### 2. Process Management with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cdms-server',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### 3. Nginx Reverse Proxy

Create Nginx configuration:

```nginx
# /etc/nginx/sites-available/church-management
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Static Files
    location / {
        root /path/to/church/client/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/church-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  database:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: church_db
      POSTGRES_USER: church_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - church-network

  server:
    build: ./server
    environment:
      DATABASE_URL: postgresql://church_user:secure_password@database:5432/church_db
      JWT_SECRET: your-super-secret-jwt-key
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - database
    networks:
      - church-network
    restart: unless-stopped

  frontend:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - server
    networks:
      - church-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - server
      - frontend
    networks:
      - church-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  church-network:
    driver: bridge
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull
docker-compose up -d --force-recreate
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment

**Using AWS EC2:**
```bash
# 1. Launch EC2 instance
# Choose Ubuntu 20.04 LTS, t3.medium or larger

# 2. Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone and deploy
git clone <repository-url>
cd Church
docker-compose up -d
```

**Using AWS ECS:**
```json
{
  "family": "cdms",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "cdms-server",
      "image": "your-registry/cdms-server:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cdms",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Google Cloud Platform

**Using Cloud Run:**
```bash
# 1. Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/cdms-server

# 2. Deploy to Cloud Run
gcloud run deploy cdms-server \
  --image gcr.io/PROJECT-ID/cdms-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://...
```

#### Azure Container Instances

```bash
# 1. Create resource group
az group create --name cdms-rg --location eastus

# 2. Create container
az container create \
  --resource-group cdms-rg \
  --name cdms-server \
  --image your-registry/cdms-server:latest \
  --cpu 1 \
  --memory 2 \
  --ports 5000 \
  --environment-variables DATABASE_URL=postgresql://...
```

## SSL/HTTPS Setup

### 1. Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Commercial SSL

1. Purchase SSL certificate from provider
2. Download certificate files
3. Update Nginx configuration with certificate paths
4. Test SSL configuration

## Monitoring and Logging

### 1. Application Monitoring

**PM2 Monitoring:**
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart cdms-server
```

**Docker Monitoring:**
```bash
# View container status
docker ps

# View logs
docker logs cdms-server

# Resource usage
docker stats
```

### 2. System Monitoring

**Setup monitoring scripts:**
```bash
#!/bin/bash
# /usr/local/bin/church-monitor.sh

# Check if application is running
if ! curl -f http://localhost:5000/api/health; then
    echo "Application is down - restarting..."
    pm2 restart cdms-server
    # Send notification
    curl -X POST https://hooks.slack.com/your-webhook \
      -d 'text="CDMS application restarted on server'"
fi

# Check database connection
if ! pg_isready -h localhost -p 5432; then
    echo "Database is down"
    # Send alert
fi
```

### 3. Log Management

**Configure log rotation:**
```bash
# /etc/logrotate.d/church-management
/var/log/church-management/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Backup Strategy

### 1. Database Backups

**Automated backup script:**
```bash
#!/bin/bash
# /usr/local/bin/backup-database.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="church_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U church_user -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Schedule backups:**
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh

# Weekly backup on Sunday at 3 AM
0 3 * * 0 /usr/local/bin/backup-database.sh
```

### 2. File Backups

**Application files backup:**
```bash
#!/bin/bash
# /usr/local/bin/backup-files.sh

SOURCE_DIR="/var/www/church-management"
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C $SOURCE_DIR .

# Sync to cloud storage (AWS S3 example)
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/church-management/
```

## Security Hardening

### 1. Firewall Configuration

```bash
# UFW setup
sudo ufw enable
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 2. System Updates

```bash
# Regular updates
sudo apt update && sudo apt upgrade -y

# Security updates
sudo apt unattended-upgrades
```

### 3. Application Security

- Environment variables for sensitive data
- Database connection encryption
- Regular security patches
- Input validation and sanitization
- Rate limiting implementation
- CSRF protection
- XSS prevention headers

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_attendance_date ON attendance(check_in);
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_financial_date ON financial_records(date);
```

### 2. Caching Strategy

**Redis setup for caching:**
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3. CDN Configuration

**CloudFlare setup:**
1. Sign up for CloudFlare account
2. Add domain to CloudFlare
3. Update nameservers to CloudFlare
4. Configure caching rules
5. Enable SSL (CloudFlare provides free SSL)

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U church_user -d church_db

# View logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**2. Application Not Starting**
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs cdms-server --err

# Check port usage
sudo netstat -tlnp | grep :5000
```

**3. SSL Certificate Issues**
```bash
# Test SSL configuration
sudo nginx -t

# Check certificate expiry
openssl x509 -in /path/to/cert.pem -noout -dates

# Renew certificate
sudo certbot renew
```

### Health Checks

**Application health endpoint:**
```javascript
// server/src/routes/health.js
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

## Maintenance

### 1. Regular Tasks

- **Daily**: Check logs, monitor performance, verify backups
- **Weekly**: Apply security updates, review error logs
- **Monthly**: Database optimization, SSL certificate renewal check
- **Quarterly**: Security audit, performance review

### 2. Update Process

```bash
# 1. Backup current version
./backup-database.sh
./backup-files.sh

# 2. Update application
git pull origin main
npm ci --production
npm run build

# 3. Run migrations
npx prisma migrate deploy

# 4. Restart application
pm2 restart cdms-server

# 5. Verify deployment
curl -f http://localhost:5000/api/health
```

## Support

### Emergency Contacts
- **Technical Support**: tech-support@church-management.com
- **Security Issues**: security@church-management.com
- **Documentation**: https://docs.church-management.com

### Monitoring Services
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Bugsnag
- **Performance Monitoring**: New Relic, DataDog

---

**Last Updated**: January 2024
**Version**: 1.0.0
