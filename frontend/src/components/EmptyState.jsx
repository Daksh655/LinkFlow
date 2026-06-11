import React from 'react';

const EmptyState = () => {
    return (
        <div className="bg-gray-800 p-12 rounded-xl border border-dashed border-gray-600 text-center shadow-sm">
            <div className="flex justify-center mb-4">
                <div className="bg-gray-700 p-4 rounded-full">
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No URLs created yet.</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
                Create your first short URL using the form above to start tracking your links and building your dashboard.
            </p>
        </div>
    );
};

export default EmptyState;
