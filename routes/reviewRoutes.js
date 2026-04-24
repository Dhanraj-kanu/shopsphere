const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, protectAdmin } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to analyze sentiment using Gemini
async function analyzeSentiment(title, comment) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') return "Unclassified";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze the sentiment of this product review. 
        Title: "${title}"
        Comment: "${comment}"
        Reply with exactly one word from this list: Positive, Neutral, Negative`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        if (["Positive", "Neutral", "Negative"].includes(responseText)) {
            return responseText;
        }
        return "Unclassified";
    } catch (error) {
        console.error("Sentiment analysis failed:", error.message);
        return "Unclassified";
    }
}

// @desc    Create a new review
// @route   POST /api/reviews/:productId
// @access  Private
router.post('/:productId', protect, async (req, res) => {
    try {
        const productId = req.params.productId;
        const { rating, title, comment, images } = req.body;

        if (!productId || !rating || !title || !comment) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user has purchased the product
        const orders = await Order.find({ user: req.user._id, isPaid: true });
        let verifiedPurchase = false;

        for (const order of orders) {
            const hasPurchased = order.orderItems.some(item => String(item.product) === String(productId) || String(item.id) === String(productId));
            if (hasPurchased) {
                verifiedPurchase = true;
                break;
            }
        }

        // Resolve the actual Product ObjectId
        let product;
        try {
            product = await Product.findById(productId);
        } catch (e) {
            console.log("Not a valid ObjectId, falling back to id match");
        }

        if (!product) {
            product = await Product.findOne({ id: productId });
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const trueProductId = product._id;

        // Auto-classify sentiment
        const sentiment = await analyzeSentiment(title, comment);

        const review = new Review({
            product: trueProductId,
            user: req.user._id,
            rating: Number(rating),
            title,
            comment,
            images: images || [],
            verifiedPurchase,
            sentiment,
            status: 'approved' // Auto-approve for now, or could make pending based on admin settings
        });

        await review.save();

        // Update product overall rating
        const allReviews = await Review.find({ product: trueProductId, status: 'approved' });
        const numReviews = allReviews.length;
        const totalRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
        const avgRating = totalRating / numReviews;

        product.averageRating = avgRating;
        product.numReviews = numReviews;

        // Keeping original rating object backwards compatible
        product.rating = {
            rate: avgRating,
            count: numReviews
        };
        await product.save();
        res.status(201).json(review);
    } catch (error) {
        console.error("Review creation failed:", error);
        // Do not crash server
        res.status(500).json({ message: 'Server Error processing review: ' + error.message, error: error.stack });
    }
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
router.get('/:productId', async (req, res) => {
    try {
        const { rating, hasImages, verifiedOnly, sort } = req.query;
        let query = { product: req.params.productId, status: 'approved' };

        // We might be passing the custom 'id' instead of '_id', let's check
        // Assuming req.params.productId could be either
        const product = await Product.findById(req.params.productId).catch(() => null)
            || await Product.findOne({ id: req.params.productId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        query.product = product._id; // Ensure we query by ObjectId

        if (rating) {
            query.rating = Number(rating);
        }
        if (hasImages === 'true') {
            query.images = { $exists: true, $not: { $size: 0 } };
        }
        if (verifiedOnly === 'true') {
            query.verifiedPurchase = true;
        }

        let sortOption = { createdAt: -1 }; // default: most recent
        if (sort === 'helpful') {
            sortOption = { helpfulCount: -1, createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const reviews = await Review.find(query).populate('user', 'name').sort(sortOption);

        // Fetch all approved reviews to calculate breakdown and sentiments
        const allApprovedReviews = await Review.find({ product: product._id, status: 'approved' });
        const totalReviews = allApprovedReviews.length;

        const ratingBreakdown = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };

        let positiveCount = 0;
        let avgRating = 0;

        allApprovedReviews.forEach(r => {
            ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
            if (r.sentiment === 'Positive') positiveCount++;
            avgRating += r.rating;
        });

        avgRating = totalReviews > 0 ? (avgRating / totalReviews).toFixed(1) : 0;
        const sentimentSummary = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;

        // Convert counts to percentages
        const ratingDistribution = {
            5: totalReviews > 0 ? Math.round((ratingBreakdown[5] / totalReviews) * 100) : 0,
            4: totalReviews > 0 ? Math.round((ratingBreakdown[4] / totalReviews) * 100) : 0,
            3: totalReviews > 0 ? Math.round((ratingBreakdown[3] / totalReviews) * 100) : 0,
            2: totalReviews > 0 ? Math.round((ratingBreakdown[2] / totalReviews) * 100) : 0,
            1: totalReviews > 0 ? Math.round((ratingBreakdown[1] / totalReviews) * 100) : 0,
        };

        res.json({
            reviews,
            stats: {
                totalReviews,
                avgRating,
                ratingDistribution,
                sentimentSummary: `${sentimentSummary}% customers are satisfied`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
router.put('/:id/helpful', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.helpfulCount += 1;
        await review.save();
        res.json({ message: 'Marked as helpful', review });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark review as not helpful
// @route   PUT /api/reviews/:id/not-helpful
// @access  Private
router.put('/:id/not-helpful', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        // Doesn't let it go below 0
        if (review.helpfulCount > 0) {
            review.helpfulCount -= 1;
        }
        await review.save();
        res.json({ message: 'Marked as not helpful', review });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
router.post('/:id/report', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.reported = true;
        // Optionally change status to pending for admin to review
        // review.status = 'pending';

        await review.save();
        res.json({ message: 'Review reported successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { rating, title, comment, images } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.user) !== String(req.user._id) && !req.user.isAdmin) {
            return res.status(401).json({ message: 'User not authorized to update this review' });
        }

        if (rating) review.rating = Number(rating);
        if (title !== undefined) review.title = title;
        if (comment !== undefined) review.comment = comment;
        if (images !== undefined) review.images = images;

        if (title !== undefined && comment !== undefined) {
            review.sentiment = await analyzeSentiment(review.title, review.comment);
        }

        await review.save();

        // Recalculate product rating
        const allReviews = await Review.find({ product: review.product, status: 'approved' });
        const numReviews = allReviews.length;
        const totalRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
        const avgRating = numReviews > 0 ? (totalRating / numReviews) : 0;

        const product = await Product.findById(review.product);
        if (product) {
            product.averageRating = avgRating;
            product.numReviews = numReviews;
            product.rating = { rate: avgRating, count: numReviews };
            await product.save();
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (String(review.user) !== String(req.user._id) && !req.user.isAdmin) {
            return res.status(401).json({ message: 'User not authorized to delete this review' });
        }

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

        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
