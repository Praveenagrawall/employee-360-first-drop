import { cn } from '../../utils/cn';

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    showValue?: boolean;
    colorClass?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProgressBar({
    value,
    label,
    showValue = true,
    colorClass,
    size = 'md',
    className
}: ProgressBarProps) {

    // Cap between 0-100
    const normalizedValue = Math.min(Math.max(value, 0), 100);

    // Default color based on value thresholds
    let defaultColor = 'bg-primary';
    if (normalizedValue >= 100) defaultColor = 'bg-error';      // Over-allocated
    else if (normalizedValue >= 80) defaultColor = 'bg-warning'; // Near max capacity
    else if (normalizedValue > 0) defaultColor = 'bg-success';   // Healthy allocation
    else defaultColor = 'bg-gray-400';                           // Zero (bench)

    const finalColor = colorClass || defaultColor;

    const heights = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    return (
        <div className={cn('w-full', className)}>
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
                    {showValue && <span className="text-sm font-semibold text-text-primary">{normalizedValue}%</span>}
                </div>
            )}
            <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', heights[size])}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', finalColor)}
                    style={{ width: `${normalizedValue}%` }}
                />
            </div>
        </div>
    );
}
