import React, { useState, useEffect } from 'react';
import { createUrl } from '../services/urlService';
import toast from 'react-hot-toast';

const CreateUrlModal = ({ isOpen, onClose, onUrlCreated }) => {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = { originalUrl };
            if (customAlias.trim()) {
                data.customAlias = customAlias.trim();
            }
            const newUrl = await createUrl(data);
            
            toast.success('URL created successfully!');
            setOriginalUrl('');
            setCustomAlias('');
            onUrlCreated(newUrl);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create URL');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[#111111] rounded-[16px] shadow-2xl w-full max-w-lg border border-[#262626] overflow-hidden transform scale-100 transition-transform duration-300 p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[#FFFFFF]">Create Short URL</h2>
                    <button 
                        onClick={onClose}
                        className="text-[#A3A3A3] hover:text-[#FFFFFF] transition rounded-full p-2 hover:bg-[#262626]"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[#A3A3A3] mb-2 uppercase tracking-widest">Original URL</label>
                        <input 
                            type="url" 
                            placeholder="https://example.com/very/long/path"
                            className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 text-[#FFFFFF] focus:ring-2 focus:ring-[#14B8A6] focus:border-[#14B8A6] outline-none transition"
                            value={originalUrl}
                            onChange={(e) => setOriginalUrl(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#A3A3A3] mb-2 uppercase tracking-widest">Custom Alias <span className="font-normal opacity-70">(Optional)</span></label>
                        <input 
                            type="text" 
                            placeholder="my-custom-name"
                            className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 text-[#FFFFFF] focus:ring-2 focus:ring-[#14B8A6] focus:border-[#14B8A6] outline-none transition"
                            value={customAlias}
                            onChange={(e) => setCustomAlias(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[#262626]">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 bg-transparent hover:bg-[#262626] text-[#A3A3A3] hover:text-[#FFFFFF] font-bold rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-8 py-3.5 bg-[#14B8A6] hover:bg-[#0D9488] disabled:bg-[#14B8A6]/50 disabled:cursor-not-allowed text-[#FFFFFF] font-bold rounded-xl transition duration-200 shadow-lg shadow-[#14B8A6]/20 flex items-center justify-center min-w-[140px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : 'Create URL'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUrlModal;
