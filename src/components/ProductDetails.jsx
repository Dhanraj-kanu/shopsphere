import React, { useState } from 'react';
import { Star, ShoppingCart, ArrowLeft, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import ReviewSection from './reviews/ReviewSection';
import ProductCard from './ProductCard';
const ProductDetails = ({ product, products, onBack, onAddToCart, onProductClick }) => {
    const [imgSrc, setImgSrc] = useState(product.image);

    if (!product) return null;

    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in zoom-in duration-300">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Back to Products
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Product Image Section */}
                    <div className="p-8 md:p-12 bg-gray-50 flex items-center justify-center relative group">
                        <img
                            src={imgSrc}
                            alt={product.name}
                            onError={() => setImgSrc('https://placehold.co/600x600?text=No+Image')}
                            className="max-h-[500px] w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                        {!product.stock && (
                            <div className="absolute top-6 right-6 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="mb-2">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                                {product.category}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-gray-800">{product.rating?.rate ?? product.rating ?? 4.5}</span>
                                <span className="text-gray-400 text-sm">({product.rating?.count || 0} reviews)</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Currently Unavailable'}
                            </span>
                        </div>

                        <div className="text-4xl font-bold text-gray-900 mb-8 flex items-baseline gap-2">
                            ₹{product.price.toLocaleString('en-IN')}
                            <span className="text-lg text-gray-400 font-normal line-through">
                                ₹{(product.price * 1.2).toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                20% OFF
                            </span>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                            {product.description || "Experience premium quality with this amazing product. Designed for comfort and durability, it's the perfect addition to your collection."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Truck size={20} />
                                </div>
                                <span>Free Delivery</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <ShieldCheck size={20} />
                                </div>
                                <span>1 Year Warranty</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <RefreshCw size={20} />
                                </div>
                                <span>30 Days Return</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={() => onAddToCart(product)}
                                disabled={!product.stock}
                                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${product.stock
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingCart size={24} />
                                {product.stock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Reviews Section */}
            <ReviewSection productId={product.id || product._id} userToken={localStorage.getItem('token')} />

            {/* Similar Products Section */}
            {products && products.length > 0 && (
                <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products
                            .filter(p => p.category === product.category && p._id !== product._id)
                            .slice(0, 4)
                            .map(similarProduct => (
                                <ProductCard
                                    key={similarProduct._id}
                                    product={similarProduct}
                                    onAddToCart={onAddToCart}
                                    onProductClick={() => onProductClick && onProductClick(similarProduct)}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
