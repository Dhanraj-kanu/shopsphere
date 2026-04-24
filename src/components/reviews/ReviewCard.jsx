import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import axios from 'axios';

const ReviewCard = ({ review, userToken }) => {
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
    const [voteStatus, setVoteStatus] = useState(null); // 'helpful' or 'not-helpful'
    const [isReported, setIsReported] = useState(review.reported || false);

    const handleVote = async (type) => {
        if (!userToken) return alert('Please login to vote on reviews');
        if (voteStatus === type) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${userToken}` }
            };
            await axios.put(`/api/reviews/${review._id}/${type}`, {}, config);

            if (type === 'helpful') {
                setHelpfulCount(prev => prev + 1);
                if (voteStatus === 'not-helpful') {
                    // Removing a not-helpful vote doesn't strictly affect helpfulCount in our simple DB, 
                    // but UX wise we swap states.
                }
            } else {
                if (voteStatus === 'helpful') {
                    setHelpfulCount(prev => Math.max(0, prev - 1));
                }
            }
            setVoteStatus(type);
        } catch (error) {
            console.error("Vote failed", error);
        }
    };

    const handleReport = async () => {
        if (!userToken) return alert('Please login to report reviews');
        if (isReported) return;

        try {
            const config = { headers: { Authorization: `Bearer ${userToken}` } };
            await axios.post(`/api/reviews/${review._id}/report`, {}, config);
            setIsReported(true);
            alert('Review reported. An admin will review it.');
        } catch (error) {
            console.error("Report failed", error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'Positive': return 'bg-green-100 text-green-700 border-green-200';
            case 'Negative': return 'bg-red-100 text-red-700 border-red-200';
            case 'Neutral': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="border-b border-gray-200 py-6 last:border-0 relative bg-white">

            {/* 1. User Name */}
            <div className="font-bold text-gray-900 mb-1 flex justify-between items-start">
                <span>{review.user?.name || 'Anonymous User'}</span>
                <span className="text-sm font-normal text-gray-400">{formatDate(review.createdAt)}</span>
            </div>

            {/* 2. Verified Purchase */}
            {review.verifiedPurchase && (
                <div className="flex items-center gap-1 text-sm font-bold text-green-600 mb-3">
                    <CheckCircle className="w-4 h-4" /> Verified Purchase
                </div>
            )}

            {/* 3. Star Rating & Sentiment */}
            <div className="flex items-center gap-3 mb-2">
                <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                </div>
                {review.sentiment && review.sentiment !== 'Unclassified' && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getSentimentColor(review.sentiment)}`}>
                        {review.sentiment}
                    </span>
                )}
            </div>

            {/* 4. Title */}
            <h4 className="font-bold text-gray-900 text-base mb-2">{review.title}</h4>

            {/* 5. Comment */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>

            {/* 6. Images array */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-3 mb-6">
                    {review.images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt="review upload"
                            className="w-24 h-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, '_blank')}
                        />
                    ))}
                </div>
            )}

            {/* 7. Helpful Action */}
            <div className="flex items-center gap-4 text-sm mt-4">
                <button
                    onClick={() => handleVote('helpful')}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${voteStatus === 'helpful' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <ThumbsUp className={`w-4 h-4 ${voteStatus === 'helpful' ? 'fill-current' : ''}`} />
                    {helpfulCount} Helpful
                </button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button
                    onClick={handleReport}
                    className={`flex items-center gap-1.5 transition-colors ${isReported ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                    disabled={isReported}
                >
                    <Flag className="w-4 h-4" />
                    {isReported ? 'Reported' : 'Report'}
                </button>
            </div>
        </div>
    );
};

export default ReviewCard;
