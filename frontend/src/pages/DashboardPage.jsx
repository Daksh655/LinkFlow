import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateUrlForm from '../components/CreateUrlForm';
import UrlTable from '../components/UrlTable';
import { getUrls } from '../services/urlService';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUrls = async () => {
        try {
            setLoading(true);
            const data = await getUrls();
            setUrls(data);
        } catch (err) {
            toast.error('Failed to load your URLs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    const handleUrlCreated = () => {
        fetchUrls();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500/30">
            <Navbar />
            
            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 mt-4 lg:mt-8">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">Dashboard</h1>
                    <p className="text-gray-400 text-lg">Manage your shortened URLs and track their real-time performance.</p>
                </div>

                <CreateUrlForm onUrlCreated={handleUrlCreated} />

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-12">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Your Links</h2>
                        <p className="text-sm text-gray-400 mt-1">View and manage all your shortened links.</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-400 mr-2">Total URLs:</span>
                        <span className="text-lg font-bold text-blue-400">{urls.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="text-gray-400 animate-pulse">Loading your dashboard...</p>
                        </div>
                    </div>
                ) : (
                    <UrlTable urls={urls} setUrls={setUrls} />
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
