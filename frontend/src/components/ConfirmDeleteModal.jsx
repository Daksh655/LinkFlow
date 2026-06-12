import React, { useEffect } from 'react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    
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
                className="bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm border border-neutral-700 overflow-hidden transform scale-100 transition-transform duration-300 p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center mb-5">
                    <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 shadow-inner">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-white mb-3">Delete this URL?</h3>
                <p className="text-neutral-400 text-center mb-8 text-sm leading-relaxed">
                    This action cannot be undone. The URL will be permanently removed and no longer redirect.
                </p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-50 text-white border border-neutral-700 rounded-lg font-medium transition duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg font-medium transition duration-200 flex justify-center items-center shadow-lg shadow-red-500/20"
                    >
                        {isDeleting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
