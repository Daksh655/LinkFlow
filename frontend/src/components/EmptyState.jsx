import React from 'react';

const EmptyState = () => {
    return (
        <div className="bg-[#111111] p-16 rounded-[16px] border border-dashed border-[#262626] text-center shadow-sm max-w-2xl mx-auto my-12">
            <div className="flex justify-center mb-8">
                <div className="bg-[#0A0A0A] border border-[#262626] p-6 rounded-full shadow-inner">
                    <svg className="w-16 h-16 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
            </div>
            <h3 className="text-3xl font-bold text-[#FFFFFF] mb-4">No URLs Yet</h3>
            <p className="text-[#A3A3A3] max-w-sm mx-auto text-lg leading-relaxed mb-8">
                Create your first shortened URL to start tracking clicks and managing links.
            </p>
        </div>
    );
};

export default EmptyState;
