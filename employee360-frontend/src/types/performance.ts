import type { ReviewStatus } from './enums';

// ─── Performance Review ─────────────────────────────────────────────
export interface PerformanceReview {
    id: number;
    employeeId: number;
    employeeName: string;
    reviewerId: number;
    reviewerName: string;
    reviewCycle: string;
    rating: number;
    goals: string | null;
    comments: string | null;
    status: ReviewStatus;
    reviewDate: string; // ISO date
}

// ─── Performance Summary (embedded in employee detail) ──────────────
export interface PerformanceSummary {
    latestRating: number | null;
    averageRating: number | null;
    totalReviews: number;
    lastReviewCycle: string | null;
    lastReviewDate: string | null;
}

// ─── Request ────────────────────────────────────────────────────────
export interface ReviewRequest {
    employeeId: number;
    reviewCycle: string;
    rating: number;
    goals?: string;
    comments?: string;
}

export interface ReviewUpdateRequest {
    rating?: number;
    goals?: string;
    comments?: string;
}

export interface PerformanceOverview {
    organizationAverageRating: number;
    ratingDistribution: Record<number, number>;
    averageByDepartment: Record<string, number>;
    topPerformers: import('./employee').EmployeeSlim[];
    pendingReviewsCount: number;
    completedReviewsCount: number;
}
