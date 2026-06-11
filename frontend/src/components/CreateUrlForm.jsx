import React, { useState } from 'react';
import { createUrl } from '../services/urlService';

const CreateUrlForm = ({ onUrlCreated }) => {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = { originalUrl };
            if (customAlias.trim()) {
                data.customAlias = customAlias.trim();
            }
            const newUrl = await createUrl(data);
            setSuccess('URL created successfully!');
            setOriginalUrl('');
            setCustomAlias('');
            onUrlCreated(newUrl);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create URL.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Shorten New URL</h2>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
            {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded mb-4 text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Original URL</label>
                    <input 
                        type="url" 
                        placeholder="https://example.com"
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        required 
                    />
                </div>
                <div className="md:w-1/3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Custom Alias (Optional)</label>
                    <input 
                        type="text" 
                        placeholder="my-alias"
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2.5 px-6 rounded transition duration-200"
                    >
                        {loading ? 'Creating...' : 'Create URL'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUrlForm;
