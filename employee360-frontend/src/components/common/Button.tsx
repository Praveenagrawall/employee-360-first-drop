import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    {
                        // Variants
                        'bg-kpmg-blue text-white hover:bg-kpmg-blue-hover active:bg-kpmg-blue-dark focus:ring-blue-300':
                            variant === 'primary',
                        'bg-white border border-[#E5E8EB] shadow-sm text-text-primary hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-200':
                            variant === 'secondary',
                        'border border-kpmg-blue text-kpmg-blue hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-300':
                            variant === 'outline',
                        'text-text-secondary hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300':
                            variant === 'ghost',
                        'bg-status-error text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-300':
                            variant === 'danger',

                        // Sizes
                        'h-8 px-3 text-xs': size === 'sm',
                        'h-10 px-4 text-sm': size === 'md',
                        'h-12 px-6 text-base': size === 'lg',
                    },
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <Loader2 className={cn('animate-spin mr-2', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
                )}
                {!isLoading && leftIcon && (
                    <span className="mr-2 inline-flex items-center">{leftIcon}</span>
                )}
                {children}
                {!isLoading && rightIcon && (
                    <span className="ml-2 inline-flex items-center">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
