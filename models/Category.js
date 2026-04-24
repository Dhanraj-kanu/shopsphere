const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    bannerImage: {
        type: String
    },
    icon: {
        type: String
    },
    displayOnHomepage: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    customColor: {
        type: String
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    slug: {
        type: String,
        unique: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    showInMegaMenu: {
        type: Boolean,
        default: false
    },
    hideEmptyCategory: {
        type: Boolean,
        default: false
    },
    filters: [{
        name: { type: String, required: true },
        options: [{ type: String }] // e.g. ["8GB", "16GB"] for name "RAM"
    }]
}, {
    timestamps: true
});

// Auto-generate slug from name if not provided
categorySchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
