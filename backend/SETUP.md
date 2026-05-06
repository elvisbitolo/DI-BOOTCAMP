# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

## Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `EMAIL_HOST`: SMTP server (e.g., smtp.gmail.com)
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email password or app password

3. **Database Setup**
   Ensure MongoDB is running and create a database named `gikomba-delivery`.

4. **Start the Server**
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### User Endpoints
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/location` - Update rider location
- `PUT /api/users/availability` - Update rider availability
- `GET /api/users/nearby` - Get nearby riders
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/upload-profile-image` - Upload profile image
- `DELETE /api/users/account` - Deactivate account

### Order Endpoints
- `POST /api/orders` - Create new order (seller only)
- `GET /api/orders` - Get orders
- `GET /api/orders/available` - Get available orders (riders only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/accept` - Accept order (riders only)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Chat Endpoints
- `GET /api/chats/order/:orderId` - Get chat for order
- `POST /api/chats/order/:orderId/messages` - Send message
- `PUT /api/chats/order/:orderId/read` - Mark messages as read
- `GET /api/chats` - Get all user chats
- `DELETE /api/chats/order/:orderId` - Deactivate chat

### Rating Endpoints
- `POST /api/ratings` - Create rating
- `GET /api/ratings/user/:userId` - Get user ratings
- `GET /api/ratings/my-ratings` - Get my ratings
- `GET /api/ratings/order/:orderId` - Get order ratings
- `PUT /api/ratings/:id/respond` - Respond to rating
- `GET /api/ratings/stats/:userId` - Get rating statistics

## Features Implemented

### Authentication & Security
- JWT-based authentication
- Password strength validation
- Email verification
- Password reset functionality
- Rate limiting

### User Management
- Seller and rider roles
- Profile management
- Location tracking for riders
- Availability status management

### Order Management
- Order creation with detailed package information
- Real-time order availability for riders
- Order status tracking
- Distance-based order matching

### Real-time Chat
- Socket.io integration
- Message read receipts
- Chat history
- File and location sharing support

### Rating System
- Multi-category ratings (communication, punctuality, professionalism, quality)
- Credibility score calculation
- Rating responses
- Rating statistics

### Email Notifications
- Welcome emails
- Order notifications
- Status updates
- Password reset emails

### Multi-language Support
- English and Swahili translations
- Extensible for more Kenyan languages

## Deployment Notes

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure `JWT_SECRET`
- Configure production database URL
- Set up production email service

### Security Considerations
- Enable HTTPS in production
- Use environment variables for sensitive data
- Implement proper CORS configuration
- Set up database indexes for performance
- Configure rate limiting appropriately

### Scaling Considerations
- Use Redis for session storage
- Implement database connection pooling
- Set up load balancing
- Configure CDN for static assets
- Monitor and log application performance
