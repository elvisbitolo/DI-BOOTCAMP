const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/chats/order/:orderId
// @desc    Get chat for a specific order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is part of this order
    if (order.seller.toString() !== req.user._id.toString() && 
        (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const participants = [order.seller.toString()];
    if (order.rider) {
      participants.push(order.rider.toString());
    }

    let chat = await Chat.findChat(orderId, participants);
    
    if (!chat) {
      // Create chat if it doesn't exist
      chat = await Chat.findOrCreateChat(orderId, participants);
    }

    await chat.populate('participants', 'name profileImage');
    await chat.populate('messages.sender', 'name profileImage');

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Server error fetching chat' });
  }
});

// @route   POST /api/chats/order/:orderId/messages
// @desc    Send a message in chat
router.post('/order/:orderId/messages', [
  auth,
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'location', 'status']).withMessage('Invalid message type'),
  body('messageUrl').optional().isURL().withMessage('Invalid message URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { content, messageType = 'text', messageUrl } = req.body;

    // Check if order exists and user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is part of this order
    if (order.seller.toString() !== req.user._id.toString() && 
        (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const participants = [order.seller.toString()];
    if (order.rider) {
      participants.push(order.rider.toString());
    }

    let chat = await Chat.findChat(orderId, participants);
    
    if (!chat) {
      chat = await Chat.findOrCreateChat(orderId, participants);
    }

    const message = await chat.addMessage(req.user._id, content, messageType, messageUrl);
    await chat.populate('messages.sender', 'name profileImage');

    // Get Socket.io instance from app
    const io = req.app.get('io');
    if (io) {
      // Send real-time message to other participant
      const otherParticipant = participants.find(p => p !== req.user._id.toString());
      if (otherParticipant) {
        io.to(`user_${otherParticipant}`).emit('new_message', {
          orderId,
          message: {
            ...message.toObject(),
            sender: {
              _id: req.user._id,
              name: req.user.name,
              profileImage: req.user.profileImage
            }
          }
        });
      }
    }

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

// @route   PUT /api/chats/order/:orderId/read
// @desc    Mark messages as read
router.put('/order/:orderId/read', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is part of this order
    if (order.seller.toString() !== req.user._id.toString() && 
        (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const participants = [order.seller.toString()];
    if (order.rider) {
      participants.push(order.rider.toString());
    }

    const chat = await Chat.findChat(orderId, participants);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const unreadCount = await chat.markMessagesAsRead(req.user._id);

    res.json({
      message: 'Messages marked as read',
      unreadCount
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Server error marking messages as read' });
  }
});

// @route   GET /api/chats
// @desc    Get all chats for the current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('orderId', 'orderNumber status orderTime')
    .populate('participants', 'name profileImage')
    .populate('lastMessage.sender', 'name')
    .sort({ 'lastMessage.timestamp': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Add unread count for each chat
    const chatsWithUnreadCount = chats.map(chat => ({
      ...chat.toObject(),
      unreadCount: chat.getUnreadCount(req.user._id)
    }));

    const total = await Chat.countDocuments({
      participants: req.user._id,
      isActive: true
    });

    res.json({
      chats: chatsWithUnreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Server error fetching chats' });
  }
});

// @route   DELETE /api/chats/order/:orderId
// @desc    Delete/deactivate chat
router.delete('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is part of this order
    if (order.seller.toString() !== req.user._id.toString() && 
        (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const participants = [order.seller.toString()];
    if (order.rider) {
      participants.push(order.rider.toString());
    }

    const chat = await Chat.findChat(orderId, participants);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ message: 'Chat deactivated successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Server error deleting chat' });
  }
});

module.exports = router;
