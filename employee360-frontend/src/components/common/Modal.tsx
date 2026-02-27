import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'xl' | 'lg' | '2xl' | 'full';
    closeOnOverlayClick?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnOverlayClick = true,
}: ModalProps) {

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        xl: 'max-w-xl',
        lg: 'max-w-2xl',
        '2xl': 'max-w-4xl',
        full: 'max-w-full m-4',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden flex flex-col',
                    'animate-slide-up transform transition-all',
                    sizeClasses[size]
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8EB] bg-white">
                        <h2 className="text-[16px] font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors rounded-full p-1 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Without title header, just need a close button */}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors rounded-full p-1 hover:bg-gray-100 z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Body */}
                <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-[#E5E8EB] flex items-center justify-end space-x-3 bg-white">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
