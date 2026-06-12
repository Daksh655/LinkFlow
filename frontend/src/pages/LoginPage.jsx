import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white selection:bg-teal-500/30">
            <div className="bg-neutral-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-neutral-700 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-teal-500/20">L</div>
                </div>
                <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">Welcome Back</h2>
                
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-lg mb-6 text-sm text-center font-medium">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1.5">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 mt-4 shadow-lg shadow-teal-500/20 flex justify-center items-center h-[52px]"
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Sign In'}
                    </button>
                </form>
                <div className="mt-8 text-center text-neutral-400 text-sm font-medium">
                    Don't have an account? <Link to="/register" className="text-teal-500 hover:text-teal-600 transition ml-1">Create one now</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
