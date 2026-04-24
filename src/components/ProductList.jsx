import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, onAddToCart, onProductClick }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Featured Products</h2>
                <span className="text-xs text-gray-500">{products.length} items</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={onAddToCart}
                        onProductClick={onProductClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductList;
