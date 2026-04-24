// State management
let currentPage = 'home';
let cart = [];
let searchHistory = [];
let wishlist = [];
let selectedProduct = null;
let selectedColor = null;
let selectedSize = null;
let deliveryOption = 'standard';
let searchTerm = '';
let appliedCoupon = null; // { code, discount, type }
let selectedCategory = 'All';

// Real-time update interval (in milliseconds)
const UPDATE_INTERVAL = 5000;

// DOM Elements
const app = document.getElementById('app');

function getCustomerNotifications() {
    const notifications = localStorage.getItem('customer_notifications');
    return notifications ? JSON.parse(notifications) : [];
}


// Router
function navigate(page, data = null) {
    // Stop real-time updates when leaving profile page
    if (currentPage === 'profile') {
        stopRealTimeUpdates();
    }

    // Add animation class
    app.classList.add('fade-out');

    setTimeout(() => {
        currentPage = page;
        if (data) {
            selectedProduct = data;
            selectedColor = data.colors[0];
            selectedSize = data.sizes ? data.sizes[0] : null;
        }
        renderApp();
        app.classList.remove('fade-out');
    }, 150);
}

// Render Functions
function renderApp() {
    switch (currentPage) {
        case 'home':
            renderHome();
            break;
        case 'search':
            renderSearch();
            break;
        case 'cart':
            renderCart();
            break;
        case 'profile':
            if (!authState.isAuthenticated) {
                navigate('login');
                return;
            }
            renderProfile();
            break;
        case 'notifications':
            renderNotifications();
            break;
        case 'login':
            app.innerHTML = renderLogin();
            setTimeout(() => { if (window.initGoogleButton) window.initGoogleButton(); }, 100);
            break;
        case 'signup':
            app.innerHTML = renderSignup();
            setTimeout(() => { if (window.initGoogleButton) window.initGoogleButton(); }, 100);
            break;
        case 'product':
            renderProductDetail();
            break;
        case 'wishlist':
            renderWishlist();
            break;
        case 'delivery':
            renderDelivery();
            break;
        default:
            renderHome();
    }
    renderBottomNav();
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function renderNotifications() {
    const dynamicNotifications = getCustomerNotifications();
    const allNotifications = [...dynamicNotifications, ...notifications].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    const unreadCount = allNotifications.filter(n => !n.isRead).length;

    app.innerHTML = `
        <div class="min-h-screen bg-gray-200">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-gray-600"></i>
                    </button>
                    <h1 class="text-xl font-bold">Notifications</h1>
                    ${unreadCount > 0
            ? `
                        <button onclick="markAllAsRead()" class="text-green-600 text-sm font-medium">
                            Mark all as read
                        </button>
                    `
            : ''
        }
                </div>
            </div>

            <!-- Notification List -->
            <div class="divide-y divide-gray-200">
                ${allNotifications.length > 0
            ? allNotifications
                .map(
                    notification => `
                    <div class="p-4 bg-gray-100 ${!notification.isRead ? 'bg-gray-300' : ''
                        } transition-colors duration-200">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                     style="background-color: ${getNotificationColor(
                            notification.color
                        )}">
                                    <i class="fas ${notification.icon}"></i>
                                </div>
                            </div>
                            <div class="ml-4 flex-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-semibold text-gray-900">
                                        ${notification.title}
                                    </h3>
                                    <p class="text-xs text-gray-500">
                                        ${formatTimestamp(
                            notification.timestamp
                        )}
                                    </p>
                                </div>
                                <p class="mt-1 text-sm text-gray-600">
                                    ${notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                `
                )
                .join('')
            : `
                    <div class="flex flex-col items-center justify-center p-8">
                        <i class="fas fa-bell-slash text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No notifications yet</p>
                    </div>
                `
        }
            </div>
        </div>
    `;
}

function getNotificationColor(color) {
    const colors = {
        green: '#4CAF50',
        orange: '#FF9800',
        blue: '#2196F3',
        purple: '#9C27B0',
        red: '#F44336'
    };
    return colors[color] || colors.blue;
}

function markAllAsRead() {
    const dynamic = getCustomerNotifications().map(n => ({ ...n, isRead: true }));
    localStorage.setItem('customer_notifications', JSON.stringify(dynamic));
    notifications.forEach(notification => {
        notification.isRead = true;
    });
    renderNotifications();
    showToast('All notifications marked as read');
}

function renderHome() {
    app.innerHTML = `
        <div class="pb-16">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <h1 class="text-xl font-bold flex-1">Home</h1>
                    <div class="flex items-center gap-4">
                        <button onclick="navigate('wishlist')" class="relative">
                            <i class="fas fa-heart text-gray-600"></i>
                            ${wishlist.length > 0
            ? `
                                <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            `
            : ''
        }
                        </button>
                        <button onclick="navigate('notifications')" class="relative">
                            <i class="fas fa-bell text-gray-600"></i>
                            ${notifications.some(n => !n.isRead)
            ? `
                                <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            `
            : ''
        }
                        </button>
                        <button onclick="navigate('cart')" class="relative">
                            <i class="fas fa-shopping-cart text-gray-600"></i>
                            ${cart.length > 0
            ? `
                                <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            `
            : ''
        }
                        </button>
                    </div>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="p-4">
                <div class="relative" onclick="navigate('search')">
                    <input type="text" 
                           placeholder="Search products..." 
                           class="w-full p-3 rounded-lg bg-gray-100 shadow-md focus:outline-none"
                           readonly>
                    <span class="absolute right-4 top-3">
                        <i class="fas fa-search text-gray-400"></i>
                    </span>
                </div>
            </div>

            <!-- Promotions Carousel -->
            <div class="px-4 mb-6">
                <div class="overflow-x-auto scroll-smooth flex space-x-4 pb-4">
                    ${promotions
            .map(
                promo => `
                        <div class="flex-shrink-0 w-80 bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                            <h3 class="text-xl font-bold mb-2">${promo.title}</h3>
                            <p class="text-2xl font-bold mb-2">${promo.discount}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm">Use code: ${promo.code}</span>
                                <button class="bg-gray-100 text-green-500 px-4 py-1 rounded-full text-sm font-bold">
                                    Copy
                                </button>
                            </div>
                        </div>
                    `
            )
            .join('')}
                </div>
            </div>

            <!-- Categories -->
            <div id="categories-section" class="px-4 mb-6">
                <div class="flex overflow-x-auto scroll-smooth space-x-4 pb-2">
                    ${categories
            .map(
                category => `
                        <button 
                            class="ripple flex-shrink-0 px-6 py-2 rounded-full ${selectedCategory === category
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 shadow'
                    } whitespace-nowrap"
                            onclick="setCategory('${category}')"
                        >
                            ${category}
                        </button>
                    `
            )
            .join('')}
                </div>
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-2 gap-4 px-4">
                ${products
            .filter(
                product =>
                    selectedCategory === 'All' ||
                    product.category === selectedCategory
            )
            .map(
                product => `
                    <div class="product-card bg-gray-100 rounded-lg shadow-md overflow-hidden" 
                         onclick="navigate('product', ${JSON.stringify(
                    product
                )})">
                        <div class="relative">
                            <img src="${getValidImage(product.image)}" 
                                 alt="${product.name}" 
                                 class="w-full h-40 object-contain p-4"
                                 onerror="handleImageError(this)">
                            <button onclick="event.stopPropagation(); toggleWishlist(${product.id
                    })" 
                                    class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-100 shadow-md flex items-center justify-center">
                                <i class="fas fa-heart ${wishlist.includes(product.id)
                        ? 'text-red-500'
                        : 'text-gray-300'
                    }"></i>
                            </button>
                            <button onclick="event.stopPropagation(); quickView(${product.id
                    })" 
                                    class="absolute top-2 left-2 w-8 h-8 rounded-full bg-gray-100 shadow-md flex items-center justify-center">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="${product.stock > 0 ? 'text-green-500' : 'text-red-500'} font-medium">
                                    ${product.stock > 0
                        ? 'In Stock'
                        : 'Out of Stock'
                    }
                                </span>
                                <div class="flex items-center">
                                    <span class="mr-1">${product.rating}</span>
                                    <i class="fas fa-star text-yellow-400"></i>
                                </div>
                            </div>
                            <h3 class="font-medium mb-1 truncate">${product.name
                    }</h3>
                            <div class="flex justify-between items-center">
                                <div class="text-xl font-bold">₹${product.price
                    }</div>
                                <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                                        class="ripple ${product.stock > 0 ? 'bg-green-500' : 'bg-gray-400 cursor-not-allowed'} text-white px-4 py-2 rounded-lg flex items-center"
                                        ${product.stock > 0 ? '' : 'disabled'}>
                                    <i class="fas fa-cart-plus mr-2"></i>
                                    ${product.stock > 0 ? 'Add' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                `
            )
            .join('')}
            </div>
        </div>

        ${renderBottomNav()}
    `;
}

