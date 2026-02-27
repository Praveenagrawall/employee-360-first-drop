import type { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

export interface EmptyStateProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon,
    title = 'No Data Found',
    description = 'There is currently no data to display in this view.',
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                {icon || <FileQuestion className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button onClick={onAction} variant="outline" size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
