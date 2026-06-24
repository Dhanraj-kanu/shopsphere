const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Helper to find a product by ObjectId or numeric id
const findProduct = async (paramId) => {
    if (mongoose.Types.ObjectId.isValid(paramId)) {
        const product = await Product.findById(paramId);
        if (product) return product;
    }
    const numericId = Number(paramId);
    if (!isNaN(numericId)) {
        return await Product.findOne({ id: numericId });
    }
    return null;
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await findProduct(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protectAdmin, async (req, res) => {
    try {
        const product = await findProduct(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protectAdmin, async (req, res) => {
    const { name, price, description, category, image, stock, id } = req.body;

    try {
        // Auto-generate numeric ID if not provided, NaN, or already exists
        let productId = Number(id);
        const existingProduct = await Product.findOne({ id: productId });
        if (isNaN(productId) || !productId || existingProduct) {
            const products = await Product.find({});
            const numericIds = products.map(p => Number(p.id)).filter(id => !isNaN(id) && isFinite(id));
            productId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        }

        const product = new Product({
            id: productId,
            name,
            price,
            description,
            category,
            image,
            stock
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protectAdmin, async (req, res) => {
    const { name, price, description, category, image, stock } = req.body;

    try {
        const product = await findProduct(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.category = category || product.category;
            product.image = image || product.image;
            product.stock = stock !== undefined ? stock : product.stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
