import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/urlService';
import toast from 'react-hot-toast';

const AnalyticsModal = ({ isOpen, onClose, urlId }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !urlId) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await getAnalytics(urlId);
                setAnalytics(data);
            } catch (error) {
                toast.error('Error loading analytics');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [isOpen, urlId, onClose]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white">URL Analytics</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition rounded-full p-1 hover:bg-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : analytics ? (
                        <div className="space-y-4 text-sm text-gray-300">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Original URL</label>
                                <p className="truncate text-white bg-gray-900 p-3 rounded border border-gray-700" title={analytics.originalUrl}>{analytics.originalUrl}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Short Code</label>
                                    <p className="text-xl font-bold text-blue-400">{analytics.shortCode}</p>
                                </div>
                                <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Clicks</label>
                                    <p className="text-xl font-bold text-emerald-400">{analytics.clickCount}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created</label>
                                    <p className="text-white">{new Date(analytics.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Accessed</label>
                                    <p className="text-white">
                                        {analytics.lastAccessed ? new Date(analytics.lastAccessed).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
                
                <div className="bg-gray-900/50 p-4 border-t border-gray-700 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsModal;
