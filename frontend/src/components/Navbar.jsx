import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout, user } = useAuth();

    return (
        <nav className="bg-gray-800 border-b border-gray-700 text-white shadow-lg px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-xl">L</div>
                <Link to="/dashboard" className="text-xl font-bold tracking-wide">LinkFlow</Link>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-gray-400 text-sm">{user?.email}</span>
                <button 
                    onClick={logout} 
                    className="text-gray-300 hover:text-white transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
