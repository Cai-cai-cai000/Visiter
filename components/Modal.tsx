import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                        <i className="fa fa-times text-lg"></i>
                    </button>
                </div>
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
