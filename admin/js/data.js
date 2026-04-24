const defaultProducts = [
    // Electronics
    {
        id: 1,
        name: 'AirPods Pro',
        price: 24900,
        category: 'Electronics',
        rating: 4.8,
        image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1660803972361',
        available: true,
        stock: 50,
        description: 'Active noise cancellation having transparency mode. Spatial audio.',
        reviews: [], colors: ['White']
    },
    {
        id: 2,
        name: 'MacBook Air M2',
        price: 114900,
        category: 'Electronics',
        rating: 4.9,
        image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1633027804000',
        available: true,
        stock: 20,
        description: 'Supercharged by M2 chip. Thin, light, and powerful.',
        reviews: [], colors: ['Space Gray', 'Silver']
    },
    {
        id: 3,
        name: 'Sony WH-1000XM5',
        price: 29990,
        category: 'Electronics',
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/61+e045W5qL._AC_SL1500_.jpg',
        available: true,
        stock: 35,
        description: 'Industry leading noise canceling headphones.',
        reviews: [], colors: ['Black', 'Silver']
    },
    {
        id: 4,
        name: 'Samsung Galaxy S24 Ultra',
        price: 129999,
        category: 'Electronics',
        rating: 4.8,
        image: 'https://m.media-amazon.com/images/I/71CxS9o6QPL._SX679_.jpg',
        available: true,
        stock: 15,
        description: 'Titanium frame, AI features, and S-Pen.',
        reviews: [], colors: ['Titanium Gray', 'Black']
    },
    {
        id: 5,
        name: 'iPad Air 5th Gen',
        price: 54900,
        category: 'Electronics',
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/61XZQXFQeVL._AC_SX679_.jpg',
        available: true,
        stock: 40,
        description: 'Supercharged by the Apple M1 chip.',
        reviews: [], colors: ['Blue', 'Purple', 'Space Gray']
    },
    {
        id: 6,
        name: 'GoPro Hero 12 Black',
        price: 39990,
        category: 'Electronics',
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/615aF-t9rTL._AC_SX679_.jpg',
        available: true,
        stock: 25,
        description: 'Unbelievable image quality and stabilization.',
        reviews: [], colors: ['Black']
    },
    {
        id: 7,
        name: 'PlayStation 5 Console',
        price: 54990,
        category: 'Electronics',
        rating: 4.9,
        image: 'https://m.media-amazon.com/images/I/51051FiD9UL._SX679_.jpg',
        available: true,
        stock: 10,
        description: 'Play Has No Limits. Lightning fast loading.',
        reviews: [], colors: ['White']
    },
    // Fashion
    {
        id: 11,
        name: 'Levi\'s Men\'s 501 Original',
        price: 3599,
        category: 'Fashion',
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/616x+yT1V4L._AC_UY1100_.jpg',
        available: true,
        stock: 60,
        description: 'The original button fly jean.',
        reviews: [], colors: ['Blue', 'Black'], sizes: ['30', '32', '34']
    },
    {
        id: 12,
        name: 'Adidas Ultraboost Light',
        price: 13999,
        category: 'Fashion',
        rating: 4.7,
        image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/0fbed4646c1d46e0aae0af000100d845_9366/Ultraboost_Light_Running_Shoes_White_HQ6351_01_standard.jpg',
        available: true,
        stock: 45,
        description: 'Lightest Ultraboost ever made.',
        reviews: [], colors: ['White', 'Black'], sizes: ['8', '9', '10']
    },
    {
        id: 13,
        name: 'Ray-Ban Aviator Sunglasses',
        price: 8990,
        category: 'Fashion',
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/51f8iSlX7AL._AC_UL1500_.jpg',
        available: true,
        stock: 30,
        description: 'Classic teardrop shape.',
        reviews: [], colors: ['Gold', 'Black']
    },
    {
        id: 14,
        name: 'Puma Men\'s Hoodie',
        price: 2499,
        category: 'Fashion',
        rating: 4.3,
        image: 'https://m.media-amazon.com/images/I/51+u1+q4VKL._AC_UY1100_.jpg',
        available: true,
        stock: 55,
        description: 'Comfortable cotton blend hoodie.',
        reviews: [], colors: ['Black', 'Grey', 'Red'], sizes: ['M', 'L', 'XL']
    },
    {
        id: 15,
        name: 'Zara Floral Summer Dress',
        price: 3990,
        category: 'Fashion',
        rating: 4.5,
        image: 'https://static.zara.net/photos///2024/V/0/1/p/2731/046/250/2/w/850/2731046250_6_1_1.jpg?ts=1706110902641',
        available: true,
        stock: 40,
        description: 'Lightweight and flowy for summer.',
        reviews: [], colors: ['Floral White'], sizes: ['S', 'M', 'L']
    },
    {
        id: 16,
        name: 'H&M Denim Jacket',
        price: 3999,
        category: 'Fashion',
        rating: 4.4,
        image: 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F7c%2F62%2F7c6258f3876097e346f14068595a6396f264883b.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BLOOKBOOK%5D%2Cres%5Bm%5D%2Chmver%5B1%5D&call=url[file:/product/main]',
        available: true,
        stock: 35,
        description: 'Classic denim jacket with button closure.',
        reviews: [], colors: ['Blue'], sizes: ['M', 'L', 'XL']
    },
    // Beauty
    {
        id: 17,
        name: 'Maybelline Matte Lipstick',
        price: 499,
        category: 'Beauty',
        rating: 4.3,
        image: 'https://m.media-amazon.com/images/I/61k0dD6uRzL._SL1000_.jpg',
        available: true,
        stock: 100,
        description: 'Long lasting matte finish.',
        reviews: [], colors: ['Red', 'Pink', 'Nude']
    },
    {
        id: 18,
        name: 'Dyson Airwrap Styler',
        price: 45900,
        category: 'Beauty',
        rating: 4.8,
        image: 'https://m.media-amazon.com/images/I/51+u1+q4VKL.jpg', // Placeholder
        available: true,
        stock: 15,
        description: 'Curl. Shape. Smooth and hide flyaways.',
        reviews: [], colors: ['Copper', 'Blue']
    },
    {
        id: 19,
        name: 'CeraVe Moisturizing Cream',
        price: 1299,
        category: 'Beauty',
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/61S2+C8F7oL._SL1500_.jpg',
        available: true,
        stock: 80,
        description: 'For normal to dry skin.',
        reviews: [], colors: []
    },
    {
        id: 20,
        name: 'MAC Studio Fix Fluid',
        price: 3300,
        category: 'Beauty',
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/51H5PghJ-lL._SL1200_.jpg',
        available: true,
        stock: 40,
        description: '24-hour wear breathable foundation.',
        reviews: [], colors: ['NC20', 'NC25', 'NC40']
    },
    // Home & Kitchen
    {
        id: 21,
        name: 'Philips Digital Air Fryer',
        price: 8999,
        category: 'Home & Kitchen',
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/71Yy8-2+HPL._AC_SL1500_.jpg',
        available: true,
        stock: 30,
        description: 'Great tasting fries with up to 90% less fat.',
        reviews: [], colors: ['Black']
    },
    {
        id: 22,
        name: 'Prestige Pressure Cooker',
        price: 1999,
        category: 'Home & Kitchen',
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/61m1J17Yy2L._SL1500_.jpg',
        available: true,
        stock: 50,
        description: 'Durable stainless steel cooker.',
        reviews: [], colors: ['Silver']
    },
    {
        id: 23,
        name: 'Milton Casserole Set',
        price: 1499,
        category: 'Home & Kitchen',
        rating: 4.3,
        image: 'https://m.media-amazon.com/images/I/81xXg2-X4rL._SL1500_.jpg',
        available: true,
        stock: 45,
        description: 'Keeps food hot for hours.',
        reviews: [], colors: ['Red', 'Blue']
    },
    {
        id: 24,
        name: 'IKEA TERTIAL Work Lamp',
        price: 1299,
        category: 'Home & Kitchen',
        rating: 4.6,
        image: 'https://www.ikea.com/in/en/images/products/tertial-work-lamp-dark-grey__0609329_pe684454_s5.jpg?f=s',
        available: true,
        stock: 60,
        description: 'Adjustable arm and head.',
        reviews: [], colors: ['Dark Grey', 'White']
    },
    // Toys
    {
        id: 28,
        name: 'LEGO Star Wars Y-Wing',
        price: 6999,
        category: 'Toys',
        rating: 4.9,
        image: 'https://m.media-amazon.com/images/I/81iIt3-+kDL._AC_SL1500_.jpg',
        available: true,
        stock: 20,
        description: 'Detailed replica Model.',
        reviews: [], colors: []
    },
    {
        id: 29,
        name: 'Barbie Dreamhouse',
        price: 11999,
        category: 'Toys',
        rating: 4.8,
        image: 'https://m.media-amazon.com/images/I/81M5pyG+cWL._AC_SL1500_.jpg',
        available: true,
        stock: 12,
        description: '3 stories, 8 rooms, 70+ accessories.',
        reviews: [], colors: []
    },
    {
        id: 30,
        name: 'Monopoly Classic Game',
        price: 999,
        category: 'Toys',
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/81sh2RHz1aL._AC_SL1500_.jpg',
        available: true,
        stock: 100,
        description: 'The fast-dealing property trading game.',
        reviews: [], colors: []
    },
    {
        id: 31,
        name: 'Nerf Elite 2.0 Commander',
        price: 1499,
        category: 'Toys',
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/71Y9g0+2JQL._AC_SL1500_.jpg',
        available: true,
        stock: 50,
        description: '6-dart rotating drum.',
        reviews: [], colors: ['Blue']
    },
    // Sports
    {
        id: 35,
        name: 'Yonex Badminton Racket',
        price: 2499,
        category: 'Sports',
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/71t+r3+3GEL._SL1500_.jpg',
        available: true,
        stock: 40,
        description: 'Lightweight graphite frame.',
        reviews: [], colors: ['Black/Blue']
    },
    {
        id: 36,
        name: 'Premium Yoga Mat',
        price: 999,
        category: 'Sports',
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/71C7B-b5x-L._SL1500_.jpg',
        available: true,
        stock: 80,
        description: 'Non-slip surface for yoga and gym.',
        reviews: [], colors: ['Purple', 'Green', 'Blue']
    },
    {
        id: 37,
        name: 'Hex Dumbbells (5kg Pair)',
        price: 1999,
        category: 'Sports',
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/61s+Vj-E64L._AC_SL1500_.jpg',
        available: true,
        stock: 30,
        description: 'Rubber encased hexagonal dumbbells.',
        reviews: [], colors: ['Black']
    },
    {
        id: 38,
        name: 'Spalding Basketball',
        price: 1899,
        category: 'Sports',
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/91+8qqF+c4L._AC_SL1500_.jpg',
        available: true,
        stock: 40,
        description: 'Official size and weight.',
        reviews: [], colors: ['Orange']
    },
    // Books
    {
        id: 41,
        name: 'Atomic Habits',
        price: 599,
        category: 'Books',
        rating: 4.9,
        image: 'https://m.media-amazon.com/images/I/81F90H7hnML._SL1500_.jpg',
        available: true,
        stock: 150,
        description: 'Tiny Changes, Remarkable Results.',
        reviews: [], colors: []
    },
    {
        id: 42,
        name: 'The Psychology of Money',
        price: 399,
        category: 'Books',
        rating: 4.8,
        image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._SL1500_.jpg',
        available: true,
        stock: 120,
        description: 'Timeless lessons on wealth, greed, and happiness.',
        reviews: [], colors: []
    },
    {
        id: 43,
        name: 'Harry Potter Box Set',
        price: 2999,
        category: 'Books',
        rating: 5.0,
        image: 'https://m.media-amazon.com/images/I/71TRLMr3J+L._SL1248_.jpg',
        available: true,
        stock: 30,
        description: 'Complete collection of 7 books.',
        reviews: [], colors: []
    },
    // Furniture
    {
        id: 47,
        name: 'Ergonomic Office Chair',
        price: 8999,
        category: 'Furniture',
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/61d-d+z-0GL._AC_SL1500_.jpg',
        available: true,
        stock: 20,
        description: 'Mesh back with lumbar support.',
        reviews: [], colors: ['Black', 'Grey']
    },
    {
        id: 48,
        name: 'Wooden Coffee Table',
        price: 4999,
        category: 'Furniture',
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/71xN+v8+HCL._AC_SL1500_.jpg',
        available: true,
        stock: 15,
        description: 'Solid wood with modern design.',
        reviews: [], colors: ['Oak', 'Walnut']
    },
    {
        id: 49,
        name: 'Bean Bag XXL',
        price: 1999,
        category: 'Furniture',
        rating: 4.2,
        image: 'https://m.media-amazon.com/images/I/71g+k+I-TFL._SL1500_.jpg',
        available: true,
        stock: 25,
        description: 'Comfortable seating for lounge.',
        reviews: [], colors: ['Brown', 'Black', 'Red']
    }
];

