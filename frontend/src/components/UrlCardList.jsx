import React, { useState } from 'react';
import { deleteUrl } from '../services/urlService';
import toast from 'react-hot-toast';
import AnalyticsModal from './AnalyticsModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmptyState from './EmptyState';

const UrlCardList = ({ urls, setUrls, onUrlClicked }) => {
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

    const handleShortUrlClick = () => {
        if (onUrlClicked) {
            setTimeout(() => {
                onUrlClicked();
            }, 1500);
        }
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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {urls.map((url) => (
                    <div 
                        key={url.id} 
                        className="bg-[#111111] rounded-[16px] border border-[#262626] p-[24px] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#14B8A6]/5 transition-all duration-300 flex flex-col"
                    >
                        {/* SECTION 1: Top Row */}
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-3 overflow-hidden pr-3">
                                <div className="bg-[#262626] p-2 rounded-lg shrink-0">
                                    <svg className="w-5 h-5 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-[#FFFFFF] truncate" title={url.customAlias || url.shortCode}>
                                    {url.customAlias || url.shortCode}
                                </h3>
                            </div>
                            <span className="bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-bold px-3 py-1.5 rounded-full border border-[#14B8A6]/20 shrink-0">
                                Active
                            </span>
                        </div>

                        {/* SECTION 2: Short URL */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-widest mb-1.5">Short URL</label>
                            <div className="flex justify-between items-center bg-[#0A0A0A] border border-[#262626] rounded-xl p-3">
                                <a 
                                    href={url.shortUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={handleShortUrlClick}
                                    className="text-[#14B8A6] font-semibold text-lg hover:text-[#0D9488] hover:underline truncate mr-3"
                                >
                                    {url.shortUrl}
                                </a>
                                <button 
                                    onClick={() => handleCopy(url.shortUrl, url.id)}
                                    className={`p-2 rounded-lg transition-colors shrink-0 ${copiedId === url.id ? 'bg-[#14B8A6]/20 text-[#14B8A6]' : 'bg-[#262626] text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#333333]'}`}
                                    title="Copy"
                                >
                                    {copiedId === url.id ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 3: Original URL */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-widest mb-1.5">Original URL</label>
                            <p className="text-[#FFFFFF] text-sm truncate opacity-90" title={url.originalUrl}>
                                {url.originalUrl}
                            </p>
                        </div>

                        {/* SECTION 4: Stats Row */}
                        <div className="flex justify-between items-center mb-6 pt-5 border-t border-[#262626]">
                            <div>
                                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-widest mb-1.5">Clicks</label>
                                <p className="text-[#FFFFFF] font-black text-xl">{url.clickCount}</p>
                            </div>
                            <div className="text-right">
                                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-widest mb-1.5">Created</label>
                                <p className="text-[#FFFFFF] font-medium text-base">{new Date(url.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* SECTION 5: Action Buttons */}
                        <div className="mt-auto flex gap-3 pt-2">
                            <button 
                                onClick={() => handleCopy(url.shortUrl, url.id)}
                                className="flex-1 bg-transparent border border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6]/10 py-2.5 rounded-xl font-bold text-sm transition-colors text-center"
                            >
                                Copy
                            </button>
                            <button 
                                onClick={() => setAnalyticsModalState({ isOpen: true, urlId: url.id })}
                                className="flex-1 bg-[#14B8A6] hover:bg-[#0D9488] text-[#FFFFFF] py-2.5 rounded-xl font-bold text-sm transition-colors text-center shadow-md shadow-[#14B8A6]/20"
                            >
                                Analytics
                            </button>
                            <button 
                                onClick={() => setDeleteModalState({ isOpen: true, urlId: url.id })}
                                className="flex-1 bg-[#DC2626] hover:bg-red-700 text-[#FFFFFF] py-2.5 rounded-xl font-bold text-sm transition-colors text-center shadow-md shadow-[#DC2626]/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
        </>
    );
};

export default UrlCardList;
