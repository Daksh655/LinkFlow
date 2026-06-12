import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateUrlModal from '../components/CreateUrlModal';
import UrlCardList from '../components/UrlCardList';
import { getUrls } from '../services/urlService';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

        const interval = setInterval(() => {
            fetchUrls();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleUrlCreated = (newUrl) => {
        setUrls(prevUrls => [newUrl, ...prevUrls]);
    };

    const totalClicks = urls.reduce((sum, url) => sum + (url.clickCount || 0), 0);

    const refreshUrlsQuietly = async () => {
        try {
            const data = await getUrls();
            setUrls(data);
        } catch (err) {
            // Ignore error on background refresh
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] font-sans selection:bg-[#14B8A6]/30">
            <Navbar />
            
            <main className="max-w-[1400px] mx-auto p-6 sm:p-8 lg:p-10 mt-2">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tight text-[#FFFFFF] mb-3">Dashboard</h1>
                        <p className="text-gray-400 text-lg">Manage your shortened URLs and track their performance.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#14B8A6] hover:bg-[#0D9488] text-[#FFFFFF] font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#14B8A6]/20 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 text-lg whitespace-nowrap"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                        Create URL
                    </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {/* Card 1: Total URLs */}
                    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 hover:-translate-y-1 transition duration-300 shadow-sm flex items-center gap-5">
                        <div className="bg-[#14B8A6]/10 p-4 rounded-xl border border-[#14B8A6]/20">
                            <svg className="w-8 h-8 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Total URLs</p>
                            <h3 className="text-4xl font-black text-[#FFFFFF]">{urls.length}</h3>
                        </div>
                    </div>
                    
                    {/* Card 2: Total Clicks */}
                    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 hover:-translate-y-1 transition duration-300 shadow-sm flex items-center gap-5">
                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Total Clicks</p>
                            <h3 className="text-4xl font-black text-[#FFFFFF]">{totalClicks}</h3>
                        </div>
                    </div>

                    {/* Card 3: Active URLs */}
                    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 hover:-translate-y-1 transition duration-300 shadow-sm flex items-center gap-5">
                        <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Active URLs</p>
                            <h3 className="text-4xl font-black text-[#FFFFFF]">{urls.length}</h3>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#FFFFFF]">Your Links</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-[#111111]/50 rounded-2xl border border-[#262626]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#14B8A6]"></div>
                            <p className="text-[#A3A3A3] animate-pulse font-medium">Loading your links...</p>
                        </div>
                    </div>
                ) : (
                    <UrlCardList urls={urls} setUrls={setUrls} onUrlClicked={refreshUrlsQuietly} />
                )}

            </main>

            <CreateUrlModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onUrlCreated={handleUrlCreated} 
            />
        </div>
    );
};

export default DashboardPage;
