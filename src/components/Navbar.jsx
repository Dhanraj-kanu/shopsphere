import React from 'react';
import { ShoppingCart, Search, User, ShoppingBag } from 'lucide-react';

const Navbar = ({ searchValue, onSearchChange, onCartClick, user, onAdminClick, onProfileClick, onLoginClick, cartCount }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-40 border-b border-gray-100 h-16 md:h-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-4">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                    <img src="/ShopSphere.jpeg" alt="ShopSphere" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain" />
                    <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-700 hidden sm:block">
                        ShopSphere
                    </h1>
                </div>

                {/* Search Bar - Hidden on mobile, handled by BottomNav */}
                <div className="hidden md:flex flex-1 max-w-lg mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search products, brands and more..."
                        className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-green-200 focus:ring-4 focus:ring-green-100 rounded-2xl py-3 pl-12 pr-4 transition-all outline-none text-sm font-medium"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {user?.isAdmin && (
                        <button onClick={onAdminClick} className="hidden md:flex flex-col items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors" title="Admin Dashboard">
                            <span className="font-bold text-xs">Admin</span>
                        </button>
                    )}

                    <button onClick={user ? onProfileClick : onLoginClick} className="hidden md:flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors text-gray-700">
                        <User size={20} />
                        <span className="text-sm font-medium">{user ? user.name.split(' ')[0] : 'Login'}</span>
                    </button>

                    <button
                        onClick={onCartClick}
                        className="relative p-3 hover:bg-green-50 rounded-xl text-gray-600 hover:text-green-600 transition-colors group"
                    >
                        <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
