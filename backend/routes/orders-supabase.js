const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
router.post('/', [
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('deliveryLocation').trim().notEmpty().withMessage('Delivery location is required'),
  body('packageDescription').trim().notEmpty().withMessage('Package description is required'),
  body('deliveryFee').isNumeric().withMessage('Delivery fee must be a number'),
  body('priority').isIn(['standard', 'express', 'urgent']).withMessage('Invalid priority'),
  body('paymentMethod').isIn(['cash', 'mpesa', 'card']).withMessage('Invalid payment method')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickupLocation,
      deliveryLocation,
      packageDescription,
      packageWeight,
      packageDimensions,
      deliveryFee,
      specialInstructions,
      priority,
      paymentMethod
    } = req.body;

    const supabase = req.app.get('supabase');
    const emailService = req.app.get('emailService');

    // Create order
    const orderData = {
      seller_id: req.user.id,
      order_number: `ORD-${Date.now()}`,
      pickup_location: pickupLocation,
      delivery_location: deliveryLocation,
      package_description: packageDescription,
      package_weight: packageWeight || null,
      package_dimensions: packageDimensions || null,
      delivery_fee: deliveryFee,
      special_instructions: specialInstructions || null,
      priority: priority || 'standard',
      payment_method: paymentMethod || 'cash',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Send order confirmation email to seller
    try {
      await emailService.sendOrderConfirmationEmail(req.user.email, order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    // Notify online riders about new order
    try {
      const { data: onlineRiders } = await supabase
        .from('users')
        .select('email, name')
        .eq('user_type', 'rider')
        .eq('is_online', true)
        .eq('is_available', true);

      if (onlineRiders && onlineRiders.length > 0) {
        // Send email notifications to online riders
        const emailPromises = onlineRiders.map(rider =>
          emailService.sendNewOrderNotificationEmail(rider.email, order)
        );
        
        await Promise.allSettled(emailPromises);
        console.log(`Sent order notifications to ${onlineRiders.length} riders`);
      }
    } catch (notificationError) {
      console.error('Failed to send rider notifications:', notificationError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/accept
// @desc    Accept an order (for riders)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.get('supabase');
    const emailService = req.app.get('emailService');

    // Check if order exists and is pending
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found or already accepted' });
    }

    // Accept the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        rider_id: req.user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        seller:users(name, email),
        rider:users(name, email, rider_type, area, vehicle_number, average_rating)
      `)
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to accept order' });
    }

    // Send email notification to seller
    try {
      await emailService.sendOrderAcceptedEmail(
        updatedOrder.seller.email,
        updatedOrder,
        updatedOrder.rider
      );
    } catch (emailError) {
      console.error('Failed to send order accepted email:', emailError);
    }

    res.json({
      message: 'Order accepted successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
router.put('/:id/status', [
  body('status').isIn(['in_transit', 'delivered', 'cancelled']).withMessage('Invalid status')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const supabase = req.app.get('supabase');
    const emailService = req.app.get('emailService');

    // Check if order exists and user has permission
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.id !== order.seller_id && req.user.id !== order.rider_id) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update order status
    const updateData = { status };
    
    if (status === 'in_transit') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_reason = req.body.reason || 'Cancelled by user';
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        seller:users(name, email),
        rider:users(name, email)
      `)
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update order status' });
    }

    // Send email notification if order is delivered
    if (status === 'delivered') {
      try {
        await emailService.sendOrderDeliveredEmail(
          updatedOrder.seller.email,
          updatedOrder,
          updatedOrder.rider
        );
      } catch (emailError) {
        console.error('Failed to send order delivered email:', emailError);
      }
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query; // 'created' for sellers, 'assigned' for riders
    const supabase = req.app.get('supabase');

    let query = supabase.from('orders').select('*');

    if (req.user.user_type === 'seller' || type === 'created') {
      query = query.eq('seller_id', req.user.id);
    } else if (req.user.user_type === 'rider' || type === 'assigned') {
      query = query.eq('rider_id', req.user.id);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/available
// @desc    Get available orders (for riders)
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'rider') {
      return res.status(403).json({ error: 'Only riders can view available orders' });
    }

    const supabase = req.app.get('supabase');

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .is('rider_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch available orders' });
    }

    res.json(orders);
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.get('supabase');

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        seller:users(name, email, phone),
        rider:users(name, email, phone, rider_type, area, vehicle_number, average_rating)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.id !== order.seller_id && req.user.id !== order.rider_id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
