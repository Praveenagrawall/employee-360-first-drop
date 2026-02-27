import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function InlineLoader({ size = 'md', className }: LoaderProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    return (
        <Loader2
            className={cn('animate-spin text-primary', sizeClasses[size], className)}
        />
    );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
            <InlineLoader size="xl" className="mb-4" />
            <p className="text-text-secondary font-medium animate-pulse">{message}</p>
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('bg-surface rounded-card shadow-card p-6 animate-pulse', className)}>
            <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );
}
