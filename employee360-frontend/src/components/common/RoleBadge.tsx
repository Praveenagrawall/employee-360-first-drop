import { cn } from '../../utils/cn';

interface RoleBadgeProps {
    level: number;
    className?: string;
    children?: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function RoleBadge({ level, className, children, size = 'sm' }: RoleBadgeProps) {
    const getBadgeConfig = (lvl: number) => {
        if (lvl >= 7) return { label: 'Partner', styles: 'bg-amber-100 text-amber-700 border-amber-200' };
        if (lvl >= 6) return { label: 'Director', styles: 'bg-purple-100 text-purple-700 border-purple-200' };
        if (lvl >= 4) return { label: 'Manager', styles: 'bg-green-100 text-green-700 border-green-200' };
        return { label: 'Individual Contributor', styles: 'bg-blue-100 text-blue-700 border-blue-200' };
    };

    const { label: defaultLabel, styles } = getBadgeConfig(level);

    const sizeStyles = {
        xs: 'px-1.5 py-0.5 text-[9px]',
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    return (
        <span className={cn(
            "font-bold uppercase tracking-wider rounded border inline-flex items-center justify-center",
            sizeStyles[size],
            styles,
            className
        )}>
            {children || defaultLabel}
        </span>
    );
}
