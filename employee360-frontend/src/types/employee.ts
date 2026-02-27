import type { DashboardType } from './enums';

// ─── Slim (list / reference) ────────────────────────────────────────
export interface EmployeeSlim {
    id: number;
    empCode: string;
    fullName: string;
    email: string;
    designationName: string;
    designationLevel: number;
    profilePicUrl: string | null;
    department: string;
    totalAllocation?: number;
    latestRating?: number;
}

// ─── Standard response ──────────────────────────────────────────────
export interface Employee {
    id: number;
    empCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
    designationName: string;
    designationLevel: number;
    dashboardType: DashboardType;
    department: string;
    location: string | null;
    dateOfJoining: string; // ISO date
    profilePicUrl: string | null;
    isActive: boolean;
    reportingManagerId: number | null;
    reportingManagerName: string | null;
    performanceManagerId: number | null;
    performanceManagerName: string | null;
    totalAllocation: number | null;
}

// ─── Detail (360-view) ──────────────────────────────────────────────
export interface EmployeeDetail {
    id: number;
    empCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
    designationName: string;
    designationLevel: number;
    dashboardType: DashboardType;
    department: string;
    location: string | null;
    dateOfJoining: string;
    profilePicUrl: string | null;
    isActive: boolean;
    reportingManagerId: number | null;
    reportingManagerName: string | null;
    reportingManagerDesignation: string | null;
    performanceManagerId: number | null;
    performanceManagerName: string | null;
    performanceManagerDesignation: string | null;
    currentTeams: import('./team').TeamAssignment[];
    totalAllocationPercentage: number;
    directReports: EmployeeSlim[];
    teammates: EmployeeSlim[];
    performanceSummary: import('./performance').PerformanceSummary | null;
}

// ─── Org hierarchy ──────────────────────────────────────────────────
export interface OrgHierarchy {
    employee: EmployeeSlim;
    reportingManager: EmployeeSlim | null;
    performanceManager: EmployeeSlim | null;
    directReports: EmployeeSlim[];
    upwardChain: OrgHierarchy[];
}

// ─── Request DTOs ───────────────────────────────────────────────────
export interface EmployeeCreateRequest {
    empCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    designationId: number;
    department: string;
    location?: string;
    dateOfJoining?: string;
    reportingManagerId?: number;
    performanceManagerId?: number;
}

export interface EmployeeUpdateRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    designationId?: number;
    department?: string;
    location?: string;
    reportingManagerId?: number;
    performanceManagerId?: number;
    isActive?: boolean;
}
