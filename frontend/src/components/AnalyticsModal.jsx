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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md border border-neutral-700 overflow-hidden transform scale-100 transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-neutral-700 bg-neutral-900/50">
                    <h3 className="text-xl font-bold text-white">URL Analytics</h3>
                    <button 
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition rounded-full p-1 hover:bg-neutral-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                    ) : analytics ? (
                        <div className="space-y-5 text-sm text-neutral-400">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-neutral-400">Original URL</label>
                                <p className="truncate text-white bg-neutral-900 p-3.5 rounded-lg border border-neutral-700" title={analytics.originalUrl}>
                                    {analytics.originalUrl}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-700 text-center">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-neutral-400">Short Code</label>
                                    <p className="text-xl font-bold text-teal-500">{analytics.shortCode}</p>
                                </div>
                                <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-700 text-center">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-neutral-400">Total Clicks</label>
                                    <p className="text-xl font-bold text-emerald-400">{analytics.clickCount}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700/50">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Created</label>
                                    <p className="text-white font-medium">{new Date(analytics.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700/50">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-neutral-400">Last Accessed</label>
                                    <p className="text-white font-medium">
                                        {analytics.lastAccessed ? new Date(analytics.lastAccessed).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
                
                <div className="bg-neutral-900 p-5 border-t border-neutral-700 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-neutral-700 hover:bg-gray-600 text-white rounded-lg font-medium transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsModal;
