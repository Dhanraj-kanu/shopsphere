const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const jwt = require('jsonwebtoken');

const { protectAdmin } = require('../middleware/authMiddleware');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Suspend or Activate user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
router.put('/users/:id/suspend', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Toggle status logic
            user.status = user.status === 'active' ? 'suspended' : 'active';
            const updatedUser = await user.save();
            res.json({ message: `User ${updatedUser.status} successfully`, user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Promote or Demote admin
// @route   PUT /api/admin/users/:id/promote
// @access  Private/Admin
router.put('/users/:id/promote', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isAdmin = !user.isAdmin;
            const updatedUser = await user.save();
            res.json({ message: `User ${updatedUser.isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`, user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protectAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // Low Stock Products (stock < 10)
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } });

        // Monthly Revenue Data (last 6 months)
        const monthlyRevenue = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            const monthOrders = orders.filter(o => {
                const od = new Date(o.createdAt);
                return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
            });
            const revenue = monthOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
            monthlyRevenue.push({ name: monthName, revenue });
        }

        // Orders per Day (last 7 days)
        const dailyOrders = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const count = orders.filter(o => {
                const od = new Date(o.createdAt);
                return od >= d && od < nextDay;
            }).length;
            dailyOrders.push({ name: d.toLocaleDateString(undefined, { weekday: 'short' }), orders: count });
        }

        // Top 5 Selling Products (mock data or aggregate if orderItems have counts)
        // For simplicity, let's just pick top 5 products by price or something for now, 
        // or mock typical structure
        const topProducts = await Product.find().sort({ price: -1 }).limit(5).select('name price');
        const topSellingProducts = topProducts.map(p => ({
            name: p.name,
            sales: Math.floor(Math.random() * 100) + 50 // Mock sales data for chart
        }));

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            lowStockCount: lowStockProducts.length,
            monthlyRevenue,
            dailyOrders,
            topSellingProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protectAdmin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', protectAdmin, async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        } else {
            order.isDelivered = false;
            order.deliveredAt = null;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Update order to delivered (Legacy - can be removed later or kept for compatibility)
// @route   PUT /api/admin/orders/:id/deliver
// @access  Private/Admin
router.put('/orders/:id/deliver', protectAdmin, async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// --- CATEGORIES ---
router.get('/categories', protectAdmin, async (req, res) => {
    try {
        // Fetch categories sorted by sortOrder
        const categories = await Category.find({}).populate('parent', 'name').sort({ sortOrder: 1 });

        // Count products per category
        const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
            const productCount = await Product.countDocuments({
                $or: [
                    { category: cat._id },
                    { category: cat.name }
                ]
            });
            return {
                ...cat.toObject(),
                productCount
            };
        }));

        res.json(categoriesWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/categories', protectAdmin, async (req, res) => {
    try {
        const categoryData = { ...req.body };
        if (!categoryData.parent) {
            categoryData.parent = null;
        }
        const category = new Category(categoryData);
        const savedCategory = await category.save();
        const populatedCategory = await Category.findById(savedCategory._id).populate('parent', 'name');
        res.status(201).json(populatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/categories/:id', protectAdmin, async (req, res) => {
    try {
        const categoryData = { ...req.body };
        if (!categoryData.parent) {
            categoryData.parent = null;
        }

        // Prevent setting parent to itself
        if (categoryData.parent && categoryData.parent === req.params.id) {
            return res.status(400).json({ message: 'A category cannot be its own parent.' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            categoryData,
            { new: true, runValidators: true }
        ).populate('parent', 'name');

        if (updatedCategory) {
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/categories/:id', protectAdmin, async (req, res) => {
    try {
        // Find if this category is a parent to any other categories
        const children = await Category.find({ parent: req.params.id });
        if (children.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete this category because it has child categories. Please delete or reassign them first.'
            });
        }

        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (deletedCategory) {
            res.json({ message: 'Category deleted' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reorder categories
// @route   PUT /api/admin/categories/reorder
// @access  Private/Admin
router.put('/categories/reorder', protectAdmin, async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'orderedIds array is required' });
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { sortOrder: index }
            }
        }));

        await Category.bulkWrite(bulkOps);
        res.json({ message: 'Categories reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get category analytics
// @route   GET /api/admin/categories/:id/analytics
// @access  Private/Admin
router.get('/categories/:id/analytics', protectAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;

        // 1. Get total products in this category
        const totalProducts = await Product.countDocuments({
            $or: [
                { category: categoryId },
                // Since our current seeded products might be using string categories instead of ObjectIDs,
                // we might need a more robust matching if category schema uses string names.
                // Assuming we're transitioning to ObjectIDs or the front-end handles mapping:
                // For this demo, let's also fetch the category name to find related products by string if needed
            ]
        });

        // Let's get the category name first
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Find products matching this category (either by ID or by name string for legacy data)
        const productsInCategory = await Product.find({
            $or: [
                { category: categoryId },
                { category: category.name } // Fallback for seeded string categories
            ]
        });

        const productIds = productsInCategory.map(p => p._id.toString());
        const totalProductsCount = productsInCategory.length;

        // 2. Fetch all orders to aggregate stats
        const allOrders = await Order.find({ isPaid: true });

        let totalSales = 0;
        let revenue = 0;
        const productSalesMap = {}; // To find top selling product

        allOrders.forEach(order => {
            order.orderItems.forEach(item => {
                // If the ordered item's product ID is in the category's product list
                if (item.product && productIds.includes(item.product.toString())) {
                    totalSales += item.qty;
                    revenue += (item.qty * item.price);

                    if (productSalesMap[item.product.toString()]) {
                        productSalesMap[item.product.toString()].qty += item.qty;
                        productSalesMap[item.product.toString()].revenue += (item.qty * item.price);
                    } else {
                        productSalesMap[item.product.toString()] = {
                            name: item.name,
                            qty: item.qty,
                            revenue: (item.qty * item.price)
                        };
                    }
                }
            });
        });

        // 3. Find top selling product
        let topProduct = null;
        let maxQty = 0;

        for (const [id, stats] of Object.entries(productSalesMap)) {
            if (stats.qty > maxQty) {
                maxQty = stats.qty;
                topProduct = stats;
            }
        }

        res.json({
            categoryName: category.name,
            totalProducts: totalProductsCount,
            totalSales,
            revenue,
            topProduct: topProduct || { name: 'N/A', qty: 0, revenue: 0 }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- COUPONS ---
router.get('/coupons', protectAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/coupons', protectAdmin, async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        const savedCoupon = await coupon.save();
        res.status(201).json(savedCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/coupons/:id', protectAdmin, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/coupons/:id', protectAdmin, async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate, isActive, usageLimit } = req.body;
        const coupon = await Coupon.findById(req.params.id);

        if (coupon) {
            coupon.code = code || coupon.code;
            coupon.discountType = discountType || coupon.discountType;
            coupon.discountValue = discountValue === undefined ? coupon.discountValue : discountValue;
            coupon.expiryDate = expiryDate || coupon.expiryDate;
            if (isActive !== undefined) coupon.isActive = isActive;
            if (usageLimit !== undefined) coupon.usageLimit = usageLimit;

            const updatedCoupon = await coupon.save();
            res.json(updatedCoupon);
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- REVIEWS ---
router.get('/reviews', protectAdmin, async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/reviews/:id/status', protectAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const review = await Review.findById(req.params.id);
        if (review) {
            review.status = status;
            await review.save();
            res.json({ message: `Review marked as ${status}`, review });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/reviews/alerts', protectAdmin, async (req, res) => {
    try {
        // Fetch reviews that are reported OR have low rating (<= 2)
        const alerts = await Review.find({
            $or: [
                { reported: true },
                { rating: { $lte: 2 } }
            ]
        })
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/reviews/:id', protectAdmin, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            const productId = review.product;
            await Review.findByIdAndDelete(req.params.id);

            // Recalculate product rating
            const allReviews = await Review.find({ product: productId, status: 'approved' });
            const numReviews = allReviews.length;
            const totalRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
            const avgRating = numReviews > 0 ? (totalRating / numReviews) : 0;

            const product = await Product.findById(productId);
            if (product) {
                product.averageRating = avgRating;
                product.numReviews = numReviews;
                product.rating = { rate: avgRating, count: numReviews };
                await product.save();
            }

            return res.json({ message: 'Review deleted' });
        }
        res.status(404).json({ message: 'Review not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
