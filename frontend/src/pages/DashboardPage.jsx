import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateUrlForm from '../components/CreateUrlForm';
import UrlTable from '../components/UrlTable';
import { getUrls } from '../services/urlService';

const DashboardPage = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUrls = async () => {
        try {
            setLoading(true);
            const data = await getUrls();
            setUrls(data);
        } catch (err) {
            setError('Failed to load your URLs. Please try again later.');
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
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <main className="max-w-6xl mx-auto p-6 mt-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Manage your shortened URLs and track their performance.</p>
                </div>

                <CreateUrlForm onUrlCreated={handleUrlCreated} />

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4 flex justify-between items-end">
                    <h2 className="text-xl font-bold text-gray-200">Your Links</h2>
                    <span className="text-sm text-gray-400">Total: {urls.length}</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <UrlTable urls={urls} setUrls={setUrls} />
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
