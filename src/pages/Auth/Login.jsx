import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = ({ switchToSignup, onSuccess, onForgot }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);
        if (result.success) {
            onSuccess();
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto w-full">
            <div className="bg-green-100 p-3 rounded-full mb-4">
                <LogIn className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-6 text-center text-sm">Sign in to access your orders and profile</p>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm w-full">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button onClick={onForgot} className="text-gray-500 text-sm hover:text-green-600 transition-colors">
                    Forgot Password?
                </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={switchToSignup} className="text-green-600 font-bold hover:underline">
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default Login;
