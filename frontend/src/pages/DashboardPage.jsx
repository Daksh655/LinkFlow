import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-6xl mx-auto p-6 mt-8">
                <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
                    <h1 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h1>
                    <p className="text-gray-400 mb-8">Logged in as <span className="text-blue-400 font-medium">{user?.email}</span></p>
                    
                    <div className="bg-gray-700/50 rounded p-8 border border-dashed border-gray-600 text-center">
                        <p className="text-gray-400 text-lg">URL Table Placeholder</p>
                        <p className="text-gray-500 text-sm mt-2">The URL management UI will be built in a future step.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
