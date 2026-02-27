import type { ProjectType, ProjectStatus } from './enums';

// ─── List response ──────────────────────────────────────────────────
export interface Project {
    id: number;
    projectCode: string;
    name: string;
    description: string | null;
    type: ProjectType;
    status: ProjectStatus;
    clientName: string | null;
    startDate: string;
    endDate: string | null;
    engagementManagerName: string | null;
    engagementManagerId: number | null;
    teamCount: number;
    memberCount: number;
}

export interface ProjectSlim {
    id: number;
    projectCode: string;
    projectName: string;
}

// ─── Detail response ────────────────────────────────────────────────
export interface ProjectDetail {
    id: number;
    projectCode: string;
    name: string;
    description: string | null;
    type: ProjectType;
    status: ProjectStatus;
    clientName: string | null;
    startDate: string;
    endDate: string | null;
    engagementManagerName: string | null;
    engagementManagerId: number | null;
    teams: import('./team').Team[];
}

// ─── Request ────────────────────────────────────────────────────────
export interface ProjectCreateRequest {
    projectCode: string;
    name: string;
    description?: string;
    type: ProjectType;
    status?: ProjectStatus;
    clientName?: string;
    startDate: string;
    endDate?: string;
    engagementManagerId: number;
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
