import React from 'react';



const CategoryFilter = ({ categories, activeCategory, onSelectCategory }) => {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${activeCategory === cat
                        ? 'bg-green-600 text-white shadow-md transform scale-105'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:border-green-200'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
