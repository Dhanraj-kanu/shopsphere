const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    images: {
        type: [String],   // User uploaded review images (Base64 or URLs)
        default: []
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    reported: {
        type: Boolean,
        default: false
    },
    sentiment: {
        type: String,
        enum: ["Positive", "Neutral", "Negative", "Unclassified"],
        default: "Unclassified"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending" // changed to approved for immediate visibility or keep pending based on requirement, setting pending as default
    }
}, {
    timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
