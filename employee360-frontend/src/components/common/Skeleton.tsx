import { cn } from '../../utils/cn';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200',
                variant === 'text' && 'h-4 w-full rounded',
                variant === 'rectangular' && 'rounded-xl',
                variant === 'circular' && 'rounded-full',
                className
            )}
        />
    );
}

export function SkeletonField({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

export default Skeleton;
