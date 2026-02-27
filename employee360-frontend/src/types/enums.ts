// ─── Project Type ────────────────────────────────────────────────────
export const PROJECT_TYPE = {
    CLIENT: 'CLIENT',
    INTERNAL: 'INTERNAL',
    PROPOSAL: 'PROPOSAL',
} as const;
export type ProjectType = (typeof PROJECT_TYPE)[keyof typeof PROJECT_TYPE];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
    CLIENT: 'Client',
    INTERNAL: 'Internal',
    PROPOSAL: 'Proposal',
};

// ─── Project Status ──────────────────────────────────────────────────
export const PROJECT_STATUS = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD',
    PIPELINE: 'PIPELINE',
} as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ON_HOLD: 'On Hold',
    PIPELINE: 'Pipeline',
};

// ─── Review Status ───────────────────────────────────────────────────
export const REVIEW_STATUS = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    COMPLETED: 'COMPLETED',
} as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    ACKNOWLEDGED: 'Acknowledged',
    COMPLETED: 'Completed',
};

// ─── Feedback Type ───────────────────────────────────────────────────
export const FEEDBACK_TYPE = {
    PEER: 'PEER',
    UPWARD: 'UPWARD',
    DOWNWARD: 'DOWNWARD',
    SELF: 'SELF',
} as const;
export type FeedbackType = (typeof FEEDBACK_TYPE)[keyof typeof FEEDBACK_TYPE];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
    PEER: 'Peer',
    UPWARD: 'Upward',
    DOWNWARD: 'Downward',
    SELF: 'Self',
};

// ─── Dashboard Type ──────────────────────────────────────────────────
export const DASHBOARD_TYPE = {
    INDIVIDUAL: 'INDIVIDUAL',
    MANAGER: 'MANAGER',
    LEADERSHIP: 'LEADERSHIP',
} as const;
export type DashboardType = (typeof DASHBOARD_TYPE)[keyof typeof DASHBOARD_TYPE];

export const DASHBOARD_TYPE_LABELS: Record<DashboardType, string> = {
    INDIVIDUAL: 'Individual',
    MANAGER: 'Manager',
    LEADERSHIP: 'Leadership',
};

// ─── Allocation Status ───────────────────────────────────────────────
export const ALLOCATION_STATUS = {
    ACTIVE: 'ACTIVE',
    BENCH: 'BENCH',
    PARTIAL: 'PARTIAL',
} as const;
export type AllocationStatus = (typeof ALLOCATION_STATUS)[keyof typeof ALLOCATION_STATUS];

export const ALLOCATION_STATUS_LABELS: Record<AllocationStatus, string> = {
    ACTIVE: 'Active',
    BENCH: 'On Bench',
    PARTIAL: 'Partially Allocated',
};

// ─── Designation Level ───────────────────────────────────────────────
export interface DesignationLevelInfo {
    level: number;
    displayName: string;
    dashboardType: DashboardType;
}

export const DESIGNATION_LEVELS: Record<string, DesignationLevelInfo> = {
    ASSOCIATE_CONSULTANT: { level: 1, displayName: 'Associate Consultant', dashboardType: 'INDIVIDUAL' },
    CONSULTANT: { level: 2, displayName: 'Consultant', dashboardType: 'INDIVIDUAL' },
    ASSISTANT_MANAGER: { level: 3, displayName: 'Assistant Manager', dashboardType: 'INDIVIDUAL' },
    MANAGER: { level: 4, displayName: 'Manager', dashboardType: 'MANAGER' },
    ASSISTANT_DIRECTOR: { level: 5, displayName: 'Assistant Director', dashboardType: 'MANAGER' },
    DIRECTOR: { level: 6, displayName: 'Director', dashboardType: 'LEADERSHIP' },
    PARTNER: { level: 7, displayName: 'Partner', dashboardType: 'LEADERSHIP' },
};

export const getDesignationByLevel = (level: number): DesignationLevelInfo | undefined =>
    Object.values(DESIGNATION_LEVELS).find((d) => d.level === level);
