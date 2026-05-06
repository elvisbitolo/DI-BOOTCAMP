# 🚀 Delivery System - Deployment Guide

## 📋 Quick Setup Commands

### 1. Start Backend Server
```bash
cd backend
npm start
```
**Server runs on**: http://localhost:5000

### 2. Start Frontend
```bash
cd frontend  
npm start
```
**Frontend runs on**: http://localhost:3000

### 3. Test Both Services
Open two terminals or run in background:
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🔧 Environment Setup

### Backend Environment (.env)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# M-Pesa Configuration (Optional)
MPESA_ENV=production
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
```

### Frontend Environment (.env)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## 🌐 Local Testing

### 1. Database Setup
1. Go to Supabase Dashboard
2. Run SQL from `database/supabase-schema.sql`
3. Configure Authentication settings

### 2. Test Registration
1. Visit http://localhost:3000
2. Click "Sign Up"
3. Test both Seller and Rider registration
4. Check email for welcome message

### 3. Test Login
1. Use registered credentials
2. Verify dashboard access
3. Test single login session

### 4. Test Order Flow
1. Login as Seller
2. Create new order
3. Login as Rider (different browser)
4. Accept order as rider
5. Verify real-time updates

### 5. Test Chat
1. Start conversation between seller and rider
2. Test real-time messaging
3. Verify typing indicators

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)
```bash
# Deploy Frontend to Vercel
cd frontend
npm run build
npx vercel --prod

# Deploy Backend to Railway
cd backend
npm install -g @railway/cli
railway login
railway deploy
```

### Option 2: Netlify (Frontend) + Heroku (Backend)
```bash
# Deploy Frontend to Netlify
cd frontend
npm run build
netlify deploy --prod --dir=build

# Deploy Backend to Heroku
cd backend
heroku create delivery-system-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Option 3: AWS (Full Stack)
```bash
# Deploy with AWS Amplify
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

### Option 4: DigitalOcean App Platform
```bash
# Deploy to DigitalOcean
cd backend
npx digitalocean-apps create delivery-system
git push digitalocean main
```

## 🔍 Production Checklist

### Before Deployment
- [ ] Update environment variables for production
- [ ] Enable SSL certificates
- [ ] Set up production database
- [ ] Configure production email service
- [ ] Set up domain names
- [ ] Test all features in production

### Environment Variables for Production
```env
# Production URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Production Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=prod_anon_key

# Production Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true

# Security
NODE_ENV=production
JWT_SECRET=strong_production_secret
```

## 📱 Mobile Deployment

### Progressive Web App (PWA)
```bash
# Enable PWA features
cd frontend
npm run build
# Build outputs to build/ folder
# Deploy build/ folder to any static host
```

### React Native (Future)
```bash
# For mobile app development
npx react-native init DeliverySystem
# Install Supabase client for React Native
npm install @supabase/supabase-js
```

## 🌍 Domain Configuration

### Custom Domain Setup
1. **Backend Domain**: api.your-domain.com
2. **Frontend Domain**: your-domain.com
3. **Subdomain**: app.your-domain.com (optional)

### DNS Records
```
A    api     -> backend-server-ip
A    www     -> frontend-server-ip
CNAME app     -> frontend-domain.com
```

## 🔐 Security Configuration

### SSL Certificates
```bash
# Generate SSL certificates
certbot --nginx -d your-domain.com
# Or use Let's Encrypt via hosting provider
```

### Firewall Setup
```bash
# Open required ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 5000  # Backend API
```

## 📊 Monitoring & Analytics

### Application Monitoring
```bash
# Add monitoring
npm install -g newrelic
# Configure New Relic for both frontend and backend
```

### Error Tracking
```bash
# Set up error tracking
npm install -g @sentry/cli
sentry-cli init
sentry-cli releases
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy to Production
        run: |
          # Your deployment commands here
```

## 🚨 Troubleshooting

### Common Deployment Issues
1. **CORS Errors**: Update FRONTEND_URL in backend
2. **Database Connection**: Check Supabase credentials
3. **Build Failures**: Clear node_modules and reinstall
4. **Email Not Working**: Verify SMTP settings
5. **Real-time Issues**: Check Socket.io configuration

### Health Checks
```bash
# Test backend health
curl https://api.your-domain.com/api/health

# Test frontend
curl https://your-domain.com
```

## 📞 Support

### Production Issues
1. Check server logs: `pm2 logs`
2. Monitor database: Supabase Dashboard
3. Test API endpoints: Postman/Insomnia
4. Check email delivery: Gmail sent folder

### Performance Optimization
1. Enable CDN for static assets
2. Optimize database queries
3. Implement caching
4. Use compression middleware

---

**Ready for production deployment! 🎯**
