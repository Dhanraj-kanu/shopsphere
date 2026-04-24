import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, KeyRound, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = ({ onBack, onTokenReceived, switchToReset }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await axios.post('/api/auth/forgotpassword', { email });
            setSuccess(true);
            setResetToken(res.data.resetToken);
            if (onTokenReceived) onTokenReceived(res.data.resetToken);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full">
            <div className="w-full flex justify-start mb-4">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back to Login</button>
            </div>

            <div className="bg-blue-100 p-3 rounded-full mb-4">
                <KeyRound className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
            <p className="text-gray-500 mb-6 text-center text-sm">Enter your email to receive a reset token.</p>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm w-full">{error}</div>}

            {!success ? (
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            ) : (
                <div className="w-full text-center">
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 text-sm break-all">
                        <p className="font-bold mb-2 flex items-center justify-center gap-2"><CheckCircle size={16} /> Token Generated!</p>
                        <p className="text-xs text-gray-600 mb-2">For development, copy this token:</p>
                        <code className="bg-white px-2 py-1 rounded border border-green-200 select-all block mb-3 text-xs">{resetToken}</code>
                        <button onClick={() => switchToReset(resetToken)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-green-700">Proceed to Reset Password</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
