const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            address: user.address,
            notifications: user.notifications,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.address) {
                user.address = {
                    street: req.body.address.street || user.address.street,
                    city: req.body.address.city || user.address.city,
                    state: req.body.address.state || user.address.state,
                    zip: req.body.address.zip || user.address.zip,
                    country: req.body.address.country || user.address.country,
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                isAdmin: updatedUser.isAdmin,
                address: updatedUser.address,
                notifications: updatedUser.notifications,
                token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET || 'secret123', {
                    expiresIn: '30d',
                }),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json(user.notifications || []);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
router.put('/notifications/:id/read', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const notification = user.notifications.id(req.params.id);
        if (notification) {
            notification.isRead = true;
            await user.save();
            res.json(user.notifications);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;
