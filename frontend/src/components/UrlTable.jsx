import React, { useState } from 'react';
import { deleteUrl } from '../services/urlService';
import toast from 'react-hot-toast';
import AnalyticsModal from './AnalyticsModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmptyState from './EmptyState';

const UrlTable = ({ urls, setUrls }) => {
    const [copiedId, setCopiedId] = useState(null);
    const [analyticsModalState, setAnalyticsModalState] = useState({ isOpen: false, urlId: null });
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, urlId: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCopy = (shortUrl, id) => {
        navigator.clipboard.writeText(shortUrl);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const confirmDelete = async () => {
        if (!deleteModalState.urlId) return;
        setIsDeleting(true);
        try {
            await deleteUrl(deleteModalState.urlId);
            setUrls(urls.filter(url => url.id !== deleteModalState.urlId));
            toast.success('URL deleted successfully');
        } catch (err) {
            toast.error('Failed to delete URL');
        } finally {
            setIsDeleting(false);
            setDeleteModalState({ isOpen: false, urlId: null });
        }
    };

    if (!urls || urls.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300 whitespace-nowrap">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-5 font-semibold tracking-wider">Original URL</th>
                            <th className="px-6 py-5 font-semibold tracking-wider">Short URL</th>
                            <th className="px-6 py-5 text-center font-semibold tracking-wider">Clicks</th>
                            <th className="px-6 py-5 text-center font-semibold tracking-wider">Created</th>
                            <th className="px-6 py-5 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {urls.map((url) => (
                            <tr key={url.id} className="hover:bg-gray-700/40 transition duration-150">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white truncate max-w-[200px] lg:max-w-xs" title={url.originalUrl}>
                                        {url.originalUrl}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <a href={url.shortUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition">
                                            {url.shortCode}
                                        </a>
                                        <button 
                                            onClick={() => handleCopy(url.shortUrl, url.id)}
                                            className={`p-1.5 rounded transition ${copiedId === url.id ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600 hover:text-white'}`}
                                            title="Copy"
                                        >
                                            {copiedId === url.id ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full font-bold text-gray-300">
                                        {url.clickCount}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-400">
                                    {new Date(url.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setAnalyticsModalState({ isOpen: true, urlId: url.id })}
                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded font-medium text-xs transition border border-blue-500/20"
                                        >
                                            Analytics
                                        </button>
                                        <button 
                                            onClick={() => setDeleteModalState({ isOpen: true, urlId: url.id })}
                                            className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded font-medium text-xs transition border border-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AnalyticsModal 
                isOpen={analyticsModalState.isOpen} 
                onClose={() => setAnalyticsModalState({ isOpen: false, urlId: null })} 
                urlId={analyticsModalState.urlId} 
            />
            
            <ConfirmDeleteModal 
                isOpen={deleteModalState.isOpen} 
                onClose={() => setDeleteModalState({ isOpen: false, urlId: null })} 
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default UrlTable;
