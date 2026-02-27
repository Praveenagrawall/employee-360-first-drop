import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverEffect?: boolean;
    accentColor?: string; // e.g., 'primary', 'success', 'warning', 'error', 'accent'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, padding = 'md', hoverEffect = false, accentColor, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-surface rounded-card shadow-card relative overflow-hidden',
                    hoverEffect && 'transition-shadow duration-200 hover:shadow-card-hover ease-out',
                    {
                        'p-0': padding === 'none',
                        'p-4': padding === 'sm',
                        'p-6': padding === 'md',
                        'p-8': padding === 'lg',

                        // Accent left border using absolute positioning
                        'border-l-4': !!accentColor,
                        'border-l-primary': accentColor === 'primary',
                        'border-l-success': accentColor === 'success',
                        'border-l-warning': accentColor === 'warning',
                        'border-l-error': accentColor === 'error',
                        'border-l-accent': accentColor === 'accent',
                        'border-l-secondary': accentColor === 'secondary',
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('mb-4 flex items-center justify-between', className)}
            {...props}
        >
            {children}
        </div>
    )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold text-text-primary leading-tight', className)}
            {...props}
        >
            {children}
        </h3>
    )
);
CardTitle.displayName = 'CardTitle';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('mt-6 pt-4 border-t border-gray-100 flex items-center', className)}
            {...props}
        >
            {children}
        </div>
    )
);
CardFooter.displayName = 'CardFooter';
