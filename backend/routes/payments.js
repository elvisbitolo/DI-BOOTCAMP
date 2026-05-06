const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const mpesaService = require('../services/mpesaService');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/payments/initiate
// @desc    Initiate payment for an order
router.post('/initiate', [
  auth,
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('paymentMethod').isIn(['mpesa', 'card', 'wallet']).withMessage('Invalid payment method'),
  body('phoneNumber').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, paymentMethod, phoneNumber } = req.body;

    // Check if order exists and user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ 
      order: orderId, 
      paymentStatus: { $in: ['pending', 'processing', 'completed'] }
    });
    
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already initiated for this order' });
    }

    // Create payment record
    const payment = new Payment({
      order: orderId,
      payer: req.user._id,
      payee: order.rider,
      amount: order.deliveryFee,
      paymentMethod,
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Handle different payment methods
    let paymentResponse;

    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required for M-Pesa payment' });
      }

      const validPhone = mpesaService.validatePhoneNumber(phoneNumber);
      if (!validPhone) {
        return res.status(400).json({ error: 'Invalid Kenyan phone number' });
      }

      const accountRef = mpesaService.generateAccountReference(orderId, 'seller');
      const transactionDesc = `Payment for order ${order.orderNumber}`;

      paymentResponse = await mpesaService.initiateSTKPush(
        validPhone,
        order.deliveryFee,
        accountRef,
        transactionDesc
      );

      if (paymentResponse.success) {
        payment.externalTransactionId = paymentResponse.checkoutRequestID;
        payment.paymentDetails.phoneNumber = validPhone;
        payment.paymentGateway = 'mpesa';
      }
    } else if (paymentMethod === 'card') {
      // TODO: Implement card payment (Stripe integration)
      paymentResponse = {
        success: false,
        error: 'Card payments not yet implemented'
      };
    } else if (paymentMethod === 'wallet') {
      // TODO: Implement wallet payment
      paymentResponse = {
        success: false,
        error: 'Wallet payments not yet implemented'
      };
    }

    if (!paymentResponse.success) {
      payment.paymentStatus = 'failed';
      payment.failureReason = paymentResponse.error;
      await payment.save();
      return res.status(400).json({ error: paymentResponse.error });
    }

    await payment.save();

    res.status(201).json({
      message: 'Payment initiated successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.paymentStatus,
        checkoutRequestID: payment.externalTransactionId
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: 'Server error initiating payment' });
  }
});

// @route   POST /api/payments/mpesa/callback
// @desc    M-Pesa callback handler
router.post('/mpesa/callback', async (req, res) => {
  try {
    const callbackData = mpesaService.parseCallback(req.body);
    
    if (!callbackData) {
      return res.status(400).json({ error: 'Invalid callback data' });
    }

    // Find payment by checkout request ID
    const payment = await Payment.findOne({
      externalTransactionId: callbackData.checkoutRequestID,
      paymentMethod: 'mpesa'
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (callbackData.resultCode === 0) {
      // Payment successful
      const mpesaReceipt = mpesaService.extractMetadata(callbackData.metadata, 'MpesaReceiptNumber');
      const phoneNumber = mpesaService.extractMetadata(callbackData.metadata, 'PhoneNumber');
      const amount = mpesaService.extractMetadata(callbackData.metadata, 'Amount');
      
      payment.paymentStatus = 'completed';
      payment.processedAt = new Date();
      payment.paymentDetails.mpesaReceipt = mpesaReceipt;
      payment.paymentDetails.phoneNumber = phoneNumber;
      
      // Update order payment status
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid'
      });

      // TODO: Send payment confirmation email
      console.log('Payment completed:', {
        paymentId: payment._id,
        mpesaReceipt,
        amount,
        phoneNumber
      });

    } else {
      // Payment failed
      payment.paymentStatus = 'failed';
      payment.failureReason = callbackData.resultDesc;
      payment.processedAt = new Date();
    }

    await payment.save();

    res.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: 'Server error processing callback' });
  }
});

// @route   GET /api/payments/status/:paymentId
// @desc    Get payment status
router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('order', 'orderNumber')
      .populate('payer', 'name email')
      .populate('payee', 'name email');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user has permission
    if (payment.payer._id.toString() !== req.user._id.toString() &&
        payment.payee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For M-Pesa payments, check real-time status
    if (payment.paymentMethod === 'mpesa' && 
        payment.paymentStatus === 'pending' && 
        payment.externalTransactionId) {
      
      const statusResponse = await mpesaService.querySTKStatus(payment.externalTransactionId);
      
      if (statusResponse.success && statusResponse.resultCode === 0) {
        payment.paymentStatus = 'completed';
        payment.processedAt = new Date();
        
        const mpesaReceipt = mpesaService.extractMetadata(statusResponse.metadata, 'MpesaReceiptNumber');
        payment.paymentDetails.mpesaReceipt = mpesaReceipt;
        
        await payment.save();
        
        // Update order payment status
        await Order.findByIdAndUpdate(payment.order, {
          paymentStatus: 'paid'
        });
      }
    }

    res.json({
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.paymentStatus,
        orderNumber: payment.order.orderNumber,
        processedAt: payment.processedAt,
        failureReason: payment.failureReason,
        mpesaReceipt: payment.paymentDetails.mpesaReceipt
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Server error fetching payment status' });
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history for user
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { payer: req.user._id },
        { payee: req.user._id }
      ]
    };

    if (status) {
      query.paymentStatus = status;
    }

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber')
      .populate('payer', 'name')
      .populate('payee', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Server error fetching payment history' });
  }
});

// @route   POST /api/payments/disburse
// @desc    Disburse payment to rider (B2C)
router.post('/disburse', [
  auth,
  authorize('admin'),
  body('paymentId').isMongoId().withMessage('Valid payment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate('payee', 'name phone');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.paymentStatus !== 'completed') {
      return res.status(400).json({ error: 'Payment not completed yet' });
    }

    if (payment.paymentDetails.disbursed) {
      return res.status(400).json({ error: 'Payment already disbursed' });
    }

    // Initiate B2C payment to rider
    const disbursementData = {
      phoneNumber: payment.payee.phone,
      amount: payment.amount,
      remarks: `Payment for order ${payment.order}`,
      occasion: 'Delivery Payment'
    };

    const disbursementResponse = await mpesaService.initiateB2C(disbursementData);

    if (!disbursementResponse.success) {
      return res.status(400).json({ error: 'Failed to disburse payment' });
    }

    // Mark payment as disbursed
    payment.paymentDetails.disbursed = true;
    payment.paymentDetails.disbursementId = disbursementResponse.conversationID;
    payment.paymentDetails.disbursementDate = new Date();
    await payment.save();

    res.json({
      message: 'Payment disbursed successfully',
      disbursement: {
        conversationID: disbursementResponse.conversationID,
        amount: payment.amount,
        riderName: payment.payee.name
      }
    });

  } catch (error) {
    console.error('Disburse payment error:', error);
    res.status(500).json({ error: 'Server error disbursing payment' });
  }
});

// @route   POST /api/payments/refund
// @desc    Refund payment
router.post('/refund', [
  auth,
  authorize('admin'),
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid refund amount is required'),
  body('reason').trim().notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.refundPayment(amount, reason);

    res.json({
      message: 'Refund processed successfully',
      refund: {
        amount,
        reason,
        refundId: payment.refundDetails.refundId,
        status: payment.refundDetails.status
      }
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: 'Server error processing refund' });
  }
});

module.exports = router;
