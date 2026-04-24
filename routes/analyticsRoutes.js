const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protectAdmin } = require('../middleware/authMiddleware');

// @desc    Get dashboard summary metrics
// @route   GET /api/admin/analytics/dashboard
// @access  Private/Admin
router.get('/dashboard', protectAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProducts = await Product.countDocuments({});
        const orders = await Order.find({});

        const totalOrders = orders.length;
        const totalSales = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // Calculate sales from yesterday to today to figure out percentage growth, etc. Or just raw totals for now.
        res.json({
            totalSales,
            totalOrders,
            totalUsers,
            totalProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error retrieving dashboard stats' });
    }
});

// @desc    Get sales data for charts
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
router.get('/sales', protectAdmin, async (req, res) => {
    try {
        // Simple aggregate by date (last 30 days)
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        // Format for frontend
        const formattedSalesData = salesData.map(item => ({
            date: item._id,
            sales: item.totalSales,
            orders: item.totalOrders
        }));

        res.json(formattedSalesData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error retrieving sales charting data' });
    }
});

// @desc    Get top products
// @route   GET /api/admin/analytics/top-products
// @access  Private/Admin
router.get('/top-products', protectAdmin, async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    name: { $first: "$orderItems.name" },
                    totalQuantitySold: { $sum: "$orderItems.qty" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } }
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 } // Top 5
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error retrieving top products' });
    }
});

// @desc    Get top customers
// @route   GET /api/admin/analytics/top-customers
// @access  Private/Admin
router.get('/top-customers', protectAdmin, async (req, res) => {
    try {
        const topCustomers = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalSpent: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    _id: 1,
                    totalSpent: 1,
                    totalOrders: 1,
                    name: "$userInfo.name",
                    email: "$userInfo.email"
                }
            }
        ]);

        res.json(topCustomers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error retrieving top customers' });
    }
});

module.exports = router;
