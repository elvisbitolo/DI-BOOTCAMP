const getPasswordResetTemplate = (resetUrl) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Delivery System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
          <p>Delivery System</p>
        </div>
        
        <p>Hello,</p>
        <p>You requested to reset your password for your Delivery System account.</p>
        <p>Click the button below to reset your password:</p>
        <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        
        <div class="footer">
          <p>&copy; 2024 Delivery System. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
  </html>
`;

const getPasswordResetSuccessTemplate = () => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - Delivery System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful</h1>
          <p>Delivery System</p>
        </div>
        
        <p>Your password has been successfully reset!</p>
        <p>You can now log in with your new password.</p>
        
        <a href="${process.env.FRONTEND_URL}/login" class="button">Log In Now</a>
        
        <div class="footer">
          <p>&copy; 2024 Delivery System. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
  </html>
`;

const getWelcomeEmailTemplate = (userName, userType) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Delivery System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Welcome to Delivery System</h1>
          <p>Delivery System</p>
        </div>
        
        <p>Hello ${userName},</p>
        <p>Thank you for joining ${userType} Delivery System!</p>
        
        <h3>Getting Started:</h3>
        <ul>
          ${userType === 'seller' ? `
            <li>Create your first delivery order</li>
            <li>Connect with available riders in your area</li>
            <li>Track your deliveries in real-time</li>
          ` : `
            <li>Set your availability status to start receiving orders</li>
            <li>Accept delivery requests and start earning</li>
            <li>Update your profile and vehicle information</li>
            <li>Track your earnings and completed deliveries</li>
          `}
        </ul>
        
        <p>Ready to get started? <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a></p>
        
        <div class="footer">
          <p>&copy; 2024 Delivery System. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
  </html>
`;

const getOrderConfirmationTemplate = (orderDetails, sellerName) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Delivery System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Confirmation</h1>
          <p>Delivery System</p>
        </div>
        
        <p>Dear ${sellerName},</p>
        <p>Your order has been successfully created!</p>
        
        <div class="order-details">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p><strong>Pickup Location:</strong> ${orderDetails.pickupLocation}</p>
          <p><strong>Delivery Location:</strong> ${orderDetails.deliveryLocation}</p>
          <p><strong>Package:</strong> ${orderDetails.packageDescription}</p>
          <p><strong>Delivery Fee:</strong> KES ${orderDetails.deliveryFee}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        </div>
        
        <h3>What's Next?</h3>
        <ul>
          <li>Your order is now visible to available riders</li>
          <li>You'll be notified when a rider accepts your order</li>
          <li>Track your delivery in real-time from your dashboard</li>
        </ul>
        
        <p><a href="${process.env.FRONTEND_URL}/seller-dashboard" class="button">Track Your Order</a></p>
        
        <div class="footer">
          <p>&copy; 2024 Delivery System. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
  </html>
`;

const getOrderAcceptedTemplate = (orderDetails, riderDetails, sellerName) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rider Assigned - Delivery System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .rider-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Rider Assigned</h1>
          <p>Delivery System</p>
        </div>
        
        <p>Dear ${sellerName},</p>
        <p>Great news! Your order has been accepted by a rider.</p>
        
        <div class="rider-info">
          <h3>Rider Information:</h3>
          <p><strong>Name:</strong> ${riderDetails.name}</p>
          <p><strong>Vehicle Type:</strong> ${riderDetails.riderType}</p>
          <p><strong>Vehicle Number:</strong> ${riderDetails.vehicleNumber}</p>
          <p><strong>Service Area:</strong> ${riderDetails.area}</p>
          <p><strong>Rating:</strong> ⭐ ${riderDetails.averageRating || 'New'}</p>
        </div>
        
        <h3>What's Next?</h3>
        <ul>
          <li>The rider is on their way to pickup location</li>
          <li>You can chat directly with the rider if needed</li>
          <li>Track the delivery in real-time from your dashboard</li>
        </ul>
        
        <p><a href="${process.env.FRONTEND_URL}/chat/${riderDetails.id}" class="button">Chat with Rider</a></p>
        
        <div class="footer">
          <p>&copy; 2024 Delivery System. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
  </html>
`;

module.exports = {
  getPasswordResetTemplate,
  getPasswordResetSuccessTemplate,
  getWelcomeEmailTemplate,
  getOrderConfirmationTemplate,
  getOrderAcceptedTemplate
};
