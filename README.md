#  Gikomba Delivery System

A modern, real-time delivery management platform built with React, Node.js, and Supabase. Connects sellers with riders for efficient package delivery across Nairobi.

##  Features

###  For Sellers
- **Real-time Order Management**: Create and track deliveries instantly
- **Live Rider Tracking**: See available riders in your area
- **Direct Communication**: Chat with riders in real-time
- **Email Notifications**: Get updates for order status changes
- **Order History**: View all past and current deliveries

###  For Riders
- **Flexible Vehicle Options**: Choose between motorcycle or car delivery
- **Area-based Service**: Define your service coverage area
- **Real-time Order Alerts**: Get notified of new delivery requests
- **Availability Management**: Toggle your online status
- **Earnings Tracking**: Monitor completed orders and income
- **Direct Chat**: Communicate with sellers for delivery details

### 🔧 Technical Features
- **Real-time Updates**: Live order status and messaging using Socket.io
- **Secure Authentication**: Supabase-powered user management
- **Email Notifications**: Professional email templates for all events
- **Mobile Responsive**: Works seamlessly on all devices
- **Data Validation**: Strict input validation for user safety
- **Row-level Security**: Users can only access their own data

##  Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Supabase Client** - Real-time database client
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **Socket.io** - Real-time server
- **Nodemailer** - Email notifications
- **JWT** - Secure authentication tokens
- **Express Validator** - Input validation

### Database
- **Supabase PostgreSQL** - Scalable database
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Data protection
- **Storage Buckets** - File management

##  Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account
- Gmail account (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/elvidbitolo/DI_BOOTCAMP.git
cd DI_BOOTCAMP
```

### 2. Database Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Open SQL Editor and run the schema from `database/supabase-schema.sql`
4. Configure Authentication settings:
   - Disable email confirmations (for testing)
   - Add site URL: `http://localhost:3000`
   - Add redirect URLs: `http://localhost:3000/**`

### 3. Environment Setup

#### Backend (.env)
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
```

#### Frontend (.env)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run start:supabase
```
Server runs on `http://localhost:5000`

#### Start Frontend
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

##  Usage Guide

### For Sellers
1. **Sign Up**: Create an account with your business details
2. **Create Order**: Add pickup/delivery locations and package details
3. **Track Delivery**: Monitor rider location and order status
4. **Communicate**: Chat with riders for delivery coordination

### For Riders
1. **Register**: Choose vehicle type and service area
2. **Set Availability**: Toggle your online status
3. **View Orders**: See available deliveries in your area
4. **Accept Orders**: Start earning by delivering packages
5. **Track Progress**: Update order status in real-time

##  Real-time Features

### Live Order Updates
- Orders appear instantly for online riders
- Status changes update in real-time
- Location tracking during delivery

### Real-time Chat
- Instant messaging between sellers and riders
- Typing indicators
- Read receipts
- Message history

### Online Status
- See which riders are currently available
- Real-time availability updates
- Last seen timestamps

##  Email Notifications

The system automatically sends emails for:

### User Events
- **Welcome Email**: When users register
- **Password Reset**: When users request password changes

### Order Events
- **Order Confirmation**: When sellers create orders
- **Order Accepted**: When riders accept deliveries
- **Order Delivered**: When deliveries are completed
- **New Order Alert**: When new orders are available (riders)

##  Project Structure

```
gikomba-delivery-system/
├── backend/
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication middleware
│   ├── services/         # Email service
│   ├── models/           # Database models (legacy)
│   └── server-supabase.js # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   └── supabaseClient.js # Supabase client
│   └── public/
├── database/
│   ├── supabase-schema.sql # Database schema
│   └── SETUP_GUIDE.md    # Database setup instructions
└── docs/
    ├── COMPLETE_SETUP.md # Full setup guide
    └── EMAIL_SETUP.md    # Email configuration
```

##  Security Features

### Authentication
- JWT-based secure authentication
- Password strength validation
- Email and phone verification
- Session management

### Data Protection
- Row-level security in Supabase
- Input validation and sanitization
- SQL injection prevention
- XSS protection with Helmet.js

### Rate Limiting
- API rate limiting to prevent abuse
- Email sending limits
- Login attempt restrictions

##  Testing

### Manual Testing
1. **User Registration**: Test both seller and rider signup
2. **Order Flow**: Create → Accept → Track → Complete
3. **Real-time Features**: Test chat and status updates
4. **Email Notifications**: Verify all email triggers
5. **Mobile Responsiveness**: Test on different screen sizes

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","userType":"seller"}'
```

##  Deployment

### Environment Setup
1. **Production Database**: Configure production Supabase project
2. **Environment Variables**: Set production values
3. **Domain Configuration**: Update CORS and redirect URLs
4. **Email Service**: Configure production email (SendGrid recommended)

### Deployment Options
- **Vercel**: Frontend deployment
- **Heroku**: Full-stack deployment
- **DigitalOcean**: Custom server deployment
- **AWS**: Enterprise deployment

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Supabase** - Database and authentication platform
- **React** - UI framework
- **Node.js** - Backend runtime
- **Lucide** - Icon library
- **Tailwind CSS** - Styling framework

##  Support

For support and questions:

-📧 Email: elvisbitolo11@gmail.com
-  Issues: [GitHub Issues](https://github.com/elvidbitolo/DI_BOOTCAMP/issues)
-  Documentation: [Complete Setup Guide](COMPLETE_SETUP.md)

## Roadmap

### Upcoming Features
- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] GPS tracking integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Delivery route optimization
- [ ] Customer rating system
- [ ] Bulk order processing

### Performance Improvements
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Database optimization
- [ ] CDN integration

