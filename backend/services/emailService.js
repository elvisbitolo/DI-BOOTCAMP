const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail, userName, userType) {
    const subject = 'Welcome to Gikomba Delivery System!';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Gikomba Delivery</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Welcome to Gikomba Delivery!</h1>
            <p>Your account has been successfully created</p>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for joining Gikomba Delivery System as a <strong>${userType}</strong>!</p>
            
            ${userType === 'seller' ? `
              <h3>📦 What's Next?</h3>
              <ul>
                <li>Create your first delivery order</li>
                <li>Connect with available riders in your area</li>
                <li>Track your deliveries in real-time</li>
              </ul>
            ` : `
              <h3>🏍️ What's Next?</h3>
              <ul>
                <li>Set your availability status</li>
                <li>View available orders in your area</li>
                <li>Start earning with deliveries</li>
              </ul>
            `}
            
            <p>Ready to get started? Click the button below to access your dashboard:</p>
            <a href="http://localhost:3000/login" class="button">Access Your Dashboard</a>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br>The Gikomba Delivery Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Gikomba Delivery System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Order confirmation email
  async sendOrderConfirmationEmail(sellerEmail, orderDetails) {
    const subject = `Order Confirmation - ${orderDetails.orderNumber}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Confirmed!</h1>
            <p>Your delivery order has been created</p>
          </div>
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
              <p><strong>Pickup Location:</strong> ${orderDetails.pickupLocation}</p>
              <p><strong>Delivery Location:</strong> ${orderDetails.deliveryLocation}</p>
              <p><strong>Package:</strong> ${orderDetails.packageDescription}</p>
              <p><strong>Delivery Fee:</strong> KES ${orderDetails.deliveryFee}</p>
              <p><strong>Priority:</strong> ${orderDetails.priority}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Your order is now visible to available riders</li>
              <li>You'll be notified when a rider accepts your order</li>
              <li>Track your delivery in real-time from your dashboard</li>
            </ul>
            
            <a href="http://localhost:3000/seller-dashboard" class="button">Track Your Order</a>
            
            <p>Thank you for using Gikomba Delivery System!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Gikomba Delivery System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(sellerEmail, subject, htmlContent);
  }

  // Order accepted notification (to seller)
  async sendOrderAcceptedEmail(sellerEmail, orderDetails, riderDetails) {
    const subject = `Rider Assigned - ${orderDetails.orderNumber}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rider Assigned</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .rider-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Rider Assigned!</h1>
            <p>Your order has been accepted</p>
          </div>
          <div class="content">
            <h2>Great News!</h2>
            <p>Your order <strong>${orderDetails.orderNumber}</strong> has been accepted by a rider.</p>
            
            <div class="rider-info">
              <h3>Rider Information</h3>
              <p><strong>Name:</strong> ${riderDetails.name}</p>
              <p><strong>Vehicle Type:</strong> ${riderDetails.riderType}</p>
              <p><strong>Service Area:</strong> ${riderDetails.area}</p>
              <p><strong>Vehicle Number:</strong> ${riderDetails.vehicleNumber}</p>
              <p><strong>Rating:</strong> ⭐ ${riderDetails.rating || 'New'}</p>
            </div>
            
            <h3>Next Steps</h3>
            <ul>
              <li>The rider is on their way to pickup location</li>
              <li>You can track the delivery in real-time</li>
              <li>Chat directly with the rider if needed</li>
            </ul>
            
            <a href="http://localhost:3000/seller-dashboard" class="button">Track Delivery</a>
            <a href="http://localhost:3000/chat/${riderDetails.id}" class="button" style="background: #3b82f6;">Chat with Rider</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 Gikomba Delivery System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(sellerEmail, subject, htmlContent);
  }

  // Order delivered notification (to seller)
  async sendOrderDeliveredEmail(sellerEmail, orderDetails, riderDetails) {
    const subject = `Order Delivered - ${orderDetails.orderNumber}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Delivered!</h1>
            <p>Your delivery has been completed successfully</p>
          </div>
          <div class="content">
            <h2>Delivery Complete!</h2>
            <p>Your order <strong>${orderDetails.orderNumber}</strong> has been successfully delivered.</p>
            
            <div class="success-box">
              <h3>Delivery Summary</h3>
              <p><strong>Delivered by:</strong> ${riderDetails.name}</p>
              <p><strong>Delivery Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Fee:</strong> KES ${orderDetails.deliveryFee}</p>
            </div>
            
            <h3>Rate Your Experience</h3>
            <p>Please take a moment to rate the rider and provide feedback.</p>
            
            <a href="http://localhost:3000/seller-dashboard" class="button">Rate Rider & View Details</a>
            
            <p>Thank you for using Gikomba Delivery System!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Gikomba Delivery System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(sellerEmail, subject, htmlContent);
  }

  // New order notification (to riders)
  async sendNewOrderNotificationEmail(riderEmail, orderDetails) {
    const subject = `New Order Available - ${orderDetails.orderNumber}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Available</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 New Order Available!</h1>
            <p>A new delivery order is waiting for you</p>
          </div>
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
              <p><strong>Pickup Location:</strong> ${orderDetails.pickupLocation}</p>
              <p><strong>Delivery Location:</strong> ${orderDetails.deliveryLocation}</p>
              <p><strong>Package:</strong> ${orderDetails.packageDescription}</p>
              <p><strong>Weight:</strong> ${orderDetails.packageWeight || 'N/A'} kg</p>
              <p><strong>Delivery Fee:</strong> KES ${orderDetails.deliveryFee}</p>
              <p><strong>Priority:</strong> ${orderDetails.priority}</p>
            </div>
            
            <h3>Act Fast!</h3>
            <p>This order is available on a first-come, first-served basis. Accept it now to start earning!</p>
            
            <a href="http://localhost:3000/rider-dashboard" class="button">Accept Order Now</a>
            
            <p>Keep your availability status updated to receive more orders.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Gikomba Delivery System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(riderEmail, subject, htmlContent);
  }
}

module.exports = EmailService;
