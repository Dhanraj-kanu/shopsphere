
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    Package, Users, DollarSign, ShoppingBag, Loader2, CheckCircle,
    Plus, Edit, Trash2, X, Shield, LayoutDashboard, FolderTree,
    Star, Ticket, BarChart3, Settings, Menu, LogOut, TrendingUp,
    AlertTriangle, BarChart2
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, categories, orders, users, reviews, coupons, analytics, settings
    const [stats, setStats] = useState({
        totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0,
        lowStockCount: 0, monthlyRevenue: [], dailyOrders: [], topSellingProducts: []
    });
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Order Management State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    // Product Management State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productFormData, setProductFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        image: '',
        stock: ''
    });

    // Coupon Management State
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

    // Category Management State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        image: '',
        parent: '',
        isActive: true,
        bannerImage: '',
        icon: '',
        displayOnHomepage: false,
        featured: false,
        customColor: '#10b981',
        metaTitle: '',
        metaDescription: '',
        slug: '',
        showInMegaMenu: false,
        hideEmptyCategory: false,
        filters: []
    });

    // Drag and Drop state for categories
    const [draggedCategoryId, setDraggedCategoryId] = useState(null);

    // Category Analytics State
    const [isCategoryAnalyticsOpen, setIsCategoryAnalyticsOpen] = useState(false);
    const [categoryAnalyticsData, setCategoryAnalyticsData] = useState(null);
    const [loadingCategoryAnalytics, setLoadingCategoryAnalytics] = useState(false);

    const [editingCoupon, setEditingCoupon] = useState(null);
    const [couponFormData, setCouponFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        usageLimit: '',
        isActive: true
    });

    // Analytics State
    const [analyticsSummary, setAnalyticsSummary] = useState({ totalSales: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 });
    const [analyticsSales, setAnalyticsSales] = useState([]);
    const [analyticsTopProducts, setAnalyticsTopProducts] = useState([]);
    const [analyticsTopCustomers, setAnalyticsTopCustomers] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        if (user && user.token) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'analytics' && user && user.token) {
            fetchAnalyticsData();
        }
    }, [activeTab, user]);

    const fetchData = async () => {
        if (!user || !user.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [statsRes, ordersRes, usersRes, productsRes, categoriesRes, couponsRes, reviewsRes] = await Promise.all([
                axios.get('/api/admin/stats', config),
                axios.get('/api/admin/orders', config),
                axios.get('/api/admin/users', config),
                axios.get('/api/products'),
                axios.get('/api/admin/categories', config),
                axios.get('/api/admin/coupons', config),
                axios.get('/api/admin/reviews', config)
            ]);

            setStats(statsRes.data);
            setOrders(ordersRes.data || []);
            setUsers(usersRes.data || []);
            setProducts(productsRes.data || []);
            setCategories(categoriesRes.data || []);
            setCoupons(couponsRes.data || []);
            setReviews(reviewsRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin data", error);
            setLoading(false);
        }
    };

    const fetchAnalyticsData = async () => {
        if (!user || !user.token) return;
        setLoadingAnalytics(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [dashboardRes, salesRes, productsRes, customersRes] = await Promise.all([
                axios.get('/api/admin/analytics/dashboard', config),
                axios.get('/api/admin/analytics/sales', config),
                axios.get('/api/admin/analytics/top-products', config),
                axios.get('/api/admin/analytics/top-customers', config)
            ]);

            setAnalyticsSummary(dashboardRes.data);
            setAnalyticsSales(salesRes.data || []);
            setAnalyticsTopProducts(productsRes.data || []);
            setAnalyticsTopCustomers(customersRes.data || []);
            setLoadingAnalytics(false);
        } catch (error) {
            console.error("Error fetching analytics data", error);
            setLoadingAnalytics(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus }, config);
            setOrders(orders.map(order =>
                order._id === orderId ? res.data : order
            ));
        } catch (error) {
            console.error("Error updating order status", error);
            alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`/api/admin/users/${userId}/suspend`, {}, config);
            setUsers(users.map(u => u._id === userId ? res.data.user : u));
        } catch (error) {
            console.error("Error toggling user status", error);
            alert(`Failed to update user status: ${error.response?.data?.message || error.message}`);
        }
    };

    const promoteUser = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`/api/admin/users/${userId}/promote`, {}, config);
            setUsers(users.map(u => u._id === userId ? res.data.user : u));
            alert(res.data.message);
        } catch (error) {
            console.error("Error promoting user", error);
            alert(`Failed to update user role: ${error.response?.data?.message || error.message}`);
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/admin/users/${userId}`, config);
                setUsers(users.filter(u => u._id !== userId));
            } catch (error) {
                console.error("Error deleting user", error);
                alert(`Failed to delete user: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Review Management
    const updateReviewStatus = async (reviewId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`/api/admin/reviews/${reviewId}/status`, { status: newStatus }, config);
            setReviews(reviews.map(r => r._id === reviewId ? res.data : r));
        } catch (error) {
            console.error("Error updating review status", error);
            alert(`Failed to update review status: ${error.response?.data?.message || error.message}`);
        }
    };

    const deleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/admin/reviews/${reviewId}`, config);
                setReviews(reviews.filter(r => r._id !== reviewId));
            } catch (error) {
                console.error("Error deleting review", error);
                alert(`Failed to delete review: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Product Management
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        try {
            if (editingProduct) {
                // Update
                const res = await axios.put(`/api/products/${editingProduct.id}`, productFormData, config);
                setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
            } else {
                // Create
                // Generate a simple ID for now since backend uses manual ID. 
                // ideally replace with _id everywhere but keeping consistent with existing seed
                const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                const payload = { ...productFormData, id: newId };
                const res = await axios.post('/api/products', payload, config);
                setProducts([...products, res.data]);
            }
            closeProductModal();
        } catch (error) {
            console.error("Error saving product", error);
            alert("Failed to save product");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/products/${id}`, config);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting product", error);
                alert("Failed to delete product");
            }
        }
    };

    const openProductModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setProductFormData({
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description,
                image: product.image,
                stock: product.stock
            });
        } else {
            setEditingProduct(null);
            setProductFormData({ name: '', price: '', category: '', description: '', image: '', stock: '' });
        }
        setIsProductModalOpen(true);
    };

    const closeProductModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const openCouponModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setCouponFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
                usageLimit: coupon.usageLimit || '',
                isActive: coupon.isActive
            });
        } else {
            setEditingCoupon(null);
            setCouponFormData({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '', usageLimit: '', isActive: true });
        }
        setIsCouponModalOpen(true);
    };

    // Category Management
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            if (editingCategory) {
                const res = await axios.put(`/api/admin/categories/${editingCategory._id}`, categoryFormData, config);
                setCategories(categories.map(c => c._id === editingCategory._id ? res.data : c));
            } else {
                const res = await axios.post('/api/admin/categories', categoryFormData, config);
                setCategories([...categories, res.data]);
            }
            closeCategoryModal();
        } catch (error) {
            console.error("Error saving category", error);
            alert(`Failed to save category: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/admin/categories/${id}`, config);
                setCategories(categories.filter(c => c._id !== id));
            } catch (error) {
                console.error("Error deleting category", error);
                alert(`Failed to delete category: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const toggleCategoryStatus = async (id, currentStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`/api/admin/categories/${id}`, { isActive: !currentStatus }, config);
            setCategories(categories.map(c => c._id === id ? res.data : c));
        } catch (error) {
            console.error("Error toggling category status", error);
            alert(`Failed to toggle category status: ${error.response?.data?.message || error.message}`);
        }
    };

    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryFormData({
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                parent: category.parent?._id || category.parent || '',
                isActive: category.isActive,
                bannerImage: category.bannerImage || '',
                icon: category.icon || '',
                displayOnHomepage: category.displayOnHomepage || false,
                featured: category.featured || false,
                customColor: category.customColor || '#10b981',
                metaTitle: category.metaTitle || '',
                metaDescription: category.metaDescription || '',
                slug: category.slug || '',
                showInMegaMenu: category.showInMegaMenu || false,
                hideEmptyCategory: category.hideEmptyCategory || false,
                filters: category.filters || []
            });
        } else {
            setEditingCategory(null);
            setCategoryFormData({
                name: '', description: '', image: '', parent: '', isActive: true,
                bannerImage: '', icon: '', displayOnHomepage: false, featured: false, customColor: '#10b981', metaTitle: '', metaDescription: '',
                slug: '', showInMegaMenu: false, hideEmptyCategory: false, filters: []
            });
        }
        setIsCategoryModalOpen(true);
    };

    const handleCategoryDragStart = (e, id) => {
        setDraggedCategoryId(id);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image could be added here
        setTimeout(() => { e.target.classList.add('opacity-50'); }, 0);
    };

    const handleCategoryDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleCategoryDrop = async (e, targetId) => {
        e.preventDefault();
        const itemsList = document.querySelectorAll('.category-row');
        itemsList.forEach(item => item.classList.remove('opacity-50'));

        if (!draggedCategoryId || draggedCategoryId === targetId) return;

        // Clone categories
        const newCategories = [...categories];

        // Ensure sorted by frontend if it wasn't already matching UI
        // But since we just want to swap or move visually:
        const draggedIndex = newCategories.findIndex(c => c._id === draggedCategoryId);
        const targetIndex = newCategories.findIndex(c => c._id === targetId);

        const [draggedItem] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, draggedItem);

        setCategories(newCategories);
        setDraggedCategoryId(null);

        // Optimistically sync to backend
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const orderedIds = newCategories.map(c => c._id);
            await axios.put('/api/admin/categories/reorder', { orderedIds }, config);
        } catch (error) {
            console.error("Error reordering categories", error);
            alert("Failed to save category order. Refreshing data.");
            fetchData(); // Reset
        }
    };

    const closeCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const openCategoryAnalytics = async (category) => {
        setIsCategoryAnalyticsOpen(true);
        setLoadingCategoryAnalytics(true);
        setCategoryAnalyticsData(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`/api/admin/categories/${category._id}/analytics`, config);
            setCategoryAnalyticsData(res.data);
        } catch (error) {
            console.error("Error fetching category analytics", error);
            alert(`Failed to load category analytics: ${error.response?.data?.message || error.message}`);
            setIsCategoryAnalyticsOpen(false);
        } finally {
            setLoadingCategoryAnalytics(false);
        }
    };

    const closeCategoryAnalytics = () => {
        setIsCategoryAnalyticsOpen(false);
        setCategoryAnalyticsData(null);
    };

    const closeCouponModal = () => {
        setIsCouponModalOpen(false);
        setEditingCoupon(null);
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            if (editingCoupon) {
                const res = await axios.put(`/api/admin/coupons/${editingCoupon._id}`, couponFormData, config);
                setCoupons(coupons.map(c => c._id === editingCoupon._id ? res.data : c));
            } else {
                const res = await axios.post('/api/admin/coupons', couponFormData, config);
                setCoupons([...coupons, res.data]);
            }
            closeCouponModal();
        } catch (error) {
            console.error("Error saving coupon", error);
            alert(`Failed to save coupon: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/admin/coupons/${id}`, config);
                setCoupons(coupons.filter(c => c._id !== id));
            } catch (error) {
                console.error("Error deleting coupon", error);
                alert(`Failed to delete coupon: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(`/api/admin/coupons/${id}`, { isActive: !currentStatus }, config);
            setCoupons(coupons.map(c => c._id === id ? res.data : c));
        } catch (error) {
            console.error("Error toggling coupon status", error);
            alert(`Failed to toggle coupon status: ${error.response?.data?.message || error.message}`);
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const closeOrderModal = () => {
        setIsOrderModalOpen(false);
        setSelectedOrder(null);
    };

    const openInvoiceModal = (order) => {
        setSelectedOrder(order);
        setIsInvoiceModalOpen(true);
    };

    const closeInvoiceModal = () => {
        setIsInvoiceModalOpen(false);
        setSelectedOrder(null);
    };

    const printInvoice = () => {
        const printContent = document.getElementById('invoice-content');
        const win = window.open('', '', 'width=800,height=600');
        win.document.write('<html><head><title>Invoice</title>');
        win.document.write('<style>body { font-family: sans-serif; padding: 20px; } .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } .total { text-align: right; margin-top: 20px; font-weight: bold; }</style>');
        win.document.write('</head><body>');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;
    if (!user || !user.isAdmin) return <div className="text-center p-10 text-red-500">Access Denied. Admin only.</div>;

    const NavItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === id ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
        </button>
    );

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    {sidebarOpen && <h1 className="text-xl font-bold text-green-600">ShopSphere</h1>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <NavItem id="products" label="Products" icon={Package} />
                    <NavItem id="categories" label="Categories" icon={FolderTree} />
                    <NavItem id="orders" label="Orders" icon={ShoppingBag} />
                    <NavItem id="users" label="Users" icon={Users} />
                    <NavItem id="reviews" label="Reviews" icon={Star} />
                    <NavItem id="coupons" label="Coupons" icon={Ticket} />
                    <NavItem id="analytics" label="Analytics" icon={BarChart3} />
                    <NavItem id="settings" label="Settings" icon={Settings} />
                </nav>

                <div className="p-4 border-t">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all">
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <img src={user.avatar || "https://ui-avatars.com/api/?name=Admin"} alt="Admin" className="w-10 h-10 rounded-full border border-gray-200" />
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="bg-green-100 p-4 rounded-2xl text-green-600"><DollarSign size={28} /></div>
                                    <div><p className="text-sm text-gray-500 font-medium">Total Revenue</p><p className="text-2xl font-black text-gray-800">₹{(stats.totalRevenue || 0).toLocaleString()}</p></div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><ShoppingBag size={28} /></div>
                                    <div><p className="text-sm text-gray-500 font-medium">Total Orders</p><p className="text-2xl font-black text-gray-800">{stats.totalOrders}</p></div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="bg-purple-100 p-4 rounded-2xl text-purple-600"><Users size={28} /></div>
                                    <div><p className="text-sm text-gray-500 font-medium">Total Users</p><p className="text-2xl font-black text-gray-800">{stats.totalUsers}</p></div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="bg-red-100 p-4 rounded-2xl text-red-600"><AlertTriangle size={28} /></div>
                                    <div><p className="text-sm text-gray-500 font-medium">Low Stock</p><p className="text-2xl font-black text-gray-800">{stats.lowStockCount}</p></div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Monthly Revenue</h3>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.monthlyRevenue}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-6">Orders per Day</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.dailyOrders}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-6">Top Selling Products</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.topSellingProducts}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="sales"
                                                >
                                                    {stats.topSellingProducts.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-gray-800">User Management</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-6">Name</th>
                                            <th className="p-6">Email</th>
                                            <th className="p-6">Role</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6">Joined</th>
                                            <th className="p-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map(u => (
                                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-6 font-bold text-gray-800">{u.name}</td>
                                                <td className="p-6 text-gray-500">{u.email}</td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {u.isAdmin ? 'Admin' : 'Customer'}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {u.status === 'suspended' ? 'Suspended' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="p-6 flex gap-2">
                                                    <button onClick={() => promoteUser(u._id)} className="p-3 hover:bg-purple-50 text-purple-600 rounded-2xl transition-all" title="Toggle Admin"><Shield size={18} /></button>
                                                    <button onClick={() => toggleUserStatus(u._id)} className="p-3 hover:bg-yellow-50 text-yellow-600 rounded-2xl transition-all" title="Toggle Status"><CheckCircle size={18} /></button>
                                                    <button onClick={() => deleteUser(u._id)} className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-all" title="Delete"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-gray-800">Product List</h2>
                                <button onClick={() => openProductModal()} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100"><Plus size={20} /> Add Product</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-6">Product</th>
                                            <th className="p-6">Price</th>
                                            <th className="p-6">Category</th>
                                            <th className="p-6">Stock</th>
                                            <th className="p-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-2xl shadow-sm" />
                                                        <span className="font-bold text-gray-800">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 font-bold text-gray-900">₹{p.price}</td>
                                                <td className="p-6"><span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-600">{p.category}</span></td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.stock} in stock
                                                    </span>
                                                </td>
                                                <td className="p-6 flex gap-2">
                                                    <button onClick={() => openProductModal(p)} className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-all"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-gray-800">Order Management</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-6">Order ID</th>
                                            <th className="p-6">Customer</th>
                                            <th className="p-6">Total</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6">Date</th>
                                            <th className="p-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-6 font-mono text-xs font-black text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                                                <td className="p-6">
                                                    <div className="font-bold text-gray-800">{order.user ? order.user.name : 'Guest'}</div>
                                                    <div className="text-xs text-gray-400">{order.user?.email || 'N/A'}</div>
                                                </td>
                                                <td className="p-6 font-black text-gray-900">₹{order.totalPrice}</td>
                                                <td className="p-6">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-none outline-none cursor-pointer bg-blue-50 text-blue-700"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="p-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="p-6 flex gap-2">
                                                    <button onClick={() => openOrderModal(order)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all"><ShoppingBag size={18} /></button>
                                                    <button onClick={() => openInvoiceModal(order)} className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all"><DollarSign size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'coupons' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-gray-800">Coupon Management</h2>
                                <button onClick={() => openCouponModal()} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100"><Plus size={20} /> Add Coupon</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-6">Code</th>
                                            <th className="p-6">Discount</th>
                                            <th className="p-6">Expiry Date</th>
                                            <th className="p-6">Usage</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {coupons.map((c) => (
                                            <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-6 font-bold text-gray-800">{c.code}</td>
                                                <td className="p-6">
                                                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                                                </td>
                                                <td className="p-6 text-gray-500">{new Date(c.expiryDate).toLocaleDateString()}</td>
                                                <td className="p-6 text-gray-500">{c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : '(Unlimited)'}</td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} onClick={() => toggleCouponStatus(c._id, c.isActive)}>
                                                        {c.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-6 flex gap-2">
                                                    <button onClick={() => openCouponModal(c)} className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteCoupon(c._id)} className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-all"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loadingAnalytics ? (
                                <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>
                            ) : (
                                <>
                                    {/* KPI Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className="bg-green-100 p-4 rounded-2xl text-green-600"><DollarSign size={28} /></div>
                                            <div><p className="text-sm text-gray-500 font-medium">Net Revenue</p><p className="text-2xl font-black text-gray-800">₹{analyticsSummary.totalSales?.toLocaleString() || 0}</p></div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><ShoppingBag size={28} /></div>
                                            <div><p className="text-sm text-gray-500 font-medium">Total Orders</p><p className="text-2xl font-black text-gray-800">{analyticsSummary.totalOrders || 0}</p></div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className="bg-purple-100 p-4 rounded-2xl text-purple-600"><Users size={28} /></div>
                                            <div><p className="text-sm text-gray-500 font-medium">Total Users</p><p className="text-2xl font-black text-gray-800">{analyticsSummary.totalUsers || 0}</p></div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><Package size={28} /></div>
                                            <div><p className="text-sm text-gray-500 font-medium">Total Products</p><p className="text-2xl font-black text-gray-800">{analyticsSummary.totalProducts || 0}</p></div>
                                        </div>
                                    </div>

                                    {/* Sales Time Series Chart */}
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Revenue vs Orders (Last 30 Days)</h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analyticsSales}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={10} minTickGap={30} />
                                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                    <Area yAxisId="left" type="monotone" dataKey="sales" name="Revenue (₹)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                                    <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Sub-tables for Products & Customers */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                            <h3 className="font-bold text-gray-800 mb-6">Top Selling Products</h3>
                                            <div className="space-y-4">
                                                {analyticsTopProducts.map((prod, i) => (
                                                    <div key={prod._id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">#{i + 1}</div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{prod.name}</p>
                                                                <p className="text-xs text-gray-500">{prod.totalQuantitySold} units sold</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-black text-gray-900">₹{(prod.totalRevenue || 0).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                                {analyticsTopProducts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No product data available</p>}
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                            <h3 className="font-bold text-gray-800 mb-6">Top Spenders (Customers)</h3>
                                            <div className="space-y-4">
                                                {analyticsTopCustomers.map((cust, i) => (
                                                    <div key={cust._id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black">#{i + 1}</div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{cust.name}</p>
                                                                <p className="text-xs text-gray-500">{cust.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-gray-900">₹{(cust.totalSpent || 0).toLocaleString()}</p>
                                                            <p className="text-xs text-gray-500">{cust.totalOrders} Orders</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {analyticsTopCustomers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No customer data available</p>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-black text-gray-800">Review Management</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-6">Product</th>
                                            <th className="p-6">User</th>
                                            <th className="p-6">Rating</th>
                                            <th className="p-6">Review</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reviews.map((r) => (
                                            <tr key={r._id} className={`hover:bg-gray-50 transition-colors ${r.reported ? 'bg-orange-50' : ''}`}>
                                                <td className="p-6 font-bold text-gray-800">{r.product?.name || 'Unknown'}</td>
                                                <td className="p-6">
                                                    <div className="font-bold text-gray-800">{r.user?.name || 'Anonymous'}</div>
                                                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                                                    </div>
                                                </td>
                                                <td className="p-6 max-w-xs">
                                                    <div className="font-bold truncate" title={r.title}>{r.title}</div>
                                                    <div className="text-gray-500 truncate text-xs" title={r.comment}>{r.comment}</div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="p-6 flex gap-2">
                                                    {r.status !== 'approved' && (
                                                        <button onClick={() => updateReviewStatus(r._id, 'approved')} className="p-3 hover:bg-green-50 text-green-600 rounded-2xl transition-all" title="Approve">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {r.status !== 'rejected' && (
                                                        <button onClick={() => updateReviewStatus(r._id, 'rejected')} className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-all" title="Reject">
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => deleteReview(r._id)} className="p-3 hover:bg-gray-100 text-gray-600 rounded-2xl transition-all" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {reviews.length === 0 && <div className="p-10 text-center text-gray-400">No reviews found.</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                <h2 className="text-xl font-black text-gray-800">Category Management</h2>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm"
                                        value={categorySearchTerm}
                                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                                    />
                                    <button onClick={() => openCategoryModal()} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100"><Plus size={20} /> Add Category</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-6">Name</th>
                                            <th className="p-6">Parent</th>
                                            <th className="p-6">Products</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {categories
                                            .filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                            .map((c) => (
                                                <tr key={c._id} className="category-row hover:bg-gray-50 transition-colors cursor-move" draggable onDragStart={(e) => handleCategoryDragStart(e, c._id)} onDragOver={handleCategoryDragOver} onDrop={(e) => handleCategoryDrop(e, c._id)}>
                                                    <td className="p-6 font-bold text-gray-800">
                                                        <div className="flex items-center gap-4">
                                                            {c.image ? <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-xl shadow-sm" /> : <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><FolderTree size={20} /></div>}
                                                            <span>{c.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-gray-500">{c.parent ? c.parent.name : <span className="text-gray-400 italic">None</span>}</td>
                                                    <td className="p-6 text-gray-800 font-bold">{c.productCount || 0}</td>
                                                    <td className="p-6">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} onClick={() => toggleCategoryStatus(c._id, c.isActive)}>
                                                            {c.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 flex gap-2">
                                                        <button onClick={() => openCategoryModal(c)} className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all"><Edit size={18} /></button>
                                                        <button onClick={() => handleDeleteCategory(c._id)} className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-all"><Trash2 size={18} /></button>
                                                        <button onClick={() => openCategoryAnalytics(c)} className="p-3 hover:bg-purple-50 text-purple-600 rounded-2xl transition-all" title="View Analytics"><BarChart2 size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {categories.length === 0 && <div className="p-10 text-center text-gray-400">No categories found.</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-2xl font-black text-gray-300 mb-2 uppercase tracking-widest">{activeTab} Section</h3>
                            <p className="text-gray-400">Integration in progress. Management logic coming soon.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Existing Modals (Keep same) */}
            {isCouponModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200 h-auto max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-800">{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                            <button onClick={closeCouponModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCouponSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Coupon Code</label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold uppercase" value={couponFormData.code} onChange={e => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Discount Type</label>
                                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={couponFormData.discountType} onChange={e => setCouponFormData({ ...couponFormData, discountType: e.target.value })}>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Discount Value</label>
                                    <input type="number" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={couponFormData.discountValue} onChange={e => setCouponFormData({ ...couponFormData, discountValue: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expiry Date</label>
                                <input type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={couponFormData.expiryDate} onChange={e => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-6 items-center">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Usage Limit (Optional)</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={couponFormData.usageLimit} onChange={e => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })} placeholder="Unlimited" />
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <input type="checkbox" id="isActive" className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" checked={couponFormData.isActive} onChange={e => setCouponFormData({ ...couponFormData, isActive: e.target.checked })} />
                                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active</label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-200 uppercase tracking-widest mt-4">{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</button>
                        </form>
                    </div>
                </div>
            )}

            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={closeProductModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                                    <input type="number" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stock</label>
                                    <input type="number" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={productFormData.image} onChange={e => setProductFormData({ ...productFormData, image: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-200 uppercase tracking-widest mt-4">{editingProduct ? 'Update Product' : 'Create Product'}</button>
                        </form>
                    </div>
                </div>
            )}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 h-auto max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h3 className="text-2xl font-black text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button onClick={closeCategoryModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="space-y-6">
                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                                    <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Slug (Auto if empty)</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={categoryFormData.slug} onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} placeholder="e.g. smart-phones" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Parent Category</label>
                                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold" value={categoryFormData.parent} onChange={e => setCategoryFormData({ ...categoryFormData, parent: e.target.value })}>
                                        <option value="">None (Root Category)</option>
                                        {categories.filter(c => !editingCategory || c._id !== editingCategory._id).map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea rows="2" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.description} onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })}></textarea>
                            </div>

                            {/* Media Section */}
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-4">Media & Design</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Thumbnail/Image URL</label>
                                        <input type="text" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.image} onChange={e => setCategoryFormData({ ...categoryFormData, image: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Banner Image URL</label>
                                        <input type="text" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.bannerImage} onChange={e => setCategoryFormData({ ...categoryFormData, bannerImage: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Icon (Lucide/SVG URL)</label>
                                        <input type="text" placeholder="e.g. ShoppingBag" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.icon} onChange={e => setCategoryFormData({ ...categoryFormData, icon: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Custom Theme Color</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" className="w-10 h-10 rounded-2xl cursor-pointer border-0 p-0" value={categoryFormData.customColor} onChange={e => setCategoryFormData({ ...categoryFormData, customColor: e.target.value })} />
                                            <input type="text" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.customColor} onChange={e => setCategoryFormData({ ...categoryFormData, customColor: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-4">SEO Configuration</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Meta Title</label>
                                        <input type="text" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.metaTitle} onChange={e => setCategoryFormData({ ...categoryFormData, metaTitle: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Meta Description</label>
                                        <textarea rows="2" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-100 outline-none transition-all font-bold text-sm" value={categoryFormData.metaDescription} onChange={e => setCategoryFormData({ ...categoryFormData, metaDescription: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Filters Section */}
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-800">Custom Filters</h4>
                                    <button type="button" onClick={() => setCategoryFormData(prev => ({ ...prev, filters: [...prev.filters, { name: '', options: [] }] }))} className="text-xs font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">+ Add Filter</button>
                                </div>
                                <div className="space-y-3">
                                    {categoryFormData.filters.map((filter, index) => (
                                        <div key={index} className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-gray-100">
                                            <input type="text" placeholder="Filter Name (e.g. RAM)" className="w-1/3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" value={filter.name} onChange={(e) => {
                                                const newFilters = [...categoryFormData.filters];
                                                newFilters[index].name = e.target.value;
                                                setCategoryFormData({ ...categoryFormData, filters: newFilters });
                                            }} />
                                            <input type="text" placeholder="Options (comma separated, e.g. 4GB, 8GB)" className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" value={Array.isArray(filter.options) ? filter.options.join(', ') : filter.options} onChange={(e) => {
                                                const newFilters = [...categoryFormData.filters];
                                                newFilters[index].options = e.target.value.split(',').map(opt => opt.trim());
                                                setCategoryFormData({ ...categoryFormData, filters: newFilters });
                                            }} />
                                            <button type="button" onClick={() => {
                                                const newFilters = categoryFormData.filters.filter((_, i) => i !== index);
                                                setCategoryFormData({ ...categoryFormData, filters: newFilters });
                                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
                                        </div>
                                    ))}
                                    {categoryFormData.filters.length === 0 && <p className="text-xs text-gray-400 italic">No custom filters added yet.</p>}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="isCatActive" className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" checked={categoryFormData.isActive} onChange={e => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })} />
                                    <label htmlFor="isCatActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="displayOnHomepage" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={categoryFormData.displayOnHomepage} onChange={e => setCategoryFormData({ ...categoryFormData, displayOnHomepage: e.target.checked })} />
                                    <label htmlFor="displayOnHomepage" className="text-sm font-bold text-gray-700 cursor-pointer">Show on Home</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="featured" className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer" checked={categoryFormData.featured} onChange={e => setCategoryFormData({ ...categoryFormData, featured: e.target.checked })} />
                                    <label htmlFor="featured" className="text-sm font-bold text-gray-700 cursor-pointer">Featured</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="showInMegaMenu" className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={categoryFormData.showInMegaMenu} onChange={e => setCategoryFormData({ ...categoryFormData, showInMegaMenu: e.target.checked })} />
                                    <label htmlFor="showInMegaMenu" className="text-sm font-bold text-gray-700 cursor-pointer">Mega Menu</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="hideEmptyCategory" className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer" checked={categoryFormData.hideEmptyCategory} onChange={e => setCategoryFormData({ ...categoryFormData, hideEmptyCategory: e.target.checked })} />
                                    <label htmlFor="hideEmptyCategory" className="text-sm font-bold text-gray-700 cursor-pointer">Hide if Empty</label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-200 uppercase tracking-widest mt-4">
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Analytics Modal */}
            {isCategoryAnalyticsOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl p-8 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300 h-auto max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b pb-6">
                            <div>
                                <h3 className="text-3xl font-black text-gray-800">Category Analytics</h3>
                                <p className="text-sm font-bold text-purple-500">{categoryAnalyticsData?.categoryName || 'Loading...'}</p>
                            </div>
                            <button onClick={closeCategoryAnalytics} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all"><X size={24} /></button>
                        </div>

                        {loadingCategoryAnalytics ? (
                            <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-purple-600" /></div>
                        ) : categoryAnalyticsData ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex items-center gap-4">
                                        <div className="bg-purple-100 p-4 rounded-2xl text-purple-600"><Package size={28} /></div>
                                        <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-transparent">Total Products</p><p className="text-3xl font-black text-gray-800">{categoryAnalyticsData.totalProducts}</p></div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex items-center gap-4">
                                        <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><ShoppingBag size={28} /></div>
                                        <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-transparent">Total Sales</p><p className="text-3xl font-black text-gray-800">{categoryAnalyticsData.totalSales}</p></div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 flex items-center gap-4">
                                        <div className="bg-green-100 p-4 rounded-2xl text-green-600"><DollarSign size={28} /></div>
                                        <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-transparent">Revenue</p><p className="text-3xl font-black text-gray-800">₹{(categoryAnalyticsData?.revenue || 0).toLocaleString()}</p></div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 flex items-center gap-4">
                                        <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><Star size={28} /></div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-transparent">Top Product</p>
                                            <p className="text-lg font-black text-gray-800 truncate" title={categoryAnalyticsData.topProduct?.name}>{categoryAnalyticsData.topProduct?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-10">No data available.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ... other modals (omitted for brevity but kept in original) ... */}
            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b pb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-wider">Order Details</h3>
                                <p className="text-xs font-mono text-gray-400">ID: {selectedOrder._id}</p>
                            </div>
                            <button onClick={closeOrderModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all"><X size={24} /></button>
                        </div>
                        {/* Order Modal Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-6 rounded-3xl">
                                <h4 className="font-black text-gray-400 text-xs uppercase tracking-widest mb-4">Customer</h4>
                                <p className="font-bold text-gray-800">{selectedOrder.shippingAddress?.name || (selectedOrder.user ? selectedOrder.user.name : 'Guest')}</p>
                                <p className="text-sm text-gray-500">{selectedOrder.shippingAddress?.email || (selectedOrder.user ? selectedOrder.user.email : 'N/A')}</p>
                                <p className="text-sm text-gray-500">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl">
                                <h4 className="font-black text-gray-400 text-xs uppercase tracking-widest mb-4">Shipping</h4>
                                <p className="text-sm text-gray-800 font-bold">{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{selectedOrder.shippingAddress?.city || ''}, {selectedOrder.shippingAddress?.postalCode || ''}</p>
                                <p className="text-sm text-gray-500">{selectedOrder.shippingAddress?.country || ''}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden mb-8">
                            <div className="p-6 bg-gray-50 border-b border-gray-100"><h4 className="font-black text-gray-400 text-xs uppercase tracking-widest">Items</h4></div>
                            <div className="divide-y divide-gray-50">
                                {(selectedOrder.orderItems || []).map((item, index) => (
                                    <div key={index} className="flex items-center gap-6 p-6">
                                        <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="w-16 h-16 object-cover rounded-2xl shadow-sm" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Qty: {item.qty || 1} x ₹{item.price}</p>
                                        </div>
                                        <div className="font-black text-gray-900 text-lg">₹{(item.qty || 1) * item.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-3xl flex flex-col gap-4">
                            <div className="flex justify-between items-center text-blue-800 text-sm font-bold">
                                <span>Subtotal:</span>
                                <span>₹{selectedOrder.itemsPrice || (selectedOrder.totalPrice - (selectedOrder.shippingPrice || 0) + (selectedOrder.discountAmount || 0))}</span>
                            </div>
                            <div className="flex justify-between items-center text-blue-800 text-sm font-bold">
                                <span>Shipping:</span>
                                <span>₹{selectedOrder.shippingPrice || 0}</span>
                            </div>
                            {selectedOrder.discountAmount > 0 ? (
                                <div className="flex justify-between items-center text-green-600 text-sm font-bold">
                                    <span>Discount {selectedOrder.couponInfo?.code ? `(${selectedOrder.couponInfo.code})` : ''}:</span>
                                    <span>-₹{selectedOrder.discountAmount}</span>
                                </div>
                            ) : null}
                            <div className="pt-4 border-t border-blue-200 flex justify-between items-center">
                                <span className="text-blue-900 font-black uppercase tracking-widest text-sm">Grand Total</span>
                                <span className="text-4xl font-black text-blue-600">₹{selectedOrder.totalPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Invoice Modal Placeholder */}
            {isInvoiceModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 overscroll-none">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300 scrollbar-hide">
                        <div className="flex justify-between items-center mb-10 no-print">
                            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-wider">Invoice Generation</h3>
                            <div className="flex gap-4">
                                <button onClick={printInvoice} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Print</button>
                                <button onClick={closeInvoiceModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all"><X size={24} /></button>
                            </div>
                        </div>
                        {/* Professional Invoice View */}
                        <div id="invoice-content" className="p-10 bg-white border border-gray-100 rounded-[2rem] shadow-sm relative overflow-hidden">
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-3">INVOICE</h1>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            Order ID: <span className="text-gray-600 font-black">{selectedOrder._id.toUpperCase()}</span>
                                        </p>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            Date: <span className="text-gray-600 font-black">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-2">
                                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                                            <ShoppingBag size={20} />
                                        </div>
                                        <span className="text-3xl font-black text-green-600 tracking-tight">ShopSphere</span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        <p>123 Tech Street, Silicon Valley</p>
                                        <p>admin@ecommerce.com</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-16 mb-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-gray-50">Bill To:</h4>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black text-gray-800">{selectedOrder.shippingAddress?.name || selectedOrder.user?.name || 'Customer'}</p>
                                        <p className="text-gray-500 font-medium">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                                        <p className="text-gray-500 font-medium">{selectedOrder.shippingAddress?.country || 'India'}</p>
                                        <p className="text-gray-500 font-medium">{selectedOrder.shippingAddress?.email || selectedOrder.user?.email}</p>
                                        <p className="text-gray-500 font-medium">{selectedOrder.shippingAddress?.phone}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-gray-50">Payment Details:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-400 uppercase">Method:</span>
                                            <span className="font-black text-gray-800">{selectedOrder.paymentMethod || 'Razorpay'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-400 uppercase">Status:</span>
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOrder.isPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-10">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-l-2xl">Item</th>
                                        <th className="text-center py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                                        <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                        <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-r-2xl">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(selectedOrder.orderItems || []).map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-6 px-6">
                                                <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">{item.name}</p>
                                            </td>
                                            <td className="py-6 px-6 text-center font-black text-gray-500">{item.qty || 1}</td>
                                            <td className="py-6 px-6 text-right font-black text-gray-500">₹{item.price}</td>
                                            <td className="py-6 px-6 text-right font-black text-gray-900">₹{(item.qty || 1) * item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Summary Section */}
                            <div className="flex justify-end gap-12">
                                <div className="w-72 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase">
                                        <span>Subtotal:</span>
                                        <span className="text-gray-900 font-black">₹{selectedOrder.itemsPrice || (selectedOrder.totalPrice - (selectedOrder.shippingPrice || 0) + (selectedOrder.discountAmount || 0))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase">
                                        <span>Shipping:</span>
                                        <span className="text-gray-900 font-black">₹{selectedOrder.shippingPrice || 0}</span>
                                    </div>
                                    {selectedOrder.discountAmount ? (
                                        <div className="flex justify-between items-center text-sm font-bold text-green-500 uppercase">
                                            <span>Discount {selectedOrder.couponInfo?.code ? `(${selectedOrder.couponInfo.code})` : ''}:</span>
                                            <span className="font-black">-₹{selectedOrder.discountAmount}</span>
                                        </div>
                                    ) : null}
                                    <div className="pt-6 border-t-2 border-gray-50 flex justify-between items-center">
                                        <span className="text-xl font-black text-gray-900 uppercase tracking-widest">Total:</span>
                                        <span className="text-4xl font-black text-green-600">₹{selectedOrder.totalPrice}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-16 pt-8 border-t border-dashed border-gray-100 text-center">
                                <p className="text-sm font-black text-gray-300 uppercase tracking-[0.2em]">Thank you for your business!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
