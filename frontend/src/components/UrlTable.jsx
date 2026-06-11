import React, { useState } from 'react';
import { deleteUrl } from '../services/urlService';

const UrlTable = ({ urls, setUrls }) => {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (shortUrl, id) => {
        navigator.clipboard.writeText(shortUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this URL?")) return;
        
        try {
            await deleteUrl(id);
            setUrls(urls.filter(url => url.id !== id));
        } catch (err) {
            alert('Failed to delete URL');
        }
    };

    if (!urls || urls.length === 0) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg border border-dashed border-gray-600 text-center text-gray-400">
                You haven't created any short URLs yet.
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-4">Original URL</th>
                        <th className="px-6 py-4">Short URL</th>
                        <th className="px-6 py-4 text-center">Clicks</th>
                        <th className="px-6 py-4 text-center">Created</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {urls.map((url) => (
                        <tr key={url.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                            <td className="px-6 py-4 font-medium text-white truncate max-w-xs" title={url.originalUrl}>
                                {url.originalUrl}
                            </td>
                            <td className="px-6 py-4 text-blue-400">
                                <a href={url.shortUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                    {url.shortCode}
                                </a>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="bg-gray-700 px-3 py-1 rounded-full font-bold text-gray-300">{url.clickCount}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-400">
                                {new Date(url.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                                <button 
                                    onClick={() => handleCopy(url.shortUrl, url.id)}
                                    className="text-gray-400 hover:text-white transition"
                                    title="Copy to clipboard"
                                >
                                    {copiedId === url.id ? (
                                        <span className="text-green-400 text-xs font-bold">Copied!</span>
                                    ) : (
                                        "Copy"
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleDelete(url.id)}
                                    className="text-red-400 hover:text-red-300 transition"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UrlTable;
