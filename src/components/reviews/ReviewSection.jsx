import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Filter, SlidersHorizontal } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const ReviewSection = ({ productId, userToken }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Filters
    const [ratingFilter, setRatingFilter] = useState('');
    const [hasImages, setHasImages] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sort, setSort] = useState('recent');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (ratingFilter) params.append('rating', ratingFilter);
            if (hasImages) params.append('hasImages', 'true');
            if (verifiedOnly) params.append('verifiedOnly', 'true');
            if (sort) params.append('sort', sort);

            const { data } = await axios.get(`/api/reviews/${productId}?${params.toString()}`);
            setReviews(data.reviews);
            setStats(data.stats);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId, ratingFilter, hasImages, verifiedOnly, sort]);

    const handleReviewAdded = () => {
        setShowForm(false);
        fetchReviews(); // Refresh list to include new review
    };

    if (loading && !stats) return <div className="py-12 text-center text-gray-500 animate-pulse">Loading amazing reviews...</div>;

    return (
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Breakdown & Submit */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Overall Summary */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="text-6xl font-black text-gray-900 mb-2">{stats?.avgRating || '0.0'}</div>
                        <div className="flex justify-center text-yellow-400 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className={`w-6 h-6 ${star <= Math.round(stats?.avgRating || 0) ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm mb-6">Based on {stats?.totalReviews || 0} reviews</p>

                        {stats?.sentimentSummary && (
                            <div className="bg-green-50 text-green-700 font-medium py-2 px-4 rounded-xl text-sm border border-green-100 inline-block mb-6">
                                ✨ {stats.sentimentSummary}
                            </div>
                        )}

                        {/* Breakdown Bars */}
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(star => {
                                const percentage = stats?.ratingDistribution?.[star] || 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 w-12 text-gray-600 font-medium whitespace-nowrap">
                                            {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-10 text-right text-gray-400 text-xs font-bold">{percentage}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {!showForm ? (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-3xl border border-green-100 text-center shadow-inner">
                            <h3 className="font-bold text-xl text-gray-900 mb-2">Share your thoughts</h3>
                            <p className="text-gray-600 text-sm mb-6">Help other customers by sharing your experience with this product.</p>
                            <button
                                onClick={() => userToken ? setShowForm(true) : alert("Please log in to review")}
                                className="w-full py-4 bg-white text-gray-900 border-2 border-gray-900 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md active:scale-95"
                            >
                                Write a Review
                            </button>
                        </div>
                    ) : (
                        <ReviewForm productId={productId} userToken={userToken} onReviewAdded={handleReviewAdded} />
                    )}
                </div>

                {/* Right Column: Filters & List */}
                <div className="lg:col-span-2">
                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Filter size={18} />
                            <span className="font-bold">Filters:</span>
                        </div>

                        <div className="flex flex-wrap gap-2 flex-1">
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2"
                            >
                                <option value="">All Stars</option>
                                <option value="5">5 Stars only</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>

                            <button
                                onClick={() => setVerifiedOnly(!verifiedOnly)}
                                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${verifiedOnly ? 'bg-green-50 text-green-700 border-green-200 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                Verified Only
                            </button>

                            <button
                                onClick={() => setHasImages(!hasImages)}
                                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${hasImages ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                With Images
                            </button>
                        </div>

                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                            <SlidersHorizontal size={18} className="text-gray-400" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-transparent text-gray-700 text-sm font-medium focus:ring-0 outline-none cursor-pointer"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="helpful">Most Helpful</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        {loading && reviews.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">Loading reviews...</div>
                        ) : reviews.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {reviews.map(review => (
                                    <ReviewCard key={review._id} review={review} userToken={userToken} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="text-gray-300 mb-4 inline-block p-6 bg-gray-50 rounded-full">
                                    <Star className="w-12 h-12" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h4>
                                <p className="text-gray-500">Try adjusting your filters or be the first to leave a review!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