function renderProductDetail() {
    if (!selectedProduct) return navigate('home');

    app.innerHTML = `
        <div class="pb-16">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">${selectedProduct.name}</h1>
                    <button onclick="shareProduct(${selectedProduct.id
        })" class="ml-4">
                        <i class="fas fa-share-alt text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Product Images -->
            <div class="bg-gray-100 mb-4">
                <div class="relative">
                    <img src="${getValidImage(selectedProduct.image)}" 
                         alt="${selectedProduct.name}" 
                         class="w-full h-72 object-contain p-4"
                         onerror="handleImageError(this)">
                    <button onclick="toggleWishlist(${selectedProduct.id})" 
                            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 shadow-lg flex items-center justify-center">
                        <i class="fas fa-heart ${wishlist.includes(selectedProduct.id)
            ? 'text-red-500'
            : 'text-gray-300'
        } text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Product Info -->
            <div class="bg-gray-100 p-4 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">${selectedProduct.name
        }</h2>
                        <div class="flex items-center">
                            <div class="flex items-center mr-4">
                                <span class="text-xl font-bold mr-2">${selectedProduct.rating
        }</span>
                                <i class="fas fa-star text-yellow-400"></i>
                            </div>
                            <span class="text-gray-500">${selectedProduct.reviews.length
        } reviews</span>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-green-500">₹${selectedProduct.price
        }</div>
                </div>

                <!-- Color Selection -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Select Color</h3>
                    <div class="flex space-x-3">
                        ${selectedProduct.colors
            .map(
                color => `
                            <button onclick="selectColor('${color}')" 
                                    class="w-12 h-12 rounded-full border-2 flex items-center justify-center ${selectedColor === color
                        ? 'border-green-500'
                        : 'border-gray-200'
                    }">
                                <div class="w-8 h-8 rounded-full" 
                                     style="background-color: ${color.toLowerCase()}"></div>
                            </button>
                        `
            )
            .join('')}
                    </div>
                </div>

                <!-- Size Selection (if applicable) -->
                ${selectedProduct.sizes
            ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">Select Size</h3>
                        <div class="flex flex-wrap gap-3">
                            ${selectedProduct.sizes
                .map(
                    size => `
                                <button onclick="selectSize('${size}')"
                                        class="w-14 h-14 rounded-lg border-2 flex items-center justify-center ${selectedSize === size
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }">
                                    ${size}
                                </button>
                            `
                )
                .join('')}
                        </div>
                    </div>
                `
            : ''
        }

                <!-- Quantity Picker -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Quantity</h3>
                    <div class="flex items-center space-x-4">
                        <button onclick="updateQuantity(selectedProduct.id, Math.max(1, (selectedProduct.quantity || 1) - 1))"
                                class="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="text-xl font-semibold">${selectedProduct.quantity || 1
        }</span>
                        <button onclick="updateQuantity(selectedProduct.id, (selectedProduct.quantity || 1) + 1)"
                                class="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <!-- Product Description -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Description</h3>
                    <p class="text-gray-600">${selectedProduct.description}</p>
                </div>

                <!-- Specifications -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Specifications</h3>
                    <ul class="space-y-2">
                        ${selectedProduct.specs
            .map(
                spec => `
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                ${spec}
                            </li>
                        `
            )
            .join('')}
                    </ul>
                </div>

                <!-- Action Buttons -->
                <div class="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg flex space-x-4">
                    <button onclick="addToCart(selectedProduct.id)" 
                            class="flex-1 ${selectedProduct.stock > 0 ? 'bg-green-500' : 'bg-gray-400 cursor-not-allowed'} text-white py-3 rounded-lg font-semibold flex items-center justify-center"
                            ${selectedProduct.stock > 0 ? '' : 'disabled'}>
                        <i class="fas fa-cart-plus mr-2"></i>
                        ${selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button onclick="buyNow(selectedProduct.id)"
                            class="flex-1 ${selectedProduct.stock > 0 ? 'bg-black' : 'bg-gray-400 cursor-not-allowed'} text-white py-3 rounded-lg font-semibold"
                            ${selectedProduct.stock > 0 ? '' : 'disabled'}>
                        ${selectedProduct.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const quickViewHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-gray-100 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div class="p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">${product.name}</h3>
                        <button onclick="closeQuickView()" class="text-gray-500">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <img src="${getValidImage(product.image)}" alt="${product.name}" 
                         class="w-full h-64 object-contain mb-4"
                         onerror="handleImageError(this)">
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-2xl font-bold">₹${product.price}</div>
                        <div class="flex items-center">
                            <span class="mr-1">${product.rating}</span>
                            <i class="fas fa-star text-yellow-400"></i>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-4">${product.description}</p>
                    <div class="flex space-x-4">
                        <button onclick="addToCart(${product.id}); closeQuickView()" 
                                class="flex-1 ${product.stock > 0 ? 'bg-green-500' : 'bg-gray-400 cursor-not-allowed'} text-white py-3 rounded-lg font-semibold flex items-center justify-center"
                                ${product.stock > 0 ? '' : 'disabled'}>
                            <i class="fas fa-cart-plus mr-2"></i>
                            ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button onclick="navigate('product', ${JSON.stringify(
        product
    )}); closeQuickView()" 
                                class="flex-1 bg-black text-white py-3 rounded-lg font-semibold">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const quickViewElement = document.createElement('div');
    quickViewElement.id = 'quickView';
    quickViewElement.innerHTML = quickViewHtml;
    document.body.appendChild(quickViewElement);
}

