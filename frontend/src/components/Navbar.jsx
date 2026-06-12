import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout, user } = useAuth();

    return (
        <nav className="bg-neutral-900 border-b border-neutral-700 text-white px-6 py-4 flex justify-between items-center transition-all duration-300">
            <div className="flex items-center gap-3">
                {/*<div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-500/20">L</div>*/}
                <Link to="/dashboard" className="text-xl font-bold tracking-tight hover:text-teal-500 transition">LinkFlow</Link>
            </div>
            {user && (
                <div className="flex items-center gap-6">
                    <span className="text-neutral-400 text-sm font-medium">{user.email}</span>
                    <button 
                        onClick={logout} 
                        className="text-neutral-400 hover:text-white text-sm font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
