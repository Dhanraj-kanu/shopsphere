import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const ResetPassword = ({ token, onBack, onSuccess }) => {
    const [resetToken, setResetToken] = useState(token || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`/api/auth/resetpassword/${resetToken}`, { password });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full text-center">
                <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-sm">You can now login with your new password.</p>
                <div className="mt-4 text-xs text-gray-400">Redirecting to login...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Lock className="text-purple-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-500 mb-6 text-center text-sm">Enter your token and new password.</p>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm w-full">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {!token && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            placeholder="Paste token here"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
            <button onClick={onBack} className="mt-4 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
        </div>
    );
};

export default ResetPassword;
