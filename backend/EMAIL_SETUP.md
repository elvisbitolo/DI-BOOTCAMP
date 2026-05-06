# Email Notifications Setup Guide

## Prerequisites

1. **Gmail Account**: Use your existing Gmail account (elvisbitolo11@gmail.com)
2. **App Password**: Generate an App Password for the application
3. **Environment Variables**: Update your .env file

## Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Step Verification (if not already enabled)
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password:
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Name it: "Gikomba Delivery"
5. Copy the 16-character password

## Step 2: Update Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration
EMAIL_USER=elvisbitolo11@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Step 3: Install Dependencies

```bash
cd backend
npm install nodemailer
```

Or use the provided package file:

```bash
cp package-email.json package.json
npm install
```

## Step 4: Test Email Service

Create a test file `test-email.js`:

```javascript
const EmailService = require('./services/emailService');

const emailService = new EmailService();

async function testEmail() {
  try {
    const result = await emailService.sendEmail(
      'elvisbitolo11@gmail.com',
      'Test Email from Gikomba Delivery',
      '<h1>Test Successful!</h1><p>Your email service is working.</p>'
    );
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEmail();
```

Run the test:
```bash
node test-email.js
```

## Email Templates Included

### 1. Welcome Email
- Sent when users register
- Different content for sellers vs riders
- Includes dashboard link

### 2. Order Confirmation
- Sent to sellers when they create an order
- Includes order details and next steps

### 3. Order Accepted
- Sent to sellers when a rider accepts their order
- Includes rider information and contact options

### 4. Order Delivered
- Sent to sellers when delivery is completed
- Includes rating prompt and delivery summary

### 5. New Order Notification
- Sent to online riders when new orders are available
- Includes order details and quick action buttons

## Automatic Email Triggers

### Registration
```javascript
// Triggered in auth-supabase.js
await emailService.sendWelcomeEmail(email, name, userType);
```

### Order Creation
```javascript
// Triggered in orders-supabase.js
await emailService.sendOrderConfirmationEmail(sellerEmail, order);
// Also notifies all online riders
```

### Order Acceptance
```javascript
// Triggered when rider accepts order
await emailService.sendOrderAcceptedEmail(sellerEmail, order, riderDetails);
```

### Order Delivery
```javascript
// Triggered when order is marked as delivered
await emailService.sendOrderDeliveredEmail(sellerEmail, order, riderDetails);
```

## Email Features

### Professional Design
- Responsive HTML templates
- Beautiful gradients and styling
- Clear action buttons
- Mobile-friendly layout

### Personalization
- User names in greetings
- Order-specific details
- Rider information
- Dynamic content based on user type

### Security
- Uses Gmail SMTP with App Password
- No password stored in code
- Environment variable protection
- Rate limiting to prevent spam

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Generate a new App Password
   - Ensure 2-Step Verification is enabled

2. **"Email not sending"**
   - Check Gmail SMTP settings
   - Verify environment variables
   - Check network connectivity

3. **"Template not rendering"**
   - Ensure HTML is properly formatted
   - Check for missing variables
   - Test with simple HTML first

### Debug Mode

Add this to your email service for debugging:

```javascript
// In emailService.js constructor
this.transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});
```

## Production Considerations

### Email Limits
- Gmail: 500 emails/day via SMTP
- Consider using SendGrid for higher volumes
- Implement email queuing for bulk sends

### Monitoring
- Log all email sends and failures
- Track delivery rates
- Monitor bounce backs

### Alternatives
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 1000 emails/month)
- AWS SES (pay-as-you-go)

## Testing Checklist

- [ ] Gmail App Password generated
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Test email sent successfully
- [ ] Registration email works
- [ ] Order emails trigger correctly
- [ ] All templates render properly

Once setup is complete, your email notifications will work automatically for all user interactions!