let products = JSON.parse(localStorage.getItem('products')) || defaultProducts;

if (products.length < 20 || !localStorage.getItem('products')) {
    products = defaultProducts;
    localStorage.setItem('products', JSON.stringify(products));
}

const categories = ['All', 'Electronics', 'Fashion', 'Beauty', 'Toys', 'Home & Kitchen', 'Sports', 'Books', 'Furniture'];

const promotions = [
    {
        id: 1,
        title: 'Summer Sale',
        discount: '20% OFF',
        code: 'SUMMER20',
        validUntil: '2025-02-01'
    },
    {
        id: 2,
        title: 'New User Special',
        discount: '₹100 OFF',
        code: 'NEWUSER',
        validUntil: '2025-03-01'
    },
    {
        id: 3,
        title: 'Fashion Week',
        discount: '30% OFF',
        code: 'FASHION30',
        validUntil: '2025-01-31'
    }
];

// Notification data
const notifications = [
    {
        id: 1,
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #1234 has been delivered successfully',
        timestamp: new Date(2025, 0, 14, 8, 30).getTime(),
        isRead: false,
        icon: 'fa-box-check',
        color: 'green'
    },
    {
        id: 2,
        type: 'promo',
        title: 'Special Offer',
        message: 'Get 50% off on all winter collection items!',
        timestamp: new Date(2025, 0, 14, 7, 15).getTime(),
        isRead: false,
        icon: 'fa-tag',
        color: 'orange'
    },
    {
        id: 3,
        type: 'news',
        title: 'New Collection Arrived',
        message: 'Check out our latest spring collection',
        timestamp: new Date(2025, 0, 13, 18, 45).getTime(),
        isRead: true,
        icon: 'fa-tshirt',
        color: 'blue'
    },
    {
        id: 4,
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile information has been updated successfully',
        timestamp: new Date(2025, 0, 13, 15, 20).getTime(),
        isRead: true,
        icon: 'fa-user-check',
        color: 'purple'
    }
];

// Trending tags data
const trendingTags = [
    { id: 1, name: 'Summer Collection', searches: 15420 },
    { id: 2, name: 'Casual Wear', searches: 12350 },
    { id: 3, name: 'Sport Shoes', searches: 11200 },
    { id: 4, name: 'Designer Bags', searches: 9870 },
    { id: 5, name: 'Smart Watches', searches: 8940 },
    { id: 6, name: 'Formal Wear', searches: 7650 },
    { id: 7, name: 'Accessories', searches: 6780 },
    { id: 8, name: 'Winter Wear', searches: 5430 },
    { id: 9, name: 'Ethnic Wear', searches: 4980 },
    { id: 10, name: 'Sunglasses', searches: 4320 },
    { id: 11, name: 'Sneakers', searches: 3890 },
    { id: 12, name: 'Denim', searches: 3450 },
    { id: 13, name: 'Party Wear', searches: 3210 },
    { id: 14, name: 'Fitness Gear', searches: 2980 },
    { id: 15, name: 'Home Decor', searches: 2760 }
];

localStorage.setItem('products', JSON.stringify(products));
