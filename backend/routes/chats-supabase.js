const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/chats/messages
// @desc    Send a message
router.post('/messages', [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content } = req.body;
    const supabase = req.app.get('supabase');

    // Check if receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', receiverId)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create message
    const messageData = {
      sender_id: req.user.id,
      receiver_id: receiverId,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert([messageData])
      .select(`
        *,
        sender:users(name, email),
        receiver:users(name, email)
      `)
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Emit real-time message via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiverId}`).emit('new_message', message);
      io.to(`user_${req.user.id}`).emit('message_sent', message);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/chats/messages/:userId
// @desc    Get conversation between current user and another user
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = req.app.get('supabase');

    // Get messages between the two users
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(name, email, user_type),
        receiver:users(name, email, user_type)
      `)
      .or(`(sender_id.eq.${req.user.id}.and(receiver_id.eq.${userId}))`)
      .or(`(sender_id.eq.${userId}.and(receiver_id.eq.${req.user.id}))`)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Mark messages as read (messages received by current user)
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('sender_id', userId)
      .eq('receiver_id', req.user.id)
      .eq('is_read', false);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/chats/conversations
// @desc    Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    // Get unique conversation partners
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        sender_id,
        receiver_id,
        created_at,
        sender:users(name, email, user_type, is_online),
        receiver:users(name, email, user_type, is_online)
      `)
      .or(`sender_id.eq.${req.user.id}`)
      .or(`receiver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Process conversations to get unique users with latest message
    const uniqueConversations = [];
    const seenUsers = new Set();

    conversations.forEach(conv => {
      const otherUser = conv.sender_id === req.user.id ? conv.receiver : conv.sender;
      const userId = otherUser.id;

      if (!seenUsers.has(userId)) {
        seenUsers.add(userId);
        uniqueConversations.push({
          user: otherUser,
          lastMessage: conv,
          unreadCount: 0 // Will be calculated separately
        });
      }
    });

    // Get unread count for each conversation
    for (let conv of uniqueConversations) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', conv.user.id)
        .eq('receiver_id', req.user.id)
        .eq('is_read', false);

      conv.unreadCount = count || 0;
    }

    res.json(uniqueConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/chats/messages/:id/read
// @desc    Mark message as read
router.put('/messages/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.get('supabase');

    // Update message as read
    const { data: message, error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('receiver_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Emit read receipt via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${message.sender_id}`).emit('message_read', { messageId: id });
    }

    res.json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/chats/messages/:id
// @desc    Delete a message (only sender can delete)
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.get('supabase');

    // Check if message exists and user is sender
    const { data: message, error: checkError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .eq('sender_id', req.user.id)
      .single();

    if (checkError || !message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    // Delete message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete message' });
    }

    // Emit message deletion via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${message.receiver_id}`).emit('message_deleted', { messageId: id });
      io.to(`user_${req.user.id}`).emit('message_deleted', { messageId: id });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
