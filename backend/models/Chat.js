const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'location', 'status'],
      default: 'text'
    },
    messageUrl: {
      type: String,
      default: null // For image or location messages
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ orderId: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ 'messages.sender': 1 });
chatSchema.index({ 'messages.timestamp': -1 });
chatSchema.index({ lastMessage: 1 });

// Method to add message
chatSchema.methods.addMessage = async function(senderId, content, messageType = 'text', messageUrl = null) {
  const message = {
    sender: senderId,
    content,
    messageType,
    messageUrl,
    timestamp: new Date()
  };
  
  this.messages.push(message);
  this.lastMessage = {
    sender: senderId,
    content,
    timestamp: new Date()
  };
  
  await this.save();
  return message;
};

// Method to mark messages as read
chatSchema.methods.markMessagesAsRead = async function(userId) {
  const unreadMessages = this.messages.filter(msg => 
    msg.sender.toString() !== userId.toString() && !msg.isRead
  );
  
  unreadMessages.forEach(msg => {
    msg.isRead = true;
    msg.readAt = new Date();
  });
  
  await this.save();
  return unreadMessages.length;
};

// Method to get unread message count for a user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(msg => 
    msg.sender.toString() !== userId.toString() && !msg.isRead
  ).length;
};

// Static method to find chat by order and participants
chatSchema.statics.findChat = function(orderId, participants) {
  return this.findOne({
    orderId,
    participants: { $all: participants, $size: participants.length }
  }).populate('participants', 'name profileImage');
};

// Static method to create or get chat
chatSchema.statics.findOrCreateChat = async function(orderId, participants) {
  let chat = await this.findChat(orderId, participants);
  
  if (!chat) {
    chat = new this({
      orderId,
      participants
    });
    await chat.save();
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);
