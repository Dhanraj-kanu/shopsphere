import React from 'react';
import { Home, Search, Grid, ShoppingCart, User } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange, onCartClick, user, cartCount }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'categories', icon: Grid, label: 'Categories' },
        { id: 'cart', icon: ShoppingCart, label: 'Cart', isAction: true }, // Action button
        { id: 'profile', icon: User, label: user ? 'Profile' : 'Login' },
    ];

    if (user?.isAdmin) {
        navItems.push({ id: 'admin', icon: User, label: 'Admin' });
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 z-40 flex justify-between items-center pb-safe">
            {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                if (item.id === 'admin' && !user?.isAdmin) return null;

                return (
                    <button
                        key={item.id}
                        onClick={() => item.isAction ? onCartClick() : onTabChange(item.id)}
                        className={`flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all ${isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="relative">
                            <Icon size={24} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
                            {item.id === 'cart' && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;
