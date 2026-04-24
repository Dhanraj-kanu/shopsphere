import React from 'react';
import { Star } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onProductClick }) => {
    const [imgSrc, setImgSrc] = React.useState(product.image);

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full group/card">
            <div
                className="relative pt-[100%] bg-gray-50 group cursor-pointer overflow-hidden"
                onClick={() => onProductClick && onProductClick(product)}
            >
                <img
                    src={imgSrc}
                    alt={product.name}
                    onError={() => setImgSrc('https://placehold.co/400x400?text=No+Image')}
                    className="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {!product.stock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full w-fit mb-2">
                    {product.category}
                </div>

                <h3
                    className="font-semibold text-gray-800 line-clamp-2 mb-1 flex-grow cursor-pointer hover:text-green-600 transition-colors"
                    title={product.name}
                    onClick={() => onProductClick && onProductClick(product)}
                >
                    {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{product.rating?.rate ?? product.rating ?? 0}</span>
                    <span className="text-xs text-gray-400">({product.rating?.count || 0})</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="text-lg font-bold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                    </div>
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.stock}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${product.stock
                            ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
