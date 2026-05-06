# 🚀 Gikomba Delivery System - Complete Setup Guide

## 📋 Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] Supabase account and project
- [ ] Gmail account with 2-Step Verification
- [ ] Git for version control

## 🗄️ Step 1: Database Setup

### 1.1 Create Supabase Tables
1. Go to https://supabase.com/dashboard
2. Select your project (elvisbitolo.supabase.co)
3. Open SQL Editor
4. Copy and run the entire content from `database/supabase-schema.sql`
5. Click "Run" to execute

### 1.2 Configure Authentication
1. Go to Authentication → Settings
2. Disable "Enable email confirmations" (for testing)
3. Add Site URL: `http://localhost:3000`
4. Add Redirect URLs: `http://localhost:3000/**`

## 📧 Step 2: Email Setup

### 2.1 Generate Gmail App Password
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification → App passwords
3. Generate new app password:
   - App: "Mail"
   - Device: "Other (Custom name)"
   - Name: "Gikomba Delivery"
4. Copy the 16-character password

### 2.2 Update Environment Variables
Add to `backend/.env`:
```env
# Email Configuration
EMAIL_USER=elvisbitolo11@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## 🛠️ Step 3: Backend Setup

### 3.1 Install Dependencies
```bash
cd backend
npm install
```

### 3.2 Verify Environment
Ensure `backend/.env` contains:
```env
# Database
SUPABASE_URL=https://elvisbitolo.supabase.co
SUPABASE_ANON_KEY=sb_publishable_rb6udSFZ2TGRLH1U0ZuoDg_UBuVro1g
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# JWT
JWT_SECRET=51995c18-ce4d-412c-af9d-682d7428a9b0

# Email
EMAIL_USER=elvisbitolo11@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

### 3.3 Start Backend Server
```bash
npm run start:supabase
```
Server should run on http://localhost:5000

## 🎨 Step 4: Frontend Setup

### 4.1 Install Dependencies
```bash
cd frontend
npm install
```

### 4.2 Update Frontend Environment
Create `frontend/.env`:
```env
REACT_APP_SUPABASE_URL=https://elvisbitolo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_rb6udSFZ2TGRLH1U0ZuoDg_UBuVro1g
```

### 4.3 Start Frontend
```bash
npm start
```
Frontend should run on http://localhost:3000

## 🧪 Step 5: Test the System

### 5.1 Test User Registration
1. Go to http://localhost:3000
2. Click "Sign Up as Seller"
3. Fill form with valid data
4. Check email for welcome message
5. Try login

### 5.2 Test Rider Registration
1. Sign up as Rider
2. Select vehicle type (motorcycle/driver)
3. Add service area and vehicle number
4. Verify rider-specific fields work

### 5.3 Test Order Creation
1. Login as Seller
2. Create a new order
3. Check email for order confirmation
4. Verify order appears in dashboard

### 5.4 Test Order Acceptance
1. Login as Rider
2. View available orders
3. Accept an order
4. Check seller receives email notification

### 5.5 Test Real-time Chat
1. Login as Seller
2. Click on online rider
3. Send message
4. Verify real-time delivery

## 🔄 Step 6: Real-time Features Testing

### 6.1 Test Online Status
1. Open two browser windows
2. Login as different users
3. Check online status updates in real-time
4. Test availability toggle for riders

### 6.2 Test Order Updates
1. Create order as seller
2. Accept as rider
3. Update order status
4. Verify real-time notifications

### 6.3 Test Chat System
1. Start chat between seller and rider
2. Send messages in real-time
3. Test typing indicators
4. Verify message read status

## 📊 Step 7: Advanced Features

### 7.1 Test Email Notifications
- Welcome emails on registration
- Order confirmations
- Order acceptance notifications
- Order completion emails

### 7.2 Test Rider Features
- Vehicle type selection
- Service area specification
- Availability toggle
- Real-time location updates

### 7.3 Test Search and Discovery
- Search for users by name
- Filter by user type
- Area-based searches
- Online user filtering

## 🚨 Troubleshooting

### Common Issues

**"Database connection failed"**
- Verify Supabase URL and keys
- Check if SQL schema was executed
- Ensure tables exist

**"Email not sending"**
- Generate new Gmail App Password
- Check 2-Step Verification is enabled
- Verify email credentials in .env

**"Authentication failed"**
- Check Supabase Auth settings
- Verify redirect URLs
- Ensure JWT secret matches

**"Real-time not working"**
- Check Socket.io connection
- Verify user rooms are joined
- Check browser console for errors

### Debug Commands

```bash
# Check backend logs
cd backend && npm run start:supabase

# Check frontend logs
cd frontend && npm start

# Test database connection
curl http://localhost:5000/api/health

# Test email service
node -e "require('./services/emailService'); console.log('Email service loaded')"
```

## 🎯 Success Criteria

Your system is fully functional when:

✅ Users can register and login with real validation
✅ Email notifications are sent for all major events
✅ Real-time chat works between users
✅ Orders can be created and managed
✅ Riders can accept and track deliveries
✅ Online status updates in real-time
✅ All buttons and navigation work properly
✅ No fake data - only real users appear
✅ Single login session enforcement works

## 📱 Mobile Testing

Test on mobile browsers:
- Responsive design works
- Touch interactions work
- Real-time features function
- Email notifications received

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables** with production URLs
2. **Enable SSL** on both frontend and backend
3. **Configure production email service** (SendGrid recommended)
4. **Set up proper CORS** for production domain
5. **Enable Supabase production features**
6. **Set up monitoring and logging**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure database schema was executed
4. Check browser console for JavaScript errors
5. Check backend logs for server errors

Your Gikomba Delivery System should now be fully functional with all features working! 🎉
