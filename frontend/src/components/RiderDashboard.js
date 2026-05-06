import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, MapPin, Clock, DollarSign, Star, 
  MessageCircle, User, LogOut, TrendingUp, 
  CheckCircle, XCircle, Package, Navigation,
  ToggleLeft, ToggleRight, Users, Circle
} from 'lucide-react';
import { supabase, subscribeToOrders, subscribeToUsers } from '../supabaseClient';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [onlineSellers, setOnlineSellers] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const translations = {
    en: {
      dashboard: 'Rider Dashboard',
      welcome: 'Welcome back',
      availableOrders: 'Available Orders',
      myOrders: 'My Orders',
      statistics: 'Statistics',
      profile: 'Profile',
      logout: 'Logout',
      orderNumber: 'Order #',
      status: 'Status',
      seller: 'Seller',
      fee: 'Fee',
      distance: 'Distance',
      actions: 'Actions',
      accept: 'Accept',
      chat: 'Chat',
      track: 'Track',
      pending: 'Pending',
      accepted: 'Accepted',
      inTransit: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      totalOrders: 'Total Orders',
      completedOrders: 'Completed Orders',
      averageRating: 'Average Rating',
      earnings: 'Total Earnings',
      availability: 'Availability',
      available: 'Available',
      unavailable: 'Unavailable',
      pickupLocation: 'Pickup Location',
      deliveryLocation: 'Delivery Location',
      packageDetails: 'Package Details',
      description: 'Description',
      weight: 'Weight',
      dimensions: 'Dimensions',
      estimatedTime: 'Estimated Time',
      updateStatus: 'Update Status',
      pickedUp: 'Picked Up',
      inTransit: 'In Transit',
      markDelivered: 'Mark Delivered'
    },
    sw: {
      dashboard: 'Dashibodi ya Wapanda Baiskeli',
      welcome: 'Karibu tena',
      availableOrders: 'Oda Zilizopo',
      myOrders: 'Oda Zangu',
      statistics: 'Takwimu',
      profile: 'Wasifu',
      logout: 'Toka',
      orderNumber: 'Oda #',
      status: 'Hali',
      seller: 'Mmuuzaji',
      fee: 'Ada',
      distance: 'Umbali',
      actions: 'Vitendo',
      accept: 'Kubali',
      chat: 'Mazungumzo',
      track: 'Fuata',
      pending: 'Inasubiri',
      accepted: 'Imekubaliwa',
      inTransit: 'Kwenye Njia',
      delivered: 'Imewasilishwa',
      cancelled: 'Imefutwa',
      totalOrders: 'Jumla ya Oda',
      completedOrders: 'Oda Zilizokamilika',
      averageRating: 'Ukadiriaji wa Wastani',
      earnings: 'Mapato Yote',
      availability: 'Upatikanaji',
      available: 'Inapatikana',
      unavailable: 'Haipatikani',
      pickupLocation: 'Mahali pa Kuchukua',
      deliveryLocation: 'Mahali pa Kusilisha',
      packageDetails: 'Maelezo ya Kifurushi',
      description: 'Maelezo',
      weight: 'Uzito',
      dimensions: 'Vipimo',
      estimatedTime: 'Muda Unakadiria',
      updateStatus: 'Sasisha Hali',
      pickedUp: 'Imechukuliwa',
      inTransit: 'Kwenye Njia',
      markDelivered: 'Tia Alama Imewasilishwa'
    }
  };

  const t = translations[selectedLanguage];

  useEffect(() => {
    fetchUserData();
    fetchAvailableOrders();
    fetchMyOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      // TODO: Replace with actual API call
      const userData = {
        name: 'James Rider',
        email: 'james@example.com',
        vehicleType: 'motorcycle',
        vehicleNumber: 'KCB 123A',
        averageRating: 4.8,
        totalRatings: 156,
        credibilityScore: 92,
        completedOrders: 234,
        totalEarnings: 285000,
        isAvailable: true
      };
      setUser(userData);
      setIsAvailable(userData.isAvailable);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      // TODO: Replace with actual API call
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD003',
          seller: { name: 'John Seller', businessName: 'Gikomba Electronics' },
          pickupLocation: { address: 'Gikomba Market, Nairobi' },
          deliveryLocation: { address: 'Thika Road Mall' },
          packageDescription: 'Electronic items',
          packageWeight: 5.5,
          deliveryFee: 800,
          distance: 12.5,
          estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(),
          orderTime: new Date().toISOString()
        },
        {
          _id: '2',
          orderNumber: 'ORD004',
          seller: { name: 'Mary Trader', businessName: 'Fashion Hub' },
          pickupLocation: { address: 'Gikomba Market, Nairobi' },
          deliveryLocation: { address: 'Kenyatta Avenue' },
          packageDescription: 'Clothing items',
          packageWeight: 3.2,
          deliveryFee: 600,
          distance: 8.3,
          estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toISOString(),
          orderTime: new Date().toISOString()
        }
      ];
      
      setAvailableOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          rider_id: userData.id, 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Error accepting order:', error);
        alert('Failed to accept order');
        return;
      }

      console.log('Order accepted:', data);
      loadAvailableOrders();
      loadMyOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'in_transit') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status');
        return;
      }

      console.log('Status updated:', data);
      loadMyOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const loadMyOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        console.error('User not logged in');
        setMyOrders([]);
        return;
      }

      // TODO: Replace with actual Supabase call
      const mockOrders = [
        {
          id: 'my-order-1',
          orderNumber: 'ORD-101',
          seller: { name: 'John Seller', businessName: 'Gikomba Electronics' },
          pickupLocation: { address: 'Gikomba Market, Nairobi' },
          deliveryLocation: { address: 'Thika Road Mall' },
          packageDescription: 'Electronic items',
          packageWeight: 5.5,
          deliveryFee: 800,
          distance: 12.5,
          estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(),
          orderTime: new Date().toISOString(),
          status: 'delivered'
        },
        {
          id: 'my-order-2',
          orderNumber: 'ORD-102',
          seller: { name: 'Mary Trader', businessName: 'Fashion Hub' },
          pickupLocation: { address: 'Gikomba Market, Nairobi' },
          deliveryLocation: { address: 'Kenyatta Avenue' },
          packageDescription: 'Clothing items',
          packageWeight: 3.2,
          deliveryFee: 600,
          distance: 8.3,
          estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toISOString(),
          orderTime: new Date().toISOString(),
          status: 'in_transit'
        }
      ];
      
      setMyOrders(mockOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my orders:', error);
      setMyOrders([]);
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const newAvailability = !isAvailable;
      
      const { error } = await supabase
        .from('users')
        .update({ is_online: newAvailability })
        .eq('id', userData.id);

      if (error) {
        console.error('Error updating availability:', error);
        return;
      }

      setIsAvailable(newAvailability);
      setUser({...user, isAvailable: newAvailability});
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Update user status to offline
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        await supabase
          .from('users')
          .update({ is_online: false })
          .eq('id', userData.id);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      accepted: <CheckCircle className="h-4 w-4" />,
      in_transit: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="navbar">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Truck className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">{t.dashboard}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={toggleAvailability}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isAvailable 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isAvailable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              <span>{isAvailable ? t.available : t.unavailable}</span>
            </button>
            <button className="btn-secondary">
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.vehicleType} - {user?.vehicleNumber}</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm text-gray-700">{user?.averageRating}</span>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'available' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  {t.availableOrders}
                </button>
                <button
                  onClick={() => setActiveTab('my-orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'my-orders' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Truck className="h-4 w-4 inline mr-2" />
                  {t.myOrders}
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'statistics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  {t.statistics}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  {t.profile}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'available' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.availableOrders}</h2>
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <div key={order._id} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-gray-800">{t.orderNumber} {order.orderNumber}</h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {t.pending}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {order.seller.name} - {order.seller.businessName}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              KES {order.deliveryFee}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {order.pickupLocation.address}
                            </div>
                            <div className="flex items-center">
                              <Navigation className="h-4 w-4 mr-1" />
                              {order.distance} km
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {order.packageDescription} ({order.packageWeight} kg)
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {t.estimatedTime}: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>{t.deliveryLocation}:</strong> {order.deliveryLocation.address}
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleAcceptOrder(order._id)}
                            className="btn-primary"
                          >
                            {t.accept}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {availableOrders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No available orders at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'my-orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.myOrders}</h2>
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order._id} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-gray-800">{t.orderNumber} {order.orderNumber}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{t[order.status]}</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {order.seller.name}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              KES {order.deliveryFee}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(order.orderTime).toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-600">
                            <div className="flex items-center mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {order.pickupLocation.address} → {order.deliveryLocation.address}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link to={`/chat/${order._id}`} className="btn-secondary">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {t.chat}
                          </Link>
                          <div className="flex space-x-1">
                            {order.status === 'accepted' && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'picked_up')}
                                className="btn-secondary"
                              >
                                {t.pickedUp}
                              </button>
                            )}
                            {order.status === 'picked_up' && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'in_transit')}
                                className="btn-secondary"
                              >
                                {t.inTransit}
                              </button>
                            )}
                            {order.status === 'in_transit' && (
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                className="btn-primary"
                              >
                                {t.markDelivered}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.statistics}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card text-center">
                    <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{user?.completedOrders}</h3>
                    <p className="text-gray-600">{t.completedOrders}</p>
                  </div>
                  <div className="card text-center">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{user?.averageRating}</h3>
                    <p className="text-gray-600">{t.averageRating}</p>
                  </div>
                  <div className="card text-center">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{user?.credibilityScore}%</h3>
                    <p className="text-gray-600">Credibility Score</p>
                  </div>
                  <div className="card text-center">
                    <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">KES {user?.totalEarnings.toLocaleString()}</h3>
                    <p className="text-gray-600">{t.earnings}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.profile}</h2>
                <div className="card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                      <input type="text" value={user?.vehicleType || ''} className="input-field" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                      <input type="text" value={user?.vehicleNumber || ''} className="input-field" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value={user?.email || ''} className="input-field" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Average Rating</label>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="ml-2 text-lg">{user?.averageRating}</span>
                        <span className="ml-2 text-gray-600">({user?.totalRatings} reviews)</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credibility Score</label>
                      <div className="text-lg font-semibold text-green-600">{user?.credibilityScore}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
                      <div className="flex items-center">
                        {isAvailable ? (
                          <span className="text-green-600 font-medium">{t.available}</span>
                        ) : (
                          <span className="text-gray-600 font-medium">{t.unavailable}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