function closeQuickView() {
    const quickView = document.getElementById('quickView');
    if (quickView) {
        quickView.remove();
    }
}

function renderWishlist() {
    app.innerHTML = `
        <div class="pb-16">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">Wishlist</h1>
                </div>
            </div>

            ${wishlist.length === 0
            ? `
                <div class="flex flex-col items-center justify-center p-8">
                    <i class="fas fa-heart text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Your wishlist is empty</p>
                    <button onclick="navigate('home')" 
                            class="mt-4 text-green-500 font-semibold">
                        Continue Shopping
                    </button>
                </div>
            `
            : `
                <div class="grid grid-cols-2 gap-4 p-4">
                    ${products
                .filter(p => wishlist.includes(p.id))
                .map(
                    product => `
                        <div class="product-card bg-gray-100 rounded-lg shadow-md overflow-hidden" 
                             onclick="navigate('product', ${JSON.stringify(
                        product
                    )})">
                            <div class="relative">
                                <img src="${product.image}" 
                                     alt="${product.name}" 
                                     class="w-full h-40 object-contain p-4">
                                <button onclick="event.stopPropagation(); toggleWishlist(${product.id
                        })" 
                                        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-100 shadow-md flex items-center justify-center">
                                    <i class="fas fa-heart text-red-500"></i>
                                </button>
                            </div>
                            <div class="p-4">
                                <h3 class="font-medium mb-1 truncate">${product.name
                        }</h3>
                                <div class="text-xl font-bold">₹${product.price
                        }</div>
                            </div>
                        </div>
                    `
                )
                .join('')}
                </div>
            `
        }
        </div>

        ${renderBottomNav()}
    `;
}

function renderBottomNav() {
    const navPage = typeof currentPage !== 'undefined' ? currentPage : 'home';
    return `
        <div class="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 pb-safe-area">
            <div class="flex justify-around items-center py-3">
                <button onclick="navigate('home')" 
                    class="flex flex-col items-center ${navPage === 'home' ? 'text-green-600' : 'text-gray-600'}">
                    <i class="fas fa-home text-xl mb-1"></i>
                    <span class="text-xs">Home</span>
                </button>
                <button onclick="navigate('search')"
                    class="flex flex-col items-center ${navPage === 'search' ? 'text-green-600' : 'text-gray-600'}">
                    <i class="fas fa-search text-xl mb-1"></i>
                    <span class="text-xs">Search</span>
                </button>
                <button onclick="toggleCategoryPopup()"
                    class="flex flex-col items-center ${navPage === 'categories' ? 'text-green-600' : 'text-gray-600'}">
                    <i class="fas fa-th-large text-xl mb-1"></i>
                    <span class="text-xs">Categories</span>
                </button>
                <button onclick="navigate('cart')"
                    class="flex flex-col items-center ${navPage === 'cart' ? 'text-green-600' : 'text-gray-600'}">
                    <div class="relative">
                        <i class="fas fa-shopping-cart text-xl mb-1"></i>
                        ${cart.length > 0 ? `
                            <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                ${cart.length}
                            </span>
                        ` : ''}
                    </div>
                    <span class="text-xs">Cart</span>
                </button>
                <button onclick="navigate('profile')"
                    class="flex flex-col items-center ${navPage === 'profile' ? 'text-green-600' : 'text-gray-600'}">
                    <i class="fas fa-user text-xl mb-1"></i>
                    <span class="text-xs">Profile</span>
                </button>
            </div>
        </div>
    `;
}

