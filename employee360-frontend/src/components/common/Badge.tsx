import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import type { ProjectType, ProjectStatus, ReviewStatus, AllocationStatus } from '../../types';

type BadgeColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'gray' | 'feedback-peer' | 'feedback-upward' | 'feedback-downward';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'solid' | 'soft' | 'outline';
    color?: BadgeColor | 'project-client' | 'project-internal' | 'project-proposal';
}

const colorStyles: Record<string, Record<'solid' | 'soft' | 'outline', string>> = {
    primary: {
        solid: 'bg-primary text-white border-primary',
        soft: 'bg-primary-50 text-primary-700 border-primary-100',
        outline: 'bg-transparent text-primary border-primary',
    },
    secondary: {
        solid: 'bg-secondary text-white border-secondary',
        soft: 'bg-secondary-50 text-secondary-700 border-secondary-100',
        outline: 'bg-transparent text-secondary border-secondary',
    },
    accent: {
        solid: 'bg-accent text-white border-accent',
        soft: 'bg-accent-50 text-accent-700 border-accent-100',
        outline: 'bg-transparent text-accent border-accent',
    },
    success: {
        solid: 'bg-success text-white border-success',
        soft: 'bg-success-50 text-success-700 border-success-100',
        outline: 'bg-transparent text-success border-success',
    },
    warning: {
        solid: 'bg-warning text-white border-warning',
        soft: 'bg-warning-50 text-warning-700 border-warning-100',
        outline: 'bg-transparent text-warning border-warning',
    },
    error: {
        solid: 'bg-error text-white border-error',
        soft: 'bg-error-50 text-error-700 border-error-100',
        outline: 'bg-transparent text-error border-error',
    },
    gray: {
        solid: 'bg-gray-500 text-white border-gray-500',
        soft: 'bg-gray-100 text-gray-700 border-gray-200',
        outline: 'bg-transparent text-gray-600 border-gray-400',
    },

    // Custom business logic colors
    'project-client': {
        solid: 'bg-primary text-white border-primary',
        soft: 'bg-primary-50 text-primary-700 border-primary-100',
        outline: 'bg-transparent text-primary border-primary',
    },
    'project-internal': {
        solid: 'bg-success text-white border-success',
        soft: 'bg-success-50 text-success-700 border-success-100',
        outline: 'bg-transparent text-success border-success',
    },
    'project-proposal': {
        solid: 'bg-accent text-white border-accent',
        soft: 'bg-accent-50 text-accent-700 border-accent-100',
        outline: 'bg-transparent text-accent border-accent',
    },
    'feedback-peer': {
        solid: 'bg-blue-600 text-white border-blue-600',
        soft: 'bg-blue-50 text-blue-700 border-blue-200',
        outline: 'bg-transparent text-blue-600 border-blue-600',
    },
    'feedback-upward': {
        solid: 'bg-purple-600 text-white border-purple-600',
        soft: 'bg-purple-50 text-purple-700 border-purple-200',
        outline: 'bg-transparent text-purple-600 border-purple-600',
    },
    'feedback-downward': {
        solid: 'bg-green-600 text-white border-green-600',
        soft: 'bg-green-50 text-green-700 border-green-200',
        outline: 'bg-transparent text-green-600 border-green-600',
    },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, children, variant = 'soft', color = 'primary', ...props }, ref) => {
        const defaultColor = colorStyles[color] || colorStyles.primary;
        const styleClass = defaultColor[variant];

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border',
                    styleClass,
                    variant !== 'outline' && variant !== 'soft' && 'border-transparent',
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);
Badge.displayName = 'Badge';

// ─── Semantic Badge Helpers ─────────────────────────────────────────────────

export function ProjectTypeBadge({ type }: { type: ProjectType }) {
    const map: Record<ProjectType, BadgeProps['color']> = {
        CLIENT: 'project-client',
        INTERNAL: 'project-internal',
        PROPOSAL: 'project-proposal',
    };
    return <Badge color={map[type]}>{type}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
    const map: Record<ProjectStatus, BadgeColor> = {
        ACTIVE: 'success',
        COMPLETED: 'primary',
        ON_HOLD: 'warning',
        PIPELINE: 'accent',
    };
    const labelMap: Record<ProjectStatus, string> = {
        ACTIVE: 'Active',
        COMPLETED: 'Completed',
        ON_HOLD: 'On Hold',
        PIPELINE: 'Pipeline',
    };
    return <Badge color={map[status]}>{labelMap[status]}</Badge>;
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
    const map: Record<ReviewStatus, BadgeColor> = {
        DRAFT: 'gray',
        SUBMITTED: 'warning',
        ACKNOWLEDGED: 'secondary',
        COMPLETED: 'success',
    };
    return <Badge color={map[status]} variant="outline">{status}</Badge>;
}

export function AllocationStatusBadge({ status }: { status: AllocationStatus }) {
    const map: Record<AllocationStatus, BadgeColor> = {
        ACTIVE: 'success',
        BENCH: 'error',
        PARTIAL: 'warning',
    };
    const labelMap: Record<AllocationStatus, string> = {
        ACTIVE: 'Allocated',
        BENCH: 'On Bench',
        PARTIAL: 'Partial',
    };
    return <Badge color={map[status]}>{labelMap[status]}</Badge>;
}
