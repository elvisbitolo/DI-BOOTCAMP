# Frontend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   
   The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/           # React components
│   ├── LandingPage.js   # Landing page with auth
│   ├── LoginPage.js     # Login form
│   ├── SignupPage.js    # Registration form
│   ├── SellerDashboard.js # Seller main interface
│   ├── RiderDashboard.js  # Rider main interface
│   └── ChatPage.js     # Real-time chat interface
├── App.js              # Main application component
├── App.css             # Global styles
├── index.js            # Application entry point
└── index.css           # Base styles
```

## Features Implemented

### User Interface
- Responsive design for mobile and desktop
- Modern UI with Tailwind CSS
- Multi-language support (English/Swahili)
- Intuitive navigation

### Authentication
- Login and registration forms
- Password strength indicator
- Email verification
- Password reset functionality

### Seller Dashboard
- Order creation form
- Order management
- Real-time order tracking
- Statistics and earnings
- Profile management

### Rider Dashboard
- Available orders view
- Order acceptance
- Status updates
- Availability toggle
- Earnings tracking

### Real-time Chat
- Instant messaging
- Message read receipts
- File attachment support
- Location sharing

### Additional Features
- Credibility scoring system
- Multi-category ratings
- Email notifications
- Order tracking

## Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

### Icons
Lucide React icons are used throughout the application.

### API Integration
All API calls are configured to work with the backend server. Update the `REACT_APP_API_URL` environment variable for different environments.

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
- `REACT_APP_API_URL` - Production API URL
- `REACT_APP_SUPABASE_URL` - Production Supabase URL
- `REACT_APP_SUPABASE_ANON_KEY` - Production Supabase key

### Static File Serving
The build output can be served by any static file server or deployed to platforms like:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## Browser Compatibility

The application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Code splitting is implemented for optimal loading
- Images are optimized for web
- Lazy loading for heavy components
- Service worker for caching (in production)

## Security Notes

- All API calls use HTTPS in production
- Sensitive data is stored in environment variables
- Input validation on all forms
- XSS protection through React
- CSRF protection through backend