function toggleCategoryPopup() {
    let overlay = document.getElementById('category-popup-overlay');
    let popup = document.getElementById('category-popup');

    if (!popup) {
        // Create popup if it doesn't exist
        const popupHtml = `
            <div id="category-popup-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden transition-opacity duration-300" onclick="toggleCategoryPopup()"></div>
            <div id="category-popup" class="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform translate-y-full transition-transform duration-300 shadow-[0_-5px_25px_rgba(0,0,0,0.1)] max-h-[70vh] overflow-y-auto">
                <div class="p-6">
                    <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
                    <h3 class="text-xl font-bold mb-6 text-center">Shop by Category</h3>
                    <div class="grid grid-cols-3 gap-4">
                        ${categories.map(cat => {
            // Map categories to icons
            let icon = 'fa-box';
            if (cat === 'Electronics') icon = 'fa-tv';
            if (cat === 'Fashion') icon = 'fa-tshirt';
            if (cat === 'Home') icon = 'fa-couch';
            if (cat === 'Beauty') icon = 'fa-tags'; // fa-sparkles not free
            if (cat === 'Sports') icon = 'fa-running';
            if (cat === 'Books') icon = 'fa-book';
            if (cat === 'Toys') icon = 'fa-gamepad';

            return `
                                <button onclick="setCategory('${cat}'); toggleCategoryPopup(); navigate('home');" 
                                        class="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-green-50 active:bg-green-100 transition-colors">
                                    <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-green-600">
                                        <i class="fas ${icon} text-lg"></i>
                                    </div>
                                    <span class="text-xs font-semibold text-center text-gray-700">${cat}</span>
                                </button>
                            `;
        }).join('')}
                    </div>
                    <button onclick="toggleCategoryPopup()" class="w-full mt-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">
                        Close
                    </button>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = popupHtml;
        document.body.appendChild(div);

        // Re-select elements
        overlay = document.getElementById('category-popup-overlay');
        popup = document.getElementById('category-popup');

        // Force reflow
        void popup.offsetWidth;
    }

    // Toggle visibility
    if (popup.classList.contains('translate-y-full')) {
        // Open
        overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        popup.classList.remove('translate-y-full');
    } else {
        // Close
        overlay.classList.add('opacity-0');
        popup.classList.add('translate-y-full');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function renderProfile() {
    if (!authState.isAuthenticated) {
        navigate('login');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(order => order.userId === authState.currentUser.id);
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const userWishlist = wishlist.filter(item => item.userId === authState.currentUser.id);

    app.innerHTML = `
        <div class="min-h-screen bg-gray-200 pb-20">
            <div class="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <h1 class="text-xl font-bold flex-1">My Profile</h1>
                    <button onclick="logout()" class="text-gray-600">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>

            <div class="p-4 space-y-4 mb-24">
                <!-- User Info Card -->
                ${renderUserInfo(userOrders, userWishlist)}

                <!-- Recent Orders -->
                ${renderRecentOrders(userOrders)}

                <!-- Saved Addresses -->
                ${renderSavedAddresses()}
            </div>

            <!-- Bottom Navigation -->
            ${renderBottomNav()}
        </div>
    `;

    // Start real-time updates when profile is rendered
    startRealTimeUpdates();
}

function updateProfileStats() {
    if (authState.isAuthenticated && currentPage === 'profile') {
        renderProfile();
    }
}

// Start real-time updates
let statsUpdateInterval;

function startRealTimeUpdates() {
    updateProfileStats(); // Initial update
    statsUpdateInterval = setInterval(updateProfileStats, UPDATE_INTERVAL);
}

function stopRealTimeUpdates() {
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
    }
}

function renderRecentOrders(userOrders) {
    return `
        <div class="bg-gray-100 rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Recent Orders</h3>
            ${userOrders.length > 0 ? `
                <div class="space-y-4">
                    ${userOrders.slice(0, 5).map(order => `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">${order.orderId}</span>
                                <span class="badge bg-${getOrderStatusColor(order.status)} text-white px-2 py-1 rounded-full text-sm">
                                    ${order.status.toUpperCase()}
                                </span>
                            </div>
                            <div class="text-sm text-gray-600">
                                <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                                <p>Items: ${order.items.length}</p>
                                <p>Total: ₹${order.payment.total.toFixed(2)}</p>
                            </div>
                            <button onclick="viewOrderDetails('${order.orderId}')" 
                                class="mt-2 text-green-600 hover:text-green-700 text-sm font-medium">
                                View Details
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="viewAllOrders()" class="mt-4 text-green-600 hover:text-green-700 font-medium">
                    View All Orders
                </button>
            ` : `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-shopping-bag text-4xl mb-2"></i>
                    <p>No orders yet</p>
                    <button onclick="navigate('home')" class="mt-2 text-green-600 hover:text-green-700 font-medium">
                        Start Shopping
                    </button>
                </div>
            `}
        </div>
    `;
}

function getOrderStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'yellow-500';
        case 'processing':
            return 'blue-500';
        case 'shipped':
            return 'purple-500';
        case 'delivered':
            return 'green-500';
        case 'cancelled':
            return 'red-500';
        default:
            return 'gray-500';
    }
}

