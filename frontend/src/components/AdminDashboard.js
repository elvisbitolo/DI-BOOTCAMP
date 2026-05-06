import React, { useState, useEffect } from 'react';
import { 
  Users, Package, DollarSign, TrendingUp, 
  Activity, LogOut, Settings, FileText, 
  BarChart, PieChart, LineChart, Download,
  Search, Filter, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'payments') fetchPayments();
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      // TODO: Replace with actual API call
      const mockStats = {
        overview: {
          totalUsers: 1234,
          totalOrders: 5678,
          totalRevenue: 2890000,
          activeUsers: 234,
          pendingOrders: 45,
          completedOrders: 5234,
          totalRatings: 3456
        },
        distributions: {
          users: [
            { _id: 'seller', count: 890 },
            { _id: 'rider', count: 344 }
          ],
          orders: [
            { _id: 'pending', count: 45 },
            { _id: 'accepted', count: 123 },
            { _id: 'in_transit', count: 67 },
            { _id: 'delivered', count: 5234 },
            { _id: 'cancelled', count: 209 }
          ]
        },
        monthlyRevenue: [
          { _id: { year: 2024, month: 11 }, revenue: 450000, orders: 890 },
          { _id: { year: 2024, month: 12 }, revenue: 520000, orders: 1023 },
          { _id: { year: 2025, month: 1 }, revenue: 480000, orders: 945 },
          { _id: { year: 2025, month: 2 }, revenue: 510000, orders: 987 },
          { _id: { year: 2025, month: 3 }, revenue: 580000, orders: 1123 },
          { _id: { year: 2025, month: 4 }, revenue: 350000, orders: 710 }
        ]
      };
      setDashboardStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // TODO: Replace with actual API call
      const mockUsers = [
        {
          _id: '1',
          name: 'John Seller',
          email: 'john@example.com',
          userType: 'seller',
          isActive: true,
          isOnline: true,
          averageRating: 4.5,
          completedOrders: 234,
          credibilityScore: 85,
          createdAt: '2024-01-15'
        },
        {
          _id: '2',
          name: 'James Rider',
          email: 'james@example.com',
          userType: 'rider',
          isActive: true,
          isOnline: false,
          averageRating: 4.8,
          completedOrders: 456,
          credibilityScore: 92,
          createdAt: '2024-02-20'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API call
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD001',
          status: 'delivered',
          seller: { name: 'John Seller', email: 'john@example.com' },
          rider: { name: 'James Rider', email: 'james@example.com' },
          deliveryFee: 500,
          orderTime: '2024-04-15T10:30:00Z'
        },
        {
          _id: '2',
          orderNumber: 'ORD002',
          status: 'pending',
          seller: { name: 'Mary Trader', email: 'mary@example.com' },
          rider: null,
          deliveryFee: 750,
          orderTime: '2024-04-15T11:45:00Z'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      // TODO: Replace with actual API call
      const mockPayments = [
        {
          _id: '1',
          transactionId: 'PAY001',
          amount: 500,
          paymentMethod: 'mpesa',
          paymentStatus: 'completed',
          order: { orderNumber: 'ORD001' },
          payer: { name: 'John Seller' },
          payee: { name: 'James Rider' },
          createdAt: '2024-04-15T10:35:00Z'
        },
        {
          _id: '2',
          transactionId: 'PAY002',
          amount: 750,
          paymentMethod: 'card',
          paymentStatus: 'pending',
          order: { orderNumber: 'ORD002' },
          payer: { name: 'Mary Trader' },
          payee: null,
          createdAt: '2024-04-15T11:46:00Z'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleUserStatusToggle = async (userId, isActive) => {
    try {
      // TODO: Replace with actual API call
      console.log('Toggling user status:', userId, isActive);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      accepted: <CheckCircle className="h-4 w-4" />,
      in_transit: <Package className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
      processing: <Activity className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <BarChart className="h-8 w-8 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Admin</span>
            </div>
            <button className="btn-secondary">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'dashboard' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="h-4 w-4 inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'users' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'payments' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Payments
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'analytics' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <LineChart className="h-4 w-4 inline mr-2" />
                  Analytics
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card text-center">
                    <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{dashboardStats?.overview.totalUsers}</h3>
                    <p className="text-gray-600">Total Users</p>
                    <p className="text-sm text-green-600 mt-2">{dashboardStats?.overview.activeUsers} Active</p>
                  </div>
                  <div className="card text-center">
                    <Package className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{dashboardStats?.overview.totalOrders}</h3>
                    <p className="text-gray-600">Total Orders</p>
                    <p className="text-sm text-yellow-600 mt-2">{dashboardStats?.overview.pendingOrders} Pending</p>
                  </div>
                  <div className="card text-center">
                    <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">KES {dashboardStats?.overview.totalRevenue.toLocaleString()}</h3>
                    <p className="text-gray-600">Total Revenue</p>
                  </div>
                  <div className="card text-center">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800">{dashboardStats?.overview.totalRatings}</h3>
                    <p className="text-gray-600">Total Ratings</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      {dashboardStats?.distributions.users.map((dist) => (
                        <div key={dist._id} className="flex justify-between items-center">
                          <span className="capitalize text-gray-700">{dist._id}s</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${(dist.count / dashboardStats.overview.totalUsers) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{dist.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
                    <div className="space-y-3">
                      {dashboardStats?.distributions.orders.map((dist) => (
                        <div key={dist._id} className="flex justify-between items-center">
                          <span className="capitalize text-gray-700">{dist._id.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  dist._id === 'delivered' ? 'bg-green-600' :
                                  dist._id === 'pending' ? 'bg-yellow-600' :
                                  dist._id === 'cancelled' ? 'bg-red-600' : 'bg-purple-600'
                                }`}
                                style={{ width: `${(dist.count / dashboardStats.overview.totalOrders) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{dist.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <span className="text-sm text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="ml-1">{user.averageRating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.completedOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleUserStatusToggle(user._id, !user.isActive)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                user.isActive 
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.seller.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.rider ? order.rider.name : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            KES {order.deliveryFee}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.orderTime).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Management</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.transactionId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            KES {payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {payment.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center ${getStatusColor(payment.paymentStatus)}`}>
                              {getStatusIcon(payment.paymentStatus)}
                              <span className="ml-1">{payment.paymentStatus}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payee ? payment.payee.name : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Reports</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
                    <div className="space-y-3">
                      {dashboardStats?.monthlyRevenue.map((month) => (
                        <div key={`${month._id.year}-${month._id.month}`} className="flex justify-between items-center">
                          <span className="text-gray-700">
                            {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                          </span>
                          <div className="text-right">
                            <div className="font-medium">KES {month.revenue.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{month.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 w-full btn-secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </button>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-gray-700">Average Order Value</span>
                        <span className="font-medium">KES 523</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-gray-700">Completion Rate</span>
                        <span className="font-medium text-green-600">92.3%</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-gray-700">Average Rating</span>
                        <span className="font-medium">4.6 ⭐</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Active Riders</span>
                        <span className="font-medium">156</span>
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

export default AdminDashboard;
