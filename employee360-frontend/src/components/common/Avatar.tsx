import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn, getInitials } from '../../utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    status?: 'online' | 'offline' | 'busy' | 'away';
    level?: number;
}

const levelColors: Record<number, { bg: string, text: string }> = {
    1: { bg: 'bg-blue-50', text: 'text-blue-600' },
    2: { bg: 'bg-blue-100', text: 'text-blue-700' },
    3: { bg: 'bg-blue-200', text: 'text-blue-800' },
    4: { bg: 'bg-violet-600', text: 'text-white' },
    5: { bg: 'bg-violet-600', text: 'text-white' },
    6: { bg: 'bg-violet-600', text: 'text-white' },
    7: { bg: 'bg-kpmg-blue', text: 'text-white' },
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, name, size = 'md', status, level, ...props }, ref) => {
        const initials = getInitials(name);

        // Use level colors if provided, otherwise fallback to name-based hash
        const levelStyle = level ? levelColors[level] : null;

        const sizeClasses = {
            'xs': 'w-6 h-6 text-[10px]',
            'sm': 'w-8 h-8 text-xs',
            'md': 'w-10 h-10 text-sm',
            'lg': 'w-12 h-12 text-base',
            'xl': 'w-16 h-16 text-lg',
            '2xl': 'w-24 h-24 text-2xl',
        };

        const statusColors = {
            online: 'bg-green-500',
            offline: 'bg-gray-400',
            busy: 'bg-red-500',
            away: 'bg-yellow-500',
        };

        return (
            <div className={cn('relative inline-block', className)} ref={ref} {...props}>
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full overflow-hidden font-medium border-2 border-surface',
                        sizeClasses[size],
                        !src && (levelStyle ? levelStyle.bg : 'bg-blue-600'),
                        !src && (levelStyle ? levelStyle.text : 'text-white')
                    )}
                >
                    {src ? (
                        <img
                            src={src}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Flash fallback if image breaks
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.classList.add(levelStyle ? levelStyle.bg : 'bg-blue-600');
                                // Can't easily inject initials here pure reactively without state,
                                // but tailwind will show background color at least.
                            }}
                        />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>

                {status && (
                    <span
                        className={cn(
                            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface',
                            statusColors[status],
                            {
                                'w-1.5 h-1.5': size === 'xs',
                                'w-2 h-2': size === 'sm',
                                'w-2.5 h-2.5': size === 'md' || size === 'lg',
                                'w-3.5 h-3.5': size === 'xl',
                                'w-5 h-5': size === '2xl',
                            }
                        )}
                    />
                )}
            </div>
        );
    }
);

Avatar.displayName = 'Avatar';
