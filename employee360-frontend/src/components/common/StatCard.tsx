import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        label?: string;
    };
    colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'accent';
    className?: string;
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    colorScheme = 'primary',
    className
}: StatCardProps) {

    const colors = {
        primary: { bg: 'bg-primary-50', text: 'text-primary' },
        secondary: { bg: 'bg-secondary-50', text: 'text-secondary' },
        success: { bg: 'bg-success-50', text: 'text-success' },
        warning: { bg: 'bg-warning-50', text: 'text-warning' },
        accent: { bg: 'bg-accent-50', text: 'text-accent' },
    };

    const scheme = colors[colorScheme];

    return (
        <Card className={cn('flex flex-col', className)} padding="lg" hoverEffect>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary font-medium text-sm">{title}</h3>
                {icon && (
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', scheme.bg, scheme.text)}>
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-baseline mb-1">
                <span className="text-3xl font-bold text-text-primary">{value}</span>
            </div>

            {trend && (
                <div className="flex items-center mt-auto pt-2">
                    <span
                        className={cn(
                            'flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full mr-2',
                            trend.value > 0 ? 'bg-success-50 text-success' :
                                trend.value < 0 ? 'bg-error-50 text-error' :
                                    'bg-gray-100 text-gray-600'
                        )}
                    >
                        {trend.value > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> :
                            trend.value < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> :
                                <Minus className="w-3 h-3 mr-1" />}
                        {Math.abs(trend.value)}%
                    </span>
                    {trend.label && (
                        <span className="text-xs text-text-secondary">{trend.label}</span>
                    )}
                </div>
            )}
        </Card>
    );
}
