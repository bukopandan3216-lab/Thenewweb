# FarmDirect Deployment Guide

Complete setup and deployment instructions for FarmDirect platform.

## 📋 Prerequisites

- Node.js 18+ (`node --version`)
- MySQL 5.7+ or MariaDB 10.3+
- Git (for version control)
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

## 🚀 Local Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd Thenewweb

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create database and run migrations
cd backend
node scripts/init-db.js --admin --seed
```

This will:
- Create `farmdirect` database
- Run schema migrations
- Seed sample data
- Create admin user: `admin@farmdirect.ph` / `admin123`

### 3. Environment Configuration

**Backend** - Create `backend/.env`:
```bash
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=farmdirect

JWT_SECRET=your_secret_key_here_change_in_production
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
COMMISSION_RATE=5
```

**Frontend** - Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Locally

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

## 🌐 Production Deployment

### Backend Deployment to Render

1. **Prepare backend**:
```bash
cd backend
# Ensure .env has production values
git add .
git commit -m "Ready for production"
git push
```

2. **Deploy to Render**:
   - Go to [Render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repo
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables:
     ```
     PORT=5000
     NODE_ENV=production
     DB_HOST=<production-db-host>
     DB_PORT=3306
     DB_USER=<db-user>
     DB_PASSWORD=<db-password>
     DB_NAME=farmdirect
     JWT_SECRET=<long-random-secret>
     ALLOWED_ORIGINS=https://yourdomain.com
     ```

3. **Initialize production database**:
```bash
# On production server via SSH or Render dashboard
node scripts/init-db.js --admin
```

### Frontend Deployment to Vercel

1. **Prepare frontend**:
```bash
cd frontend
npm run build
# Verify dist/ folder is created
git add .
git commit -m "Production build ready"
git push
```

2. **Deploy to Vercel**:
   - Go to [Vercel.com](https://vercel.com)
   - Import GitHub repository
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables:
     ```
     VITE_API_URL=https://backend-api.onrender.com/api
     ```
   - Deploy

3. **Configure SPA routing**:
   - Vercel automatically detects `vercel.json` in frontend
   - Routes all requests to `index.html` for React Router

## 📊 Database Backups

### Automated Backups (Render)

Render PostgreSQL/MySQL services offer automated daily backups.

### Manual Backup

```bash
# Export database
mysqldump -u root -p farmdirect > backup-$(date +%Y%m%d).sql

# Restore database
mysql -u root -p farmdirect < backup-20260525.sql
```

## 🔒 Security Checklist

- [ ] Change admin password immediately after setup
- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Enable HTTPS on production
- [ ] Set CORS to production domain only
- [ ] Rotate database passwords regularly
- [ ] Use environment variables for all secrets
- [ ] Enable database encryption
- [ ] Set up automated backups
- [ ] Monitor API logs for unauthorized access
- [ ] Rate limit API endpoints

## 📈 Monitoring

### Application Monitoring

- **Render**: Built-in monitoring dashboard
- **Vercel**: Analytics and performance metrics

### Error Tracking

Add error tracking service (optional):
```bash
npm install @sentry/node

# In server.js
const Sentry = require('@sentry/node')
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### Logs

```bash
# View Render logs
render logs <service-id>

# View production errors
tail -f /var/log/farmdirect.log
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy FarmDirect

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test connection
mysql -h localhost -u root -p farmdirect -e "SELECT 1"

# Check MySQL status
systemctl status mysql
```

### Build Failures

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS Errors

Update `backend/.env`:
```
ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

## 📞 Support Resources

- **Backend Issues**: Check `backend/server.js` logs
- **Frontend Issues**: Check browser console (F12)
- **Database Issues**: Check MySQL error logs
- **Deployment Issues**: Check Render/Vercel dashboard

## 🎯 Next Steps

1. Set up production database
2. Configure payment gateway (GCash/PayMaya)
3. Set up email notifications (SendGrid)
4. Configure SMS alerts (Twilio)
5. Implement analytics (Google Analytics)
6. Set up CDN for image optimization
7. Configure automated backups
8. Set up monitoring and alerting
