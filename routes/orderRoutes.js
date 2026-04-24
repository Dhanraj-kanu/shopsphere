const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { protect } = require('../middleware/authMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            discountAmount,
            couponInfo,
            paymentResult
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                paymentResult,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                discountAmount,
                couponInfo,
                isPaid: paymentMethod === 'Razorpay' ? true : false,
                paidAt: paymentMethod === 'Razorpay' ? Date.now() : null
            });

            const createdOrder = await order.save();

            if (createdOrder.couponInfo && createdOrder.couponInfo.code) {
                const Coupon = require('../models/Coupon');
                const coupon = await Coupon.findOne({ code: createdOrder.couponInfo.code });
                if (coupon) {
                    coupon.usedCount = (coupon.usedCount || 0) + 1;
                    await coupon.save();
                }
            }

            // Create notification for the user
            const user = await User.findById(req.user._id);
            if (user) {
                user.notifications.unshift({
                    message: `Order #${createdOrder._id} placed successfully!`,
                    isRead: false,
                });
                await user.save();
            }

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ message: error.message || 'Server Error during order creation' });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        if (order.user._id.equals(req.user._id) || req.user.isAdmin) {
            res.json(order);
        } else {
            res.status(401).json({ message: 'Not authorized to view this order' });
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

module.exports = router;
