import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Chatbot from './components/Chatbot';
import CategoryFilter from './components/CategoryFilter';
import BottomNav from './components/BottomNav';
import CartSidebar from './components/CartSidebar';
import axios from 'axios';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import UserProfile from './pages/User/Profile';
import AdminDashboard from './pages/Admin/Dashboard';
import ProductDetails from './components/ProductDetails';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

// Promotional Banners
const Banners = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white flex flex-col justify-center min-h-[160px] relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm mb-2 inline-block">New Arrival</span>
                <h3 className="text-2xl font-bold mb-1">Summer Collection</h3>
                <p className="text-white/80 text-sm mb-3">Up to 50% off on latest brands</p>
                <button className="bg-white text-purple-600 px-4 py-2 rounded-xl text-sm font-bold w-fit hover:bg-gray-100 transition-colors">Shop Now</button>
            </div>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 text-white flex flex-col justify-center min-h-[160px] relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm mb-2 inline-block">Limited Time</span>
                <h3 className="text-2xl font-bold mb-1">Flash Sale</h3>
                <p className="text-white/80 text-sm mb-3">Get extra 20% cashback today</p>
                <button className="bg-white text-orange-500 px-4 py-2 rounded-xl text-sm font-bold w-fit hover:bg-gray-100 transition-colors">View Deals</button>
            </div>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        </div>
    </div>
);

function App() {
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const [activeView, setActiveView] = useState("home"); // home, search, categories, profile, login, signup, admin, forgot-password, reset-password
    const [resetToken, setResetToken] = useState("");
    const { user, loading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        axios.get('/api/products')
            .then(response => setProducts(response.data))
            .catch(error => console.error('Error fetching products:', error));

        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        if (existItem) {
            setCartItems(cartItems.map((x) => x._id === product._id ? { ...existItem, qty: existItem.qty + 1 } : x));
        } else {
            setCartItems([...cartItems, { ...product, qty: 1 }]);
        }
        setCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x._id !== id));
    };

    const updateCartQty = (id, qty) => {
        setCartItems(cartItems.map((x) => x._id === id ? { ...x, qty: Math.max(1, qty) } : x));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Handle View Switching
    const renderView = () => {
        switch (activeView) {
            case 'search':
                return (
                    <div className="p-4">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Search</h2>
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 text-lg focus:ring-2 focus:ring-green-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {searchQuery && (
                            <ProductList
                                products={filteredProducts}
                                onAddToCart={addToCart}
                                onProductClick={(product) => {
                                    setSelectedProduct(product);
                                    setActiveView('product-details');
                                }}
                            />
                        )}
                    </div>
                );
            case 'categories':
                const categories = ["All", ...new Set(products.map(p => p.category))];
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveCategory(cat); setActiveView('home'); }}
                                    className={`p-6 rounded-2xl text-left font-bold text-lg transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg scale-[1.02]' : 'bg-white border border-gray-100 text-gray-700 hover:border-green-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'profile':
                if (!user) return <Login switchToSignup={() => setActiveView('signup')} onSuccess={() => setActiveView('profile')} />;
                return <UserProfile />;
            case 'login':
                return <Login switchToSignup={() => setActiveView('signup')} onSuccess={() => setActiveView('home')} onForgot={() => setActiveView('forgot-password')} />;
            case 'signup':
                return <Signup switchToLogin={() => setActiveView('login')} onSuccess={() => setActiveView('home')} />;
            case 'forgot-password':
                return <ForgotPassword
                    onBack={() => setActiveView('login')}
                    onTokenReceived={() => { }} // User copies token manually
                    switchToReset={(token) => {
                        // Pass token to reset view
                        // We need a way to pass state, for now we can use a hack or just let them paste it
                        // Better to use state in App.jsx but let's stick to simple prop passing if possible or just manual entry
                        // Actually, I can set a temporary state for the token
                        setResetToken(token);
                        setActiveView('reset-password');
                    }}
                />;
            case 'reset-password':
                return <ResetPassword
                    token={resetToken}
                    onBack={() => setActiveView('login')}
                    onSuccess={() => setActiveView('login')}
                />;
            case 'admin':
                return (
                    <ErrorBoundary>
                        <AdminDashboard />
                    </ErrorBoundary>
                );
            case 'product-details':
                return (
                    <ProductDetails
                        product={selectedProduct}
                        products={products}
                        onBack={() => setActiveView('home')}
                        onAddToCart={addToCart}
                        onProductClick={(product) => {
                            setSelectedProduct(product);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setActiveView('reloading');
                            setTimeout(() => setActiveView('product-details'), 10);
                        }}
                    />
                );
            case 'reloading':
                return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin"></div></div>;
            case 'home':
            default:
                return (
                    <>
                        <Banners />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">New Arrivals</h2>
                            <CategoryFilter
                                categories={["All", ...new Set(products.map(p => p.category))]}
                                activeCategory={activeCategory}
                                onSelectCategory={setActiveCategory}
                            />
                        </div>
                        <ProductList
                            products={filteredProducts}
                            onAddToCart={addToCart}
                            onProductClick={(product) => {
                                setSelectedProduct(product);
                                setActiveView('product-details');
                            }}
                        />
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 font-sans selection:bg-green-100 selection:text-green-800">
            <Navbar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onCartClick={() => setCartOpen(true)}
                user={user}
                onAdminClick={() => setActiveView('admin')}
                onProfileClick={() => setActiveView('profile')}
                onLoginClick={() => setActiveView('login')}
                cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-28">
                {renderView()}
            </main>

            <BottomNav
                activeTab={activeView}
                onTabChange={setActiveView}
                onCartClick={() => setCartOpen(true)}
                user={user}
                cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
            />

            <CartSidebar
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cartItems={cartItems}
                onRemove={removeFromCart}
                onUpdateQty={updateCartQty}
                onClear={clearCart}
                user={user}
                onLogin={() => { setCartOpen(false); setActiveView('login'); }}
            />

            <Chatbot productContext={products} />
        </div>
    );
}

export default App;
