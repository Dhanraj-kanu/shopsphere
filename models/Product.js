const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping 'id' for compatibility with existing frontend logic
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String },
    image: { type: String },
    rating: {
        rate: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, default: 10 }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