function renderSavedAddresses() {
    return `
        <div class="bg-gray-100 rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Saved Addresses</h3>
                <button onclick="addNewAddress()" class="text-green-600 hover:text-green-700">
                    <i class="fas fa-plus mr-1"></i> Add New
                </button>
            </div>
            ${(authState.currentUser.addresses || []).length > 0 ? `
                <div class="space-y-4">
                    ${(authState.currentUser.addresses || []).map((address, index) => `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-medium">${address.type || 'Address'} ${index + 1}</h4>
                                    <p class="text-sm text-gray-600 mt-1">${address.street}</p>
                                    <p class="text-sm text-gray-600">${address.city}, ${address.state} ${address.postalCode}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="editAddress(${index})" class="text-blue-600 hover:text-blue-700">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteAddress(${index})" class="text-red-600 hover:text-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-map-marker-alt text-4xl mb-2"></i>
                    <p>No saved addresses</p>
                </div>
            `}
        </div>
    `;
}

function renderDelivery() {
    const subtotal = calculateSubtotal();
    const deliveryFee = deliveryOption === 'express' ? 50 : 0;
    const discount = appliedCoupon ? calculateCouponDiscount(subtotal, appliedCoupon) : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

    app.innerHTML = `
        <div class="min-h-screen pb-20">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10">
                <div class="flex items-center p-4">
                    <button onclick="navigate('cart')" class="mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">Delivery Details</h1>
                </div>
                <!-- Progress Steps -->
                <div class="flex justify-between px-8 py-4 border-t">
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <span class="text-xs text-green-500">Cart</span>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                        <div class="h-1 w-full bg-green-500"></div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <span class="text-xs text-green-500">Delivery</span>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                        <div class="h-1 w-full bg-gray-300"></div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center mb-1">
                            <i class="fas fa-check"></i>
                        </div>
                        <span class="text-xs text-gray-500">Complete</span>
                    </div>
                </div>
            </div>

            <!-- Delivery Form -->
            <form id="deliveryForm" class="p-4 space-y-6" onsubmit="event.preventDefault(); placeOrder();">
                <!-- Contact Information -->
                <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Contact Information</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                            <input type="text" id="fullName" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter your full name">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                            <input type="tel" id="phone" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter your phone number">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Email</label>
                            <input type="email" id="email" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter your email">
                        </div>
                    </div>
                </div>

                <!-- Delivery Address -->
                <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Delivery Address</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Street Address</label>
                            <input type="text" id="address" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter street address">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-medium mb-2">City</label>
                                <input type="text" id="city" required
                                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                       placeholder="Enter city">
                            </div>
                            <div>
                                <label class="block text-gray-700 text-sm font-medium mb-2">Postal Code</label>
                                <input type="text" id="postalCode" required
                                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                       placeholder="Enter postal code">
                            </div>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">State</label>
                            <input type="text" id="state" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter state">
                        </div>
                    </div>
                </div>

                <!-- Coupon / Promo Code -->
                <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Have a Coupon?</h2>
                    <div class="flex gap-3 items-center">
                        <input type="text" id="couponCode"
                               class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                               placeholder="Enter coupon code (e.g. SUMMER20)"
                               value="${appliedCoupon ? appliedCoupon.code : ''}">
                        <button type="button"
                                onclick="applyCoupon()"
                                class="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">
                            Apply
                        </button>
                    </div>
                    ${appliedCoupon
            ? `
                        <p class="mt-2 text-sm text-green-600">
                            Coupon <strong>${appliedCoupon.code}</strong> applied.
                        </p>
                    `
            : `
                        <p class="mt-2 text-xs text-gray-500">
                            Tip: You can use codes like <strong>SUMMER20</strong>, <strong>NEWUSER</strong> if available.
                        </p>
                    `
        }
                </div>

                <!-- Delivery Options -->
                <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Delivery Options</h2>
                    <div class="space-y-3">
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-200">
                            <input type="radio" name="deliveryOption" value="standard" 
                                   ${deliveryOption === 'standard'
            ? 'checked'
            : ''
        }
                                   onchange="updateDeliveryOption('standard')"
                                   class="w-4 h-4 text-green-500">
                            <div class="ml-3 flex-1">
                                <div class="font-medium">Standard Delivery</div>
                                <div class="text-sm text-gray-500">3-5 business days</div>
                            </div>
                            <div class="font-medium text-green-500">Free</div>
                        </label>
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-200">
                            <input type="radio" name="deliveryOption" value="express"
                                   ${deliveryOption === 'express'
            ? 'checked'
            : ''
        }
                                   onchange="updateDeliveryOption('express')"
                                   class="w-4 h-4 text-green-500">
                            <div class="ml-3 flex-1">
                                <div class="font-medium">Express Delivery</div>
                                <div class="text-sm text-gray-500">1-2 business days</div>
                            </div>
                            <div class="font-medium text-green-500">₹50</div>
                        </label>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="fixed bottom-0 left-0 right-0 bg-gray-100 border-t shadow-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-gray-600">Total Amount</div>
                        <div class="text-xl font-bold">₹${finalTotal}</div>
                    </div>
                    <div class="text-xs text-gray-500 mb-2">
                        Subtotal: ₹${subtotal} 
                        ${discount ? ` • Coupon: -₹${discount}` : ''} 
                        • Delivery: ₹${deliveryFee}
                    </div>
                    <button type="submit"
                            class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
                        <i class="fas fa-lock mr-2"></i>
                        Place Order
                    </button>
                </div>
            </form>
        </div>

        <!-- Success Modal -->
        <div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
            <div class="bg-gray-100 rounded-lg p-6 w-[90%] max-w-md">
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-3xl text-green-500 success-checkmark"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Order Placed Successfully!</h3>
                    <p class="text-gray-600 mb-6">Thank you for your order. We'll send you a confirmation email shortly.</p>
                    <button onclick="navigate('home')" 
                            class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    `;
}

function updateDeliveryOption(option) {
    deliveryOption = option;
    renderDelivery();
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    navigate('delivery');
}

function placeOrder() {
    const form = document.getElementById('deliveryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Check if cart is empty
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    // Collect form data
    const formData = {
        orderId: `ORD-${Date.now()}`,
        userId: authState.currentUser?.id,
        userName: authState.currentUser?.name,
        orderDate: new Date().toISOString(),
        status: 'pending',
        items: cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return {
                id: item.id,
                name: product ? product.name : 'Unknown Product',
                price: product ? product.price : 0,
                quantity: item.quantity,
                image: product ? product.image : '',
                subtotal: product ? product.price * item.quantity : 0
            };
        }),
        shipping: {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            postalCode: document.getElementById('postalCode').value,
            deliveryOption: deliveryOption
        },
        payment: {
            subtotal: calculateSubtotal(),
            shipping: deliveryOption === 'express' ? 50 : 0,
            discount: appliedCoupon ? calculateCouponDiscount(calculateSubtotal(), appliedCoupon) : 0,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            total: Math.max(
                0,
                calculateSubtotal() +
                (deliveryOption === 'express' ? 50 : 0) -
                (appliedCoupon ? calculateCouponDiscount(calculateSubtotal(), appliedCoupon) : 0)
            ),
            status: 'pending'
        }
    };

    // Initialize Razorpay payment
    if (typeof initializeRazorpayPayment === 'function') {
        initializeRazorpayPayment(formData);
    } else {
        // Fallback if Razorpay is not loaded
        console.error('Razorpay payment not available');
        showToast('Payment gateway not available. Please refresh the page.');
    }
}

let searchDebounceTimeout;

// Search Functions
function renderSearch() {
    const randomTags = getRandomTrendingTags();

    app.innerHTML = `
        <div class="min-h-screen bg-gray-200">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-gray-600"></i>
                    </button>
                    <div class="flex-1 relative">
                        <input type="text" 
                               id="searchInput"
                               placeholder="Search products..." 
                               class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                               oninput="handleSearchInput(this.value)"
                               value="${searchTerm || ''}"
                               autofocus>
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
            </div>

            <!-- Trending Tags -->
            <div class="p-4" id="search-initial-content" style="display: ${searchTerm ? 'none' : 'block'}">
                <div class="mb-4">
                    <h2 class="text-lg font-semibold mb-3">Trending Now</h2>
                    <div class="flex flex-wrap gap-2">
                        ${randomTags.map(tag => `
                            <button onclick="setSearchTerm('${tag.name}')"
                                    class="px-4 py-2 bg-gray-100 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-colors duration-200">
                                <i class="fas fa-trending-up text-green-500 mr-1"></i>
                                ${tag.name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Search History -->
                ${searchHistory.length > 0 ? `
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h2 class="text-lg font-semibold text-gray-800">Recent Searches</h2>
                            <button onclick="clearSearchHistory()" 
                                    class="text-sm text-green-600 hover:text-green-700">
                                Clear All
                            </button>
                        </div>
                        <div class="space-y-2">
                            ${searchHistory.map(term => `
                                <button onclick="setSearchTerm('${term}')"
                                        class="w-full p-3 bg-gray-100 rounded-lg flex items-center text-gray-700 hover:bg-gray-200">
                                    <i class="fas fa-history text-gray-400 mr-3"></i>
                                    ${term}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Search Results Container -->
            <div id="search-results-container" class="p-4 grid grid-cols-2 gap-4">
                <!-- Results injected here -->
            </div>
        </div>
    `;

    // Initialize results if search term exists
    if (searchTerm) {
        updateSearchResults(searchTerm);
    }
}

function handleSearchInput(value) {
    searchTerm = value;
    const initialContent = document.getElementById('search-initial-content');

    if (value) {
        if (initialContent) initialContent.style.display = 'none';
        updateSearchResults(value);
    } else {
        if (initialContent) initialContent.style.display = 'block';
        document.getElementById('search-results-container').innerHTML = '';
    }
}

function updateSearchResults(query) {
    const container = document.getElementById('search-results-container');
    if (!container) return;

    const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8 text-gray-500">
                <i class="fas fa-search text-4xl mb-3"></i>
                <p>No products found for "${query}"</p>
            </div>
        `;
        return;
    }

    container.innerHTML = results.map(product => `
        <div class="bg-gray-100 rounded-lg shadow overflow-hidden" onclick="navigate('product', ${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <img src="${getValidImage(product.image)}" alt="${product.name}" class="w-full h-40 object-cover" onerror="handleImageError(this)">
            <div class="p-3">
                <h3 class="font-semibold text-gray-800 truncate">${product.name}</h3>
                <p class="text-green-600 font-bold mt-1">₹${product.price}</p>
                ${product.stock <= 0 ? '<span class="text-xs text-red-500 font-bold">Out of Stock</span>' : ''}
            </div>
        </div>
    `).join('');
}

function setSearchTerm(term) {
    searchTerm = term;
    if (term && !searchHistory.includes(term)) {
        searchHistory.unshift(term);
        if (searchHistory.length > 10) {
            searchHistory.pop();
        }
    }
    renderSearch(); // Full render is okay here as it's a click action, not typing
}

function getRandomTrendingTags(count = 6) {
    return trendingTags.sort(() => Math.random() - 0.5).slice(0, count);
}

function calculateCouponDiscount(subtotal, coupon) {
    if (!coupon || !coupon.code) return 0;
    const discountText = coupon.discount || '';

    if (discountText.includes('%')) {
        const percent = parseInt(discountText, 10) || 0;
        return Math.round((subtotal * percent) / 100);
    }

    // Flat amount like ₹100 OFF
    const amountMatch = discountText.match(/([0-9]+)/);
    if (amountMatch) {
        const amount = parseInt(amountMatch[1], 10) || 0;
        return Math.min(subtotal, amount);
    }

    return 0;
}

function applyCoupon() {
    const input = document.getElementById('couponCode');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showToast('Please enter a coupon code');
        return;
    }

    const promo = promotions.find(p => p.code.toUpperCase() === code);
    if (!promo) {
        showToast('Invalid coupon code');
        appliedCoupon = null;
        renderDelivery();
        return;
    }

    // Optional: basic expiry check if validUntil is present
    if (promo.validUntil) {
        const now = new Date();
        const validUntil = new Date(promo.validUntil);
        if (now > validUntil) {
            showToast('This coupon has expired');
            appliedCoupon = null;
            renderDelivery();
            return;
        }
    }

    appliedCoupon = { code: promo.code, discount: promo.discount, type: 'promo' };
    showToast(`Coupon ${promo.code} applied`);
    renderDelivery();
}

function clearSearchHistory() {
    searchHistory = [];
    renderApp();
}

function renderCart() {
    const total = cart.reduce(
        (sum, item) =>
            sum + products.find(p => p.id === item.id).price * item.quantity,
        0
    );

    app.innerHTML = `
        <div class="pb-32">
            <!-- Header -->
            <div class="bg-gray-100 sticky top-0 z-10">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">Shopping Cart (${cart.length
        })</h1>
                </div>
            </div>

            ${cart.length === 0
            ? `
                <div class="flex flex-col items-center justify-center p-8">
                    <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <button onclick="navigate('home')" 
                            class="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                        Start Shopping
                    </button>
                </div>
            `
            : `
                <!-- Cart Items -->
                <div class="space-y-4 p-4">
                    ${cart
                .map(item => {
                    const product = products.find(
                        p => p.id === item.id
                    );
                    if (!product) return '';
                    return `
                            <div class="bg-gray-100 rounded-lg shadow-md p-4">
                                <div class="flex items-center">
                                    <img src="${getValidImage(product.image)}" 
                                         alt="${product.name}" 
                                         class="w-20 h-20 object-contain mr-4"
                                         onerror="handleImageError(this)">
                                    <div class="flex-1">
                                        <h3 class="font-medium mb-1">${product.name
                        }</h3>
                                        <div class="text-gray-500 mb-2">
                                            ${item.color
                            ? `Color: ${item.color}`
                            : ''
                        }
                                            ${item.size
                            ? ` • Size: ${item.size}`
                            : ''
                        }
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <div class="text-xl font-bold">₹${product.price
                        }</div>
                                            <div class="flex items-center space-x-3">
                                                <button onclick="updateQuantity(${product.id
                        }, ${item.quantity - 1})"
                                                        class="w-8 h-8 rounded-full border-2 flex items-center justify-center ${item.quantity === 1
                            ? 'text-red-500 border-red-500'
                            : ''
                        }">
                                                    <i class="fas ${item.quantity === 1
                            ? 'fa-trash'
                            : 'fa-minus'
                        }"></i>
                                                </button>
                                                <span class="font-medium">${item.quantity
                        }</span>
                                                <button onclick="updateQuantity(${product.id
                        }, ${item.quantity + 1})"
                                                        class="w-8 h-8 rounded-full border-2 flex items-center justify-center">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                })
                .join('')}
                </div>

                <!-- Order Summary -->
                <div class="bg-gray-100 p-4 mb-4">
                    <h3 class="text-lg font-semibold mb-4">Order Summary</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Subtotal</span>
                            <span class="font-medium">₹${calculateSubtotal()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Shipping</span>
                            <span class="font-medium">Free</span>
                        </div>
                        <div class="border-t pt-2 mt-2">
                            <div class="flex justify-between">
                                <span class="font-semibold">Total</span>
                                <span class="font-bold text-xl">₹${calculateSubtotal()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }

            ${cart.length > 0
            ? `
                <!-- Checkout Button -->
                <div class="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg">
                    <button onclick="checkout()" 
                            class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
                        <i class="fas fa-lock mr-2"></i>
                        Proceed to Checkout (₹${calculateSubtotal()})
                    </button>
                </div>
            `
            : ''
        }
        </div>
    `;
}

function setCategory(category) {
    selectedCategory = category;
    renderApp();
}

function scrollToCategories() {
    if (currentPage !== 'home') {
        navigate('home');
        setTimeout(() => {
            const el = document.getElementById('categories-section');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 250);
    } else {
        const el = document.getElementById('categories-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function calculateSubtotal() {
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id);
        return total + (product ? product.price * item.quantity : 0);
    }, 0);
}

// Utility Functions
window.handleImageError = function (img) {
    if (img.getAttribute('data-error-handled')) return;
    img.setAttribute('data-error-handled', 'true');
    // Simple SVG placeholder encoded in Base64
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20fill%3D%22%23f3f4f6%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22ui-sans-serif%2C%20system-ui%2C%20sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%239ca3af%22%3Eno%20image%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.classList.add('bg-gray-100', 'p-2', 'opacity-50');
};

function getValidImage(imageUrl) {
    if (!imageUrl || imageUrl.trim() === '') {
        return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20fill%3D%22%23f3f4f6%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22ui-sans-serif%2C%20system-ui%2C%20sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%239ca3af%22%3Eno%20image%3C%2Ftext%3E%3C%2Fsvg%3E';
    }
    return imageUrl;
}

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) {
        wishlist.push(productId);
        showToast('Added to wishlist');
    } else {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    }
    renderApp();
}

function selectColor(color) {
    selectedColor = color;
    renderApp();
}

function selectSize(size) {
    selectedSize = size;
    renderApp();
}

function shareProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (navigator.share) {
        navigator.share({
            title: product.name,
            text: product.description,
            url: window.location.href
        });
    } else {
        showToast('Share feature not supported');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className =
        'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Customer-facing notifications stored in localStorage
function getCustomerNotifications() {
    try {
        return JSON.parse(localStorage.getItem('customer_notifications')) || [];
    } catch (e) {
        return [];
    }
}

function addCustomerNotificationEntry(entry) {
    const list = getCustomerNotifications();
    list.unshift({
        id: Date.now(),
        type: entry.type || 'info',
        title: entry.title || 'Notification',
        message: entry.message || '',
        timestamp: new Date().toISOString(),
        isRead: false,
        icon: entry.icon || 'fa-info-circle',
        color: entry.color || 'blue'
    });

    if (list.length > 50) {
        list.pop();
    }

    localStorage.setItem('customer_notifications', JSON.stringify(list));
}

// Expose for other scripts (payment.js, admin, etc.)
window.addCustomerNotification = addCustomerNotificationEntry;

function buyNow(productId) {
    addToCart(productId);
    navigate('cart');
}

// Cart Functions
// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check stock
    if (product.stock <= 0) {
        showToast('Product is out of stock', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            color: selectedColor,
            size: selectedSize
        });
    }

    saveCart();
    showToast('Added to cart');
    renderApp();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    saveCart();
    renderApp();
}

function resetCart() {
    cart = [];
    saveCart();
    renderApp();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Initialize cart from localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderApp();

    // Listen for storage changes (e.g. from Admin Panel)
    window.addEventListener('storage', (e) => {
        if (e.key === 'products') {
            const newProducts = JSON.parse(e.newValue);
            if (newProducts) {
                // Update global products variable
                products = newProducts;

                // If currently viewing a product, update it with fresh data
                if (selectedProduct) {
                    const freshProduct = products.find(p => p.id === selectedProduct.id);
                    if (freshProduct) {
                        selectedProduct = freshProduct;
                    }
                }

                renderApp();
            }
        }
    });

    // Enable pull-to-refresh
    let touchStart = 0;
    let touchEnd = 0;

    app.addEventListener(
        'touchstart',
        e => {
            touchStart = e.touches[0].clientY;
        },
        { passive: true }
    );

    app.addEventListener(
        'touchmove',
        e => {
            touchEnd = e.touches[0].clientY;

            if (
                app.scrollTop === 0 &&
                touchEnd > touchStart &&
                touchEnd - touchStart > 100
            ) {
                showToast('Refreshing...');
                setTimeout(() => renderApp(), 1000);
            }
        },
        { passive: true }
    );
});

function renderUserStats(userOrders, userWishlist) {
    const pendingOrders = userOrders.filter(o => o.status === 'pending');
    return `
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div onclick="viewAllOrders('all')" 
                class="text-center p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors">
                <div class="text-3xl font-bold text-green-600 mb-1">${userOrders.length}</div>
                <div class="text-sm text-gray-600">Total Orders</div>
            </div>
            <div onclick="viewAllOrders('pending')"
                class="text-center p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors">
                <div class="text-3xl font-bold text-yellow-600 mb-1">${pendingOrders.length}</div>
                <div class="text-sm text-gray-600">Pending Orders</div>
            </div>
            <div class="text-center p-4 bg-gray-200 rounded-lg">
                <div class="text-3xl font-bold text-blue-600 mb-1">${userWishlist.length}</div>
                <div class="text-sm text-gray-600">Wishlist Items</div>
            </div>
        </div>
    `;
}

function viewAllOrders(filter = 'all') {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(order => order.userId === authState.currentUser.id);
    const filteredOrders = filter === 'all' ? userOrders : userOrders.filter(order => order.status === filter);

    app.innerHTML = `
        <div class="min-h-screen bg-gray-200 pb-20">
            <div class="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <button onclick="navigate('profile')" class="mr-4">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1 class="text-xl font-bold flex-1">
                        ${filter === 'all' ? 'All Orders' : 'Pending Orders'}
                    </h1>
                </div>
                
                <!-- Order Status Filter -->
                <div class="flex gap-2 p-4 overflow-x-auto">
                    <button onclick="viewAllOrders('all')" 
                        class="px-4 py-2 rounded-full text-sm ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}">
                        All Orders
                    </button>
                    <button onclick="viewAllOrders('pending')"
                        class="px-4 py-2 rounded-full text-sm ${filter === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}">
                        Pending
                    </button>
                    <button onclick="viewAllOrders('processing')"
                        class="px-4 py-2 rounded-full text-sm ${filter === 'processing' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}">
                        Processing
                    </button>
                    <button onclick="viewAllOrders('shipped')"
                        class="px-4 py-2 rounded-full text-sm ${filter === 'shipped' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}">
                        Shipped
                    </button>
                    <button onclick="viewAllOrders('delivered')"
                        class="px-4 py-2 rounded-full text-sm ${filter === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}">
                        Delivered
                    </button>
                </div>
            </div>

            <div class="p-4 space-y-4">
                ${filteredOrders.length > 0 ? filteredOrders.map(order => `
                    <div class="bg-gray-100 rounded-lg shadow-md p-4">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="font-medium text-lg">#${order.orderId}</h3>
                                <p class="text-sm text-gray-500">${new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}">
                                ${order.status.toUpperCase()}
                            </span>
                        </div>
                        
                        <div class="border-t border-b border-gray-100 py-4 my-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-600">Items</span>
                                <span class="font-medium">${order.items.length}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Total Amount</span>
                                <span class="font-medium">₹${order.payment.total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <!-- Order Items Preview -->
                        <div class="flex gap-2 mb-4 overflow-x-auto">
                            ${order.items.map(item => `
                                <div class="flex-shrink-0 w-16 h-16">
                                    <img src="${item.image}" alt="${item.name}" 
                                        class="w-full h-full object-cover rounded-md">
                                </div>
                            `).join('')}
                        </div>

                        <div class="flex justify-between items-center">
                            <button onclick="viewOrderDetails('${order.orderId}')" 
                                class="text-green-600 hover:text-green-700 font-medium text-sm">
                                View Details <i class="fas fa-chevron-right ml-1"></i>
                            </button>
                            ${order.status === 'delivered' ? `
                                <button onclick="rateOrder('${order.orderId}')"
                                    class="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                                    <i class="fas fa-star mr-1"></i> Rate Order
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center py-8">
                        <i class="fas fa-box-open text-gray-400 text-5xl mb-4"></i>
                        <p class="text-gray-500 mb-4">No ${filter} orders found</p>
                        <button onclick="navigate('home')" 
                            class="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                            Continue Shopping
                        </button>
                    </div>
                `}
            </div>

            ${renderBottomNav()}
        </div>
    `;
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
        showToast('Order not found');
        return;
    }
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-100 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Order #${order.orderId}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-2">${new Date(order.orderDate).toLocaleDateString()}</p>
                <span class="px-2 py-1 rounded text-sm ${getStatusStyle(order.status)}">${order.status}</span>
                <div class="mt-4 space-y-2">
                    ${order.items.map(i => `
                        <div class="flex justify-between text-sm">
                            <span>${i.name} x${i.quantity}</span>
                            <span>₹${(i.price * i.quantity).toFixed(0)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="border-t mt-4 pt-4">
                    <div class="flex justify-between font-bold">Total <span>₹${order.payment?.total?.toFixed(2) || 0}</span></div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="mt-4 w-full bg-green-500 text-white py-2 rounded-lg">
                    Close
                </button>
            </div>
        </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

function rateOrder(orderId) {
    showToast('Rating feature coming soon');
}

function getStatusStyle(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'shipped':
            return 'bg-purple-100 text-purple-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
}

function renderUserInfo(userOrders, userWishlist) {
    return `
        <div class="bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <!-- Cover Photo -->
            <div class="h-32 bg-gradient-to-r from-green-400 to-blue-500"></div>
            
            <!-- Profile Info -->
            <div class="relative px-6 pb-6">
                <div class="flex flex-col items-center -mt-16">
                    <img src="${authState.currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authState.currentUser.name)}" 
                        alt="Profile" 
                        class="w-32 h-32 rounded-full border-4 border-gray-100 shadow-lg mb-4">
                    <h2 class="text-2xl font-bold">${authState.currentUser.name}</h2>
                    <p class="text-gray-600 mb-4">${authState.currentUser.email}</p>
                </div>

                <!-- Stats Cards -->
                ${renderUserStats(userOrders, userWishlist)}

                <!-- Profile Form -->
                <form id="profile-form" onsubmit="updateProfile(event)" class="space-y-4 mt-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="profile-name" value="${authState.currentUser.name}" required
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="profile-email" value="${authState.currentUser.email}" required
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" id="profile-phone" value="${authState.currentUser.phone || ''}"
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input type="date" id="profile-dob" value="${authState.currentUser.dob || ''}"
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>
                    <button type="submit" 
                        class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center">
                        <i class="fas fa-save mr-2"></i>
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    `;
}
