import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RatingStarsProps {
    rating: number; // 1-5 (can be decimal)
    max?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isInteractive?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

export function RatingStars({
    rating,
    max = 5,
    size = 'md',
    isInteractive = false,
    onChange,
    className
}: RatingStarsProps) {

    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-7 h-7',
    };

    const displayRating = hoverRating !== null ? hoverRating : rating;

    return (
        <div
            className={cn('flex items-center', isInteractive ? 'cursor-pointer' : '', className)}
            onMouseLeave={() => isInteractive && setHoverRating(null)}
        >
            {Array.from({ length: max }).map((_, i) => {
                const starValue = i + 1;
                const isFullStar = displayRating >= starValue;
                const isHalfStar = !isFullStar && displayRating >= starValue - 0.5;

                // Define color based on standard feedback colors (warning = yellow/gold)
                const starColor = 'text-amber-400';
                const emptyColor = 'text-gray-300';

                return (
                    <div
                        key={i}
                        className="relative"
                        onMouseEnter={() => isInteractive && setHoverRating(starValue)}
                        onClick={() => isInteractive && onChange?.(starValue)}
                    >
                        {/* Background empty star */}
                        <Star
                            className={cn(sizeClasses[size], emptyColor, 'fill-current')}
                        />

                        {/* Foreground filled/half star overlaid */}
                        {(isFullStar || isHalfStar) && (
                            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: isHalfStar ? '50%' : '100%' }}>
                                <Star
                                    className={cn(sizeClasses[size], starColor, 'fill-current')}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
