const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/authMiddleware');

// @desc    Apply coupon
// @route   POST /api/coupons/apply
// @access  Private
router.post('/apply', protect, async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is inactive' });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        // Prevent negative total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        // Return discount info to be applied in UI / checkout
        res.json({
            message: 'Coupon applied successfully',
            discountAmount,
            discountType: coupon.discountType,
            couponId: coupon._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
