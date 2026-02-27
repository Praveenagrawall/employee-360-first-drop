import type { ProjectType, AllocationStatus } from './enums';

// ─── Team ───────────────────────────────────────────────────────────
export interface Team {
    id: number;
    name: string;
    teamLeadName: string | null;
    teamLeadId: number | null;
    projectName: string;
    projectId: number;
    memberCount: number;
    members: TeamMember[];
}

// ─── Team Member ────────────────────────────────────────────────────
export interface TeamMember {
    id: number;
    employeeName: string;
    employeeId: number;
    empCode: string;
    designation: string;
    roleInTeam: string;
    allocationPercentage: number;
    status: AllocationStatus;
    profilePicUrl: string | null;
}

// ─── Team Assignment (on employee detail) ───────────────────────────
export interface TeamAssignment {
    teamId: number;
    teamName: string;
    projectId: number;
    projectName: string;
    projectType: ProjectType;
    clientName: string | null;
    roleInTeam: string;
    allocationPercentage: number;
    teamLeadName: string | null;
}

// ─── Requests ───────────────────────────────────────────────────────
export interface TeamCreateRequest {
    name: string;
    projectId: number;
    teamLeadId?: number;
}

export interface TeamMemberAddRequest {
    teamId: number;
    employeeId: number;
    roleInTeam: string;
    allocationPercentage: number;
    startDate?: string;
}
