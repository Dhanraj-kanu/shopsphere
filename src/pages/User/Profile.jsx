import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Package, Loader2, LogOut, User, MapPin, Bell, Save, X, Edit2, CheckCircle } from 'lucide-react';

const UserProfile = () => {
    const { user, logout, login } = useAuth(); // Assuming login updates user context
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // orders, profile, address, notifications
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });
    const [notifications, setNotifications] = useState([]);
    const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zip: user.address?.zip || '',
                    country: user.address?.country || ''
                }
            });
            fetchUserProfile(); // Fetch fresh data
            fetchOrders();
            fetchNotifications();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/users/profile', config);

            // Update form data with fresh data from server
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: {
                    street: data.address?.street || '',
                    city: data.address?.city || '',
                    state: data.address?.state || '',
                    zip: data.address?.zip || '',
                    country: data.address?.country || ''
                }
            });
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/orders/myorders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders", error);
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/users/notifications', config);
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setFormData({
            ...formData,
            address: { ...formData.address, [e.target.name]: e.target.value }
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateStatus({ type: 'loading', message: 'Updating profile...' });
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/api/users/profile', formData, config);

            // Start Update local user context (simplified) or trigger re-fetch
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            const updatedUser = { ...storedUser, ...data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            // Trigger a silent reload or context update if possible. 
            // Ideally AuthContext should expose a method to update user. 
            // For now, we rely on the component re-rendering or user refresh, 
            // but let's try to update state locally to reflect changes immediately.
            setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
            setIsEditing(false);
            setTimeout(() => setUpdateStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setUpdateStatus({ type: 'error', message: error.response?.data?.message || 'Update failed' });
        }
    };

    const markNotificationRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`/api/users/notifications/${id}/read`, {}, config);
            setNotifications(data);
        } catch (error) {
            console.error("Error marking notification read", error);
        }
    };

    if (!user) return <div className="p-10 text-center">Please log in to view profile.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="font-bold text-gray-800 text-lg">{user.name}</h2>
                        <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 text-red-500 font-medium bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>

                    <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'orders' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Package size={20} /> My Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'profile' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <User size={20} /> Personal Details
                        </button>
                        <button
                            onClick={() => setActiveTab('address')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'address' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <MapPin size={20} /> Address Book
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'notifications' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Bell size={20} /> Notifications
                            {Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
                                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Package className="text-green-600" /> Order History
                            </h2>
                            {loading ? (
                                <div className="flex justify-center p-10">
                                    <Loader2 className="animate-spin text-green-600" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Package size={32} />
                                    </div>
                                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                                    <button onClick={() => window.location.href = '/'} className="text-green-600 font-bold hover:underline">Start Shopping</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-lg text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' || order.isDelivered ? 'bg-green-100 text-green-700' :
                                                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {order.status || (order.isDelivered ? 'Delivered' : 'Processing')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-xl text-green-600">₹{order.totalPrice.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                                {order.orderItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm text-gray-700">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                            {item.name} <span className="text-gray-400">x{item.qty}</span>
                                                        </span>
                                                        <span className="font-medium">₹{item.price.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'profile' || activeTab === 'address') && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    {activeTab === 'profile' ? <User className="text-green-600" /> : <MapPin className="text-green-600" />}
                                    {activeTab === 'profile' ? 'Personal Details' : 'Address Book'}
                                </h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-green-600 font-bold hover:bg-green-50 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        <Edit2 size={18} /> Edit
                                    </button>
                                )}
                            </div>

                            {updateStatus.message && (
                                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${updateStatus.type === 'success' ? 'bg-green-50 text-green-700' : updateStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {updateStatus.type === 'success' ? <CheckCircle size={20} /> : updateStatus.type === 'loading' ? <Loader2 className="animate-spin" size={20} /> : null}
                                    {updateStatus.message}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile}>
                                {activeTab === 'profile' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Add phone number"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'address' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={formData.address.street}
                                                onChange={handleAddressChange}
                                                disabled={!isEditing}
                                                placeholder="123 Main St, Apt 4B"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.address.city}
                                                onChange={handleAddressChange}
                                                disabled={!isEditing}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State / Province</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.address.state}
                                                onChange={handleAddressChange}
                                                disabled={!isEditing}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal / Zip Code</label>
                                            <input
                                                type="text"
                                                name="zip"
                                                value={formData.address.zip}
                                                onChange={handleAddressChange}
                                                disabled={!isEditing}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.address.country}
                                                onChange={handleAddressChange}
                                                disabled={!isEditing}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                                            />
                                        </div>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Bell className="text-green-600" /> Notifications
                            </h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center text-gray-500">
                                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p>No new notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex justify-between items-start gap-4 ${!notification.isRead ? 'bg-green-50/50' : ''}`}
                                        >
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markNotificationRead(notification._id)}
                                                    className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
