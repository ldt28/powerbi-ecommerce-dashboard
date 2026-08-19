# Deployment Guide

This guide covers deployment options and configurations for the PowerBI Ecommerce Dashboard.

## Prerequisites

Before deploying, ensure you have:

- A MySQL database (v8.0+) instance
- Environment variables configured
- Domain name (for production)
- SSL certificate (for production)

## Environment Variables

Create a `.env` file with all required variables:

```env
# Required
DATABASE_URL=mysql://username:password@host:3306/database_name
OWNER_OPEN_ID=your-owner-open-id
SESSION_SECRET=your-secret-key-min-32-chars-long

# Optional but Recommended
NODE_ENV=production
PORT=3000

# AWS S3 (for exports)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email Notifications (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Slack Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option with automatic CI/CD.

#### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `powerbi-ecommerce-dashboard`

#### Step 2: Configure Build Settings

In Vercel dashboard, configure:

```
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

#### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add all variables from the `.env` template above.

**Important**: Mark sensitive variables (DATABASE_URL, SESSION_SECRET, API keys) as "Sensitive" (encrypted).

#### Step 4: Deploy

Click "Deploy". Vercel will:
- Install dependencies
- Run database migrations
- Build the application
- Deploy to a production URL

#### Step 5: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning (~5 minutes)

#### Automatic Database Migrations

Add a post-build script to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "pnpm db:push && pnpm build"
  }
}
```

---

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/powerbi_dashboard
      - OWNER_OPEN_ID=${OWNER_OPEN_ID}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: powerbi_dashboard
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

volumes:
  mysql_data:
```

#### Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app pnpm db:push

# Stop containers
docker-compose down
```

---

### Option 3: Traditional VPS Deployment

#### Server Requirements

- Ubuntu 20.04+ or similar Linux distribution
- 2GB RAM minimum (4GB recommended)
- 20GB storage
- Node.js 18+ installed
- MySQL 8.0+ installed
- Nginx (reverse proxy)
- PM2 (process manager)

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Clone Repository

```bash
cd /var/www
git clone https://github.com/ldt28/powerbi-ecommerce-dashboard.git
cd powerbi-ecommerce-dashboard
pnpm install
```

#### Step 3: Configure Environment

```bash
nano .env
# Add all environment variables
```

#### Step 4: Set Up Database

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p << EOF
CREATE DATABASE powerbi_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON powerbi_dashboard.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Run migrations
pnpm db:push
```

#### Step 5: Build Application

```bash
pnpm build
```

#### Step 6: Configure PM2

```bash
# Start application with PM2
pm2 start dist/index.js --name powerbi-dashboard

# Save PM2 configuration
pm2 save

# Enable PM2 on boot
pm2 startup systemd -u $USER --hp $HOME
```

#### Step 7: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/powerbi-dashboard
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/powerbi-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

---

### Option 4: AWS Deployment

#### Using EC2

Follow the VPS deployment steps above on an EC2 instance.

#### Using ECS (Elastic Container Service)

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Configure ECS service with load balancer
4. Set up RDS for MySQL database

#### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p docker-20.04 powerbi-dashboard --region us-east-1

# Create environment
eb create powerbi-dashboard-prod

# Deploy
eb deploy
```

Set environment variables:

```bash
eb setenv DATABASE_URL=your-db-url \
  OWNER_OPEN_ID=your-owner-id \
  SESSION_SECRET=your-secret
```

---

## Post-Deployment Checklist

### Security

- [ ] All environment variables are set correctly
- [ ] HTTPS is enabled
- [ ] Database credentials are strong and unique
- [ ] SESSION_SECRET is at least 32 characters
- [ ] Firewall rules are configured
- [ ] Regular security updates are scheduled

### Performance

- [ ] Database indexes are created
- [ ] CDN is configured for static assets
- [ ] Gzip compression is enabled
- [ ] Browser caching is configured
- [ ] Database connection pooling is optimized

### Monitoring

- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Uptime monitoring is configured (e.g., UptimeRobot)
- [ ] Log aggregation is enabled
- [ ] Performance monitoring is active
- [ ] Alert notifications are configured

### Backup

- [ ] Database backups are scheduled daily
- [ ] Backup restoration procedure is documented
- [ ] Off-site backup storage is configured

---

## Maintenance

### Updating Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Run database migrations
pnpm db:push

# Rebuild
pnpm build

# Restart (PM2)
pm2 restart powerbi-dashboard

# Or (Docker)
docker-compose up -d --build
```

### Database Backups

```bash
# Manual backup
mysqldump -u user -p powerbi_dashboard > backup-$(date +%Y%m%d).sql

# Automated backup script (add to crontab)
0 2 * * * mysqldump -u user -p'password' powerbi_dashboard > /backups/backup-$(date +\%Y\%m\%d).sql
```

### Log Management

```bash
# View PM2 logs
pm2 logs powerbi-dashboard

# View application logs
tail -f /var/log/powerbi-dashboard/error.log

# Rotate logs (prevent disk fill)
sudo logrotate /etc/logrotate.d/powerbi-dashboard
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs powerbi-dashboard --lines 100

# Verify environment variables
printenv | grep -E "(DATABASE|SESSION|OWNER)"

# Test database connection
mysql -u user -p -h host database_name
```

### Database Connection Errors

1. Verify DATABASE_URL format
2. Check database server is running
3. Ensure firewall allows connections
4. Verify user permissions

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# Adjust PM2 max memory
pm2 restart powerbi-dashboard --max-memory-restart 500M
```

### Slow Performance

1. Check database query performance
2. Review slow query log
3. Optimize database indexes
4. Consider adding Redis cache
5. Scale horizontally with load balancer

---

## Support

For deployment issues:
- Check application logs
- Review error messages in browser console
- Consult the troubleshooting section above
- Open a GitHub issue with deployment details
