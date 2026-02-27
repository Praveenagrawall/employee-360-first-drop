import type { DashboardType } from './enums';
import type { EmployeeSlim } from './employee';
import type { TeamAssignment } from './team';
import type { Project } from './project';
import type { PerformanceReview } from './performance';
import type { Feedback } from './feedback';

// ─── Dashboard Response (union shape based on dashboardType) ────────

export interface DashboardData {
    dashboardType: DashboardType;
    employee: EmployeeSlim;

    // ── Individual fields ───────────────────────────────────────────
    currentProjectCount?: number;
    totalAllocation?: number;
    latestRating?: number;
    feedbackCount?: number;
    myProjects?: TeamAssignment[];
    myTeammates?: EmployeeSlim[];
    recentReviews?: PerformanceReview[];
    recentFeedback?: Feedback[];

    // ── Manager fields ──────────────────────────────────────────────
    directReportCount?: number;
    averageTeamRating?: number;
    pendingReviewCount?: number;
    teamUtilization?: number;
    directReports?: EmployeeSlim[];
    activeProjects?: Project[];
    pendingReviews?: PerformanceReview[];

    // ── Leadership fields ───────────────────────────────────────────
    totalHeadcount?: number;
    clientProjectCount?: number;
    proposalCount?: number;
    benchStrength?: number;
}

export interface HeadcountByDesignation {
    designation: string;
    count: number;
}

export interface UtilizationStats {
    allocated: number;
    partial: number;
    bench: number;
}

export interface TopPerformer {
    employee: EmployeeSlim;
    averageRating: number;
}

export interface LeadershipAnalytics {
    headcountByDesignation: HeadcountByDesignation[];
    utilizationStats: UtilizationStats;
    topPerformers: TopPerformer[];
    benchEmployees: EmployeeSlim[];
}

export interface ProjectOverview {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    pipelineProjects: number;
    byType: Record<string, number>;
    atRiskProjects: Project[];
}
