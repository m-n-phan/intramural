# Deployment Guide

This document provides instructions for deploying the Intramural Sports Management Platform to various environments.

## 🚀 Quick Deploy to GitHub

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `intramural-sports-platform` (or your preferred name)
3. Set it to public or private as desired
4. Don't initialize with README (we already have one)

### Step 2: Push to GitHub

```bash
# Remove any existing remote
git remote remove origin 2>/dev/null || true

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/intramural-sports-platform.git

# Add all files
git add .

# Commit the initial version
git commit -m "Initial commit: Complete intramural sports platform with authentication, team management, and payment integration"

# Push to GitHub
git push -u origin main
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file with these variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your_host
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database

# Authentication
SESSION_SECRET=your_secure_session_secret
REPL_ID=your_replit_app_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-app-domain.replit.app

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Environment
NODE_ENV=production
```

### Getting API Keys

#### Stripe Setup:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (pk_test_...) for `VITE_STRIPE_PUBLIC_KEY`
3. Copy your **Secret key** (sk_test_...) for `STRIPE_SECRET_KEY`

#### Database Setup:
1. Create a PostgreSQL database on [Supabase](https://supabase.com) or similar
2. Copy the connection string for `DATABASE_URL`

## 🌐 Deployment Options

### Option 1: Replit Deployments (Recommended)

1. **Enable Deployments**:
   - Go to your Replit project
   - Click on "Deployments" in the sidebar
   - Click "Create Deployment"

2. **Configure Environment Variables**:
   - Add all required environment variables in the deployment settings
   - Ensure `NODE_ENV=production`

3. **Deploy**:
   - Click "Deploy" to build and deploy your application
   - Your app will be available at `https://your-app-name.replit.app`

### Option 2: Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required environment variables

### Option 3: Railway Deployment

1. **Connect to Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Configure Database**:
   ```bash
   railway add postgresql
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

### Option 4: Heroku Deployment

1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Configure Environment Variables**:
   ```bash
   heroku config:set SESSION_SECRET=your_secret
   heroku config:set STRIPE_SECRET_KEY=your_stripe_key
   heroku config:set VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

## 📊 Production Checklist

### Before Deployment:

- [ ] All environment variables configured
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Stripe webhooks configured
- [ ] SSL certificates enabled
- [ ] Domain name configured (if using custom domain)
- [ ] Error monitoring set up
- [ ] Backup strategy implemented

### After Deployment:

- [ ] Test authentication flow
- [ ] Test payment integration
- [ ] Test all user roles (Admin, Captain, Referee, Player)
- [ ] Test team creation and management
- [ ] Test game scheduling
- [ ] Verify email notifications (if implemented)
- [ ] Test mobile responsiveness

## 🔍 Monitoring and Maintenance

### Health Checks

The application exposes health check endpoints:
- `GET /api/health` - Application health
- `GET /api/auth/user` - Authentication status

### Logging

Monitor these logs in production:
- Authentication failures
- Payment processing errors
- Database connection issues
- API response times

### Database Maintenance

Regular maintenance tasks:
- Monitor connection pool usage
- Check for slow queries
- Backup database regularly
- Update dependencies monthly

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Errors**:
   - Check `SESSION_SECRET` is set
   - Verify `REPLIT_DOMAINS` matches your domain
   - Ensure database sessions table exists

2. **Payment Failures**:
   - Verify Stripe keys are correct
   - Check webhook endpoints are accessible
   - Monitor Stripe dashboard for errors

3. **Database Connection Issues**:
   - Check `DATABASE_URL` format
   - Verify connection pool settings
   - Monitor connection limits

### Debug Commands:

```bash
# Check environment variables
env | grep -E "(DATABASE|STRIPE|SESSION)"

# Test database connection
npm run db:studio

# Check application logs
npm run dev
```

## 📱 Mobile App Deployment (Future)

When the mobile app is ready:

1. **iOS Deployment**:
   - Configure Xcode project
   - Submit to App Store Connect
   - Handle push notifications

2. **Android Deployment**:
   - Configure Android Studio project
   - Submit to Google Play Console
   - Configure Firebase for notifications

## 🔒 Security Considerations

### Production Security:

- Use HTTPS only
- Implement rate limiting
- Configure CORS properly
- Use secure session cookies
- Implement CSP headers
- Regular security audits

### Environment Security:

- Never commit `.env` files
- Use secret management services
- Rotate API keys regularly
- Monitor for security vulnerabilities
- Keep dependencies updated

## 📈 Scaling Considerations

### Database Scaling:

- Connection pooling optimization
- Read replicas for analytics
- Database indexing optimization
- Query performance monitoring

### Application Scaling:

- Load balancer configuration
- Horizontal scaling setup
- CDN for static assets
- Caching strategy implementation

This deployment guide ensures your Intramural Sports Management Platform is properly configured and deployed for production use.