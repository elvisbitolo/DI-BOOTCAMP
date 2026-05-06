import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, Circle } from 'lucide-react';
import { supabase, subscribeToMessages } from '../supabaseClient';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      navigate('/login');
      return;
    }

    // Load other user info
    if (chatId) {
      loadOtherUser(chatId);
    }

    // Load messages
    loadMessages();

    // Set up real-time subscription
    const subscription = subscribeToMessages((payload) => {
      console.log('New message:', payload);
      loadMessages();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, navigate]);

  const loadOtherUser = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user:', error);
      } else {
        setOtherUser(data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`(sender_id.eq.${userData.id}.and.receiver_id.eq.${chatId})`)
        .or(`(sender_id.eq.${chatId}.and(receiver_id.eq.${userData.id}))`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUser) return;

    try {
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select();

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center flex-1">
            <div className="relative">
              <User className="h-10 w-10 text-gray-400" />
              {otherUser?.is_online && (
                <Circle className="h-3 w-3 text-green-500 fill-current absolute -bottom-1 -right-1" />
              )}
            </div>
            <div className="ml-3">
              <h2 className="font-semibold text-gray-800">{otherUser?.name}</h2>
              <p className="text-sm text-gray-500">
                {otherUser?.is_online ? 'Online' : 'Offline'}
                {otherUser?.user_type === 'rider' && ` • ${otherUser?.rider_type}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="container mx-auto px-6 py-4">
        <div className="bg-white rounded-lg shadow-md h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No messages yet</div>
                <div className="text-sm text-gray-500">Start the conversation!</div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender_id === currentUser.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === currentUser.id ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
