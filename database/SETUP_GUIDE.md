# Supabase Database Setup Guide

## Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project (elvisbitolo.supabase.co)
3. Click on "SQL Editor" in the left sidebar

## Step 2: Run the Schema Script
1. Copy the entire content from `supabase-schema.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

## Step 3: Enable Authentication
1. Go to "Authentication" → "Settings"
2. Make sure "Enable email confirmations" is OFF (for testing)
3. Check that "Enable phone confirmations" is OFF (for testing)

## Step 4: Update Auth Settings
1. In Authentication → "Settings", add these site URLs:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/**`

## Step 5: Test the Setup
After running the SQL script, you should have these tables:
- `users` - User profiles and authentication
- `orders` - Delivery orders
- `messages` - Real-time chat messages
- `ratings` - Order ratings and feedback
- `notifications` - User notifications

## Step 6: Verify Real-time Features
1. Go to "Database" → "Replication"
2. Make sure "Realtime" is enabled
3. The tables should be automatically configured for real-time subscriptions

## Important Notes

### Users Table Structure
- **id**: UUID (primary key)
- **name**: User's full name
- **email**: Unique email address
- **phone**: Phone number with validation
- **user_type**: 'seller' or 'rider'
- **rider_type**: 'motorcycle' or 'driver' (for riders only)
- **area**: Service area (for riders)
- **vehicle_number**: Vehicle registration (for riders)
- **is_online**: Real-time online status
- **is_available**: Availability for orders

### Orders Table Structure
- **id**: UUID (primary key)
- **order_number**: Unique order ID (ORD-12345)
- **seller_id**: References users table
- **rider_id**: References users table (nullable until accepted)
- **pickup_location**: Pickup address
- **delivery_location**: Delivery address
- **package_description**: Package details
- **delivery_fee**: Delivery cost
- **status**: Order status (pending → accepted → in_transit → delivered)

### Messages Table Structure
- **id**: UUID (primary key)
- **sender_id**: Message sender
- **receiver_id**: Message receiver
- **content**: Message text
- **is_read**: Read status
- **created_at**: Timestamp

## Testing the Setup

1. **Create Test User**: Try signing up through the frontend
2. **Verify Tables**: Check that user appears in the `users` table
3. **Test Orders**: Create an order and verify it appears in `orders` table
4. **Test Chat**: Send a message and verify it appears in `messages` table

## Troubleshooting

### Common Issues:
- **"relation does not exist"**: Run the schema script again
- **Authentication errors**: Check Auth settings and redirect URLs
- **Real-time not working**: Ensure Replication is enabled

### Quick Fixes:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Security Notes

The schema includes Row Level Security (RLS) policies that:
- Users can only see their own data
- Sellers can only manage their orders
- Riders can only see assigned orders
- Messages are private between sender/receiver

This ensures data privacy and security in your multi-tenant application.
