const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Gikomba Delivery System',
    html: (name, userType) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Gikomba Delivery System</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Welcome to the Gikomba Delivery System! We're excited to have you as part of our community.
            As a ${userType}, you'll have access to our platform that connects sellers with reliable riders
            for efficient delivery services.
          </p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Getting Started:</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li>Complete your profile information</li>
              <li>Verify your email address</li>
              <li>${userType === 'seller' ? 'Start posting your delivery orders' : 'Set your availability and start accepting orders'}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  emailVerification: {
    subject: 'Verify Your Email Address',
    html: (name, code) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for registering with Gikomba Delivery System. To complete your registration,
            please verify your email address using the code below:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #16a34a;">
              ${code}
            </div>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  passwordReset: {
    subject: 'Reset Your Password',
    html: (name, code) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password for your Gikomba Delivery System account.
            Use the code below to reset your password:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #16a34a;">
              ${code}
            </div>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this password reset, please secure your account.
          </p>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  orderCreated: {
    subject: 'New Order Posted',
    html: (riderName, orderDetails) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Order Available</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1f2937;">Hello ${riderName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            A new order is available near your location. Check the details below:
          </p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Order Details:</h3>
            <p style="color: #4b5563;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p style="color: #4b5563;"><strong>Pickup:</strong> ${orderDetails.pickupLocation}</p>
            <p style="color: #4b5563;"><strong>Delivery:</strong> ${orderDetails.deliveryLocation}</p>
            <p style="color: #4b5563;"><strong>Delivery Fee:</strong> KES ${orderDetails.deliveryFee}</p>
            <p style="color: #4b5563;"><strong>Distance:</strong> ${orderDetails.distance} km</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/rider-dashboard" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order
            </a>
          </div>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  orderAccepted: {
    subject: 'Order Accepted',
    html: (sellerName, orderDetails, riderDetails) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Accepted</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1f2937;">Hello ${sellerName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Great news! Your order has been accepted by a rider.
          </p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Order Details:</h3>
            <p style="color: #4b5563;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p style="color: #4b5563;"><strong>Rider:</strong> ${riderDetails.name}</p>
            <p style="color: #4b5563;"><strong>Vehicle:</strong> ${riderDetails.vehicleType}</p>
            <p style="color: #4b5563;"><strong>Rating:</strong> ${riderDetails.rating} ⭐</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/chat/${orderDetails.id}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Contact Rider
            </a>
          </div>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  orderDelivered: {
    subject: 'Order Delivered Successfully',
    html: (sellerName, orderDetails, riderDetails) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Delivered</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1f2937;">Hello ${sellerName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your order has been successfully delivered! Please rate the rider to help improve our service.
          </p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Delivery Summary:</h3>
            <p style="color: #4b5563;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p style="color: #4b5563;"><strong>Rider:</strong> ${riderDetails.name}</p>
            <p style="color: #4b5563;"><strong>Delivery Time:</strong> ${orderDetails.deliveryTime}</p>
            <p style="color: #4b5563;"><strong>Total Fee:</strong> KES ${orderDetails.deliveryFee}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/ratings/order/${orderDetails.id}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Rate Rider
            </a>
          </div>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">© 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email using Supabase
const sendEmailViaSupabase = async (to, subject, html) => {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      'dummy-user-id', // This won't work for sending emails to arbitrary users
      {
        email: to,
        email_confirm: true
      }
    );

    // Supabase doesn't directly support sending arbitrary emails
    // We'll use nodemailer as fallback
    console.log('Supabase email service not configured for arbitrary emails, using nodemailer');
    return null;
  } catch (error) {
    console.error('Supabase email error:', error);
    return null;
  }
};

// Send email using nodemailer
const sendEmailViaNodemailer = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer error:', error);
    throw error;
  }
};

// Main email sending function
const sendEmail = async (to, templateType, templateData) => {
  try {
    const template = emailTemplates[templateType];
    if (!template) {
      throw new Error(`Email template '${templateType}' not found`);
    }

    const subject = template.subject;
    const html = template.html(...templateData);

    // Try Supabase first, fallback to nodemailer
    let result = await sendEmailViaSupabase(to, subject, html);
    
    if (!result) {
      result = await sendEmailViaNodemailer(to, subject, html);
    }

    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email notification functions
const emailNotifications = {
  sendWelcomeEmail: (email, name, userType) => {
    return sendEmail(email, 'welcome', [name, userType]);
  },

  sendVerificationEmail: (email, name, code) => {
    return sendEmail(email, 'emailVerification', [name, code]);
  },

  sendPasswordResetEmail: (email, name, code) => {
    return sendEmail(email, 'passwordReset', [name, code]);
  },

  sendOrderCreatedEmail: (email, riderName, orderDetails) => {
    return sendEmail(email, 'orderCreated', [riderName, orderDetails]);
  },

  sendOrderAcceptedEmail: (email, sellerName, orderDetails, riderDetails) => {
    return sendEmail(email, 'orderAccepted', [sellerName, orderDetails, riderDetails]);
  },

  sendOrderDeliveredEmail: (email, sellerName, orderDetails, riderDetails) => {
    return sendEmail(email, 'orderDelivered', [sellerName, orderDetails, riderDetails]);
  }
};

module.exports = {
  sendEmail,
  emailNotifications,
  emailTemplates
};
