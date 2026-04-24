import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Signup = ({ switchToLogin, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // Added phone state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        const result = await signup(name, email, password, phone);
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
                <UserPlus className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6 text-center text-sm">Join us to start shopping smarter</p>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm w-full">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="123-456-7890"
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={switchToLogin} className="text-green-600 font-bold hover:underline">
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default Signup;
