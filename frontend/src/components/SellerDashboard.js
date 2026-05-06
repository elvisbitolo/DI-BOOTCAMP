import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Plus, MapPin, Clock, DollarSign, 
  Star, MessageCircle, User, LogOut, 
  TrendingUp, CheckCircle, XCircle, Truck, Users, Circle
} from 'lucide-react';
import { supabase, subscribeToOrders, subscribeToUsers } from '../supabaseClient';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [onlineRiders, setOnlineRiders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const [orderForm, setOrderForm] = useState({
    pickupLocation: { address: '', coordinates: [0, 0] },
    deliveryLocation: { address: '', coordinates: [0, 0] },
    packageDescription: '',
    packageWeight: '',
    packageDimensions: { length: '', width: '', height: '' },
    deliveryFee: '',
    specialInstructions: '',
    priority: 'standard',
    paymentMethod: 'cash'
  });

  const translations = {
    en: {
      dashboard: 'Seller Dashboard',
      welcome: 'Welcome back',
      createOrder: 'Create Order',
      myOrders: 'My Orders',
      statistics: 'Statistics',
      profile: 'Profile',
      logout: 'Logout',
      orderNumber: 'Order #',
      status: 'Status',
      rider: 'Rider',
      fee: 'Fee',
      actions: 'Actions',
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
      pickupLocation: 'Pickup Location',
      deliveryLocation: 'Delivery Location',
      packageDetails: 'Package Details',
      description: 'Description',
      weight: 'Weight (kg)',
      dimensions: 'Dimensions (cm)',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      deliveryFee: 'Delivery Fee (KES)',
      specialInstructions: 'Special Instructions',
      priority: 'Priority',
      standard: 'Standard',
      urgent: 'Urgent',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      mpesa: 'M-Pesa',
      card: 'Card'
    },
    sw: {
      dashboard: 'Dashibodi ya Mauzaji',
      welcome: 'Karibu tena',
      createOrder: 'Tengeneza Oda',
      myOrders: 'Oda Zangu',
      statistics: 'Takwimu',
      profile: 'Wasifu',
      logout: 'Toka',
      orderNumber: 'Oda #',
      status: 'Hali',
      rider: 'Mpanda Baiskeli',
      fee: 'Ada',
      actions: 'Vitendo',
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
      pickupLocation: 'Mahali pa Kuchukua',
      deliveryLocation: 'Mahali pa Kusilisha',
      packageDetails: 'Maelezo ya Kifurushi',
      description: 'Maelezo',
      weight: 'Uzito (kg)',
      dimensions: 'Vipimo (cm)',
      length: 'Urefu',
      width: 'Upana',
      height: 'Kimo',
      deliveryFee: 'Ada ya Uwasilishaji (KES)',
      specialInstructions: 'Maelezo Maalum',
      priority: 'Kipaumbele',
      standard: 'Kawaida',
      urgent: 'Dharura',
      paymentMethod: 'Njia ya Malipo',
      cash: 'Pesa',
      mpesa: 'M-Pesa',
      card: 'Kadi'
    }
  };

  const t = translations[selectedLanguage];

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      // TODO: Replace with actual API call
      const userData = {
        name: 'John Seller',
        email: 'john@example.com',
        businessName: 'Gikomba Electronics',
        averageRating: 4.5,
        totalRatings: 23,
      };
      return userData;
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineRiders = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'rider')
        .eq('is_online', true);

      if (error) {
        console.error('Error loading riders:', error);
      } else {
        setOnlineRiders(data || []);
      }
    } catch (error) {
      console.error('Error loading riders:', error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const orderData = {
        seller_id: userData.id,
        order_number: `ORD-${Date.now()}`,
        pickup_location: orderForm.pickupLocation.address,
        delivery_location: orderForm.deliveryLocation.address,
        package_description: orderForm.packageDescription,
        package_weight: orderForm.packageWeight,
        delivery_fee: orderForm.deliveryFee,
        special_instructions: orderForm.specialInstructions,
        priority: orderForm.priority,
        payment_method: orderForm.paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again.');
        return;
      }

      console.log('Order created:', data);
      setShowOrderForm(false);
      setOrderForm({
        pickupLocation: { address: '', coordinates: [0, 0] },
        deliveryLocation: { address: '', coordinates: [0, 0] },
        packageDescription: '',
        packageWeight: '',
        packageDimensions: { length: '', width: '', height: '' },
        deliveryFee: '',
        specialInstructions: '',
        priority: 'standard',
        paymentMethod: 'cash'
      });
      loadOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
            <Package className="h-8 w-8 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">{t.dashboard}</h1>
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
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
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
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.businessName}</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm text-gray-700">{user?.averageRating}</span>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  {t.myOrders}
                </button>
                <button
                  onClick={() => setActiveTab('riders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'riders' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Online Riders ({onlineRiders.length})
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'statistics' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  {t.statistics}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
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
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{t.myOrders}</h2>
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createOrder}
                  </button>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
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
                              <MapPin className="h-4 w-4 mr-1" />
                              {order.deliveryLocation?.address}
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
                          {order.rider && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">{t.rider}:</span> {order.rider.name}
                              <div className="flex items-center ml-2">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="ml-1">{order.rider.averageRating}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {order.rider && (
                            <Link to={`/chat/${order._id}`} className="btn-secondary">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {t.chat}
                            </Link>
                          )}
                          <button className="btn-secondary">
                            {t.track}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'riders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Online Riders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlineRiders.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No riders are currently online</p>
                    </div>
                  ) : (
                    onlineRiders.map((rider) => (
                      <div key={rider.id} className="card">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="relative">
                              <User className="h-10 w-10 text-gray-400" />
                              <Circle className="h-3 w-3 text-green-500 fill-current absolute -bottom-1 -right-1" />
                            </div>
                            <div className="ml-3">
                              <h3 className="font-semibold text-gray-800">{rider.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">{rider.rider_type}</p>
                              <p className="text-sm text-gray-500">Area: {rider.area}</p>
                              <p className="text-sm text-gray-500">Vehicle: {rider.vehicle_number}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Link to={`/chat/${rider.id}`} className="btn-primary flex-1 text-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.statistics}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card text-center">
                    <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{orders.length}</h3>
                    <p className="text-gray-600">Total Orders</p>
                  </div>
                  <div className="card text-center">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{user?.averageRating || 'N/A'}</h3>
                    <p className="text-gray-600">{t.averageRating}</p>
                  </div>
                  <div className="card text-center">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{user?.credibilityScore || 'N/A'}%</h3>
                    <p className="text-gray-600">Credibility Score</p>
                  </div>
                  <div className="card text-center">
                    <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">KES {user?.totalEarnings?.toLocaleString() || '0'}</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input type="text" value={user?.businessName || ''} className="input-field" readOnly />
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t.createOrder}</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.pickupLocation}</label>
                  <input
                    type="text"
                    value={orderForm.pickupLocation.address}
                    onChange={(e) => setOrderForm({...orderForm, pickupLocation: {...orderForm.pickupLocation, address: e.target.value}})}
                    className="input-field"
                    placeholder="Enter pickup address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.deliveryLocation}</label>
                  <input
                    type="text"
                    value={orderForm.deliveryLocation.address}
                    onChange={(e) => setOrderForm({...orderForm, deliveryLocation: {...orderForm.deliveryLocation, address: e.target.value}})}
                    className="input-field"
                    placeholder="Enter delivery address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</label>
                <textarea
                  value={orderForm.packageDescription}
                  onChange={(e) => setOrderForm({...orderForm, packageDescription: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Describe your package"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.weight}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={orderForm.packageWeight}
                    onChange={(e) => setOrderForm({...orderForm, packageWeight: e.target.value})}
                    className="input-field"
                    placeholder="Weight in kg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.deliveryFee}</label>
                  <input
                    type="number"
                    value={orderForm.deliveryFee}
                    onChange={(e) => setOrderForm({...orderForm, deliveryFee: e.target.value})}
                    className="input-field"
                    placeholder="Delivery fee in KES"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.dimensions} (cm)</label>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    value={orderForm.packageDimensions.length}
                    onChange={(e) => setOrderForm({...orderForm, packageDimensions: {...orderForm.packageDimensions, length: e.target.value}})}
                    className="input-field"
                    placeholder={t.length}
                    required
                  />
                  <input
                    type="number"
                    value={orderForm.packageDimensions.width}
                    onChange={(e) => setOrderForm({...orderForm, packageDimensions: {...orderForm.packageDimensions, width: e.target.value}})}
                    className="input-field"
                    placeholder={t.width}
                    required
                  />
                  <input
                    type="number"
                    value={orderForm.packageDimensions.height}
                    onChange={(e) => setOrderForm({...orderForm, packageDimensions: {...orderForm.packageDimensions, height: e.target.value}})}
                    className="input-field"
                    placeholder={t.height}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.specialInstructions}</label>
                <textarea
                  value={orderForm.specialInstructions}
                  onChange={(e) => setOrderForm({...orderForm, specialInstructions: e.target.value})}
                  className="input-field"
                  rows={2}
                  placeholder="Any special instructions for the rider"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.priority}</label>
                  <select
                    value={orderForm.priority}
                    onChange={(e) => setOrderForm({...orderForm, priority: e.target.value})}
                    className="input-field"
                  >
                    <option value="standard">{t.standard}</option>
                    <option value="urgent">{t.urgent}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.paymentMethod}</label>
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    className="input-field"
                  >
                    <option value="cash">{t.cash}</option>
                    <option value="mpesa">{t.mpesa}</option>
                    <option value="card">{t.card}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
