import React, { useState } from 'react';
import { createUrl } from '../services/urlService';
import toast from 'react-hot-toast';

const CreateUrlForm = ({ onUrlCreated }) => {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [loading, setLoading] = useState(false);

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
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl border border-gray-700 mb-8 transition-all">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Shorten New URL</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-5">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Original URL</label>
                    <input 
                        type="url" 
                        placeholder="https://example.com/very/long/path"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        required 
                    />
                </div>
                <div className="md:w-1/3">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Custom Alias <span className="text-gray-500 font-normal">(Optional)</span></label>
                    <input 
                        type="text" 
                        placeholder="my-custom-name"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full md:w-auto h-[50px] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold px-8 rounded-lg transition duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center min-w-[140px]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </div>
                        ) : 'Create URL'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUrlForm;
