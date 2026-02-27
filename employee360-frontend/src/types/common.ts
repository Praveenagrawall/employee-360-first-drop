// ─── Generic API wrappers ───────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // current page (0-indexed)
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ─── Unified Search ────────────────────────────────────────────────
import type { EmployeeSlim } from './employee';
import type { Project } from './project';

export interface SearchResults {
    employees: EmployeeSlim[];
    projects: Project[];
    totalResults: number;
}
