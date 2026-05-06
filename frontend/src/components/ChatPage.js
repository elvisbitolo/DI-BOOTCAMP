import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Paperclip, MapPin, Package, 
  User, Clock, Check, CheckCheck
} from 'lucide-react';

const ChatPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);

  const translations = {
    en: {
      back: 'Back to Dashboard',
      chat: 'Chat',
      typeMessage: 'Type a message...',
      send: 'Send',
      attachFile: 'Attach file',
      sendLocation: 'Send location',
      orderDetails: 'Order Details',
      seller: 'Seller',
      rider: 'Rider',
      online: 'Online',
      offline: 'Offline',
      now: 'Just now',
      minute: 'min ago',
      minutes: 'mins ago',
      hour: 'hour ago',
      hours: 'hours ago',
      day: 'day ago',
      days: 'days ago',
      delivered: 'Delivered',
      read: 'Read'
    },
    sw: {
      back: 'Rudi kwa Dashibodi',
      chat: 'Mazungumzo',
      typeMessage: 'Andika ujumbe...',
      send: 'Tuma',
      attachFile: 'Bandika faili',
      sendLocation: 'Tuma mahali',
      orderDetails: 'Maelezo ya Oda',
      seller: 'Mmuuzaji',
      rider: 'Mpanda Baiskeli',
      online: 'Mtandaoni',
      offline: 'Nje ya mtandao',
      now: 'Sasa hivi',
      minute: 'dakika iliyopita',
      minutes: 'dakika zilizopita',
      hour: 'saa iliyopita',
      hours: 'masaa yaliyopita',
      day: 'siku iliyopita',
      days: 'masiku yaliyopita',
      delivered: 'Imewasilishwa',
      read: 'Imesomwa'
    }
  };

  const t = translations[selectedLanguage];

  useEffect(() => {
    fetchChat();
    // TODO: Set up Socket.io connection for real-time messages
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      // TODO: Replace with actual API call
      const mockChat = {
        _id: '1',
        orderId,
        participants: [
          { _id: '1', name: 'John Seller', profileImage: '', userType: 'seller' },
          { _id: '2', name: 'James Rider', profileImage: '', userType: 'rider', isOnline: true }
        ],
        messages: [
          {
            _id: '1',
            sender: { _id: '1', name: 'John Seller', profileImage: '' },
            content: 'Hello, I have a package ready for pickup',
            messageType: 'text',
            isRead: true,
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '2',
            sender: { _id: '2', name: 'James Rider', profileImage: '' },
            content: 'Great! I\'m on my way. Should be there in 15 minutes.',
            messageType: 'text',
            isRead: true,
            timestamp: new Date(Date.now() - 3000000).toISOString()
          },
          {
            _id: '3',
            sender: { _id: '1', name: 'John Seller', profileImage: '' },
            content: 'Perfect. The package is at the main gate.',
            messageType: 'text',
            isRead: false,
            timestamp: new Date(Date.now() - 1800000).toISOString()
          }
        ],
        lastMessage: {
          sender: { _id: '1', name: 'John Seller' },
          content: 'Perfect. The package is at the main gate.',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      };

      setChat(mockChat);
      setMessages(mockChat.messages);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      // TODO: Replace with actual API call
      const message = {
        _id: Date.now().toString(),
        sender: { _id: '1', name: 'John Seller', profileImage: '' }, // Current user
        content: newMessage,
        messageType: 'text',
        isRead: false,
        timestamp: new Date().toISOString()
      };

      setMessages([...messages, message]);
      setNewMessage('');
      
      // TODO: Send via Socket.io for real-time delivery
      console.log('Sending message:', message);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.now;
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? t.minute : t.minutes}`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? t.hour : t.hours}`;
    return `${diffDays} ${diffDays === 1 ? t.day : t.days}`;
  };

  const handleMarkAsRead = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Marking messages as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (messages.some(msg => !msg.isRead && msg.sender._id !== '1')) {
      handleMarkAsRead();
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{t.chat}</h1>
                <p className="text-sm text-gray-600">Order #{orderId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Order Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">{t.orderDetails}</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Order #{orderId}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{t.seller}</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm text-gray-600">John Seller</p>
                    <p className="text-xs text-gray-500">Gikomba Electronics</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{t.rider}</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm text-gray-600">James Rider</p>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        chat?.participants[1]?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {chat?.participants[1]?.isOnline ? t.online : t.offline}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Pickup: Gikomba Market</p>
                      <p className="text-sm text-gray-600">Delivery: Nairobi CBD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender._id === '1' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.sender._id === '1' ? 'order-2' : 'order-1'
                    }`}>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.sender._id === '1'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${
                        message.sender._id === '1' ? 'justify-end' : 'justify-start'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender._id === '1' && (
                          message.isRead ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title={t.attachFile}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title={t.sendLocation}
                  >
                    <MapPin className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.typeMessage}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
