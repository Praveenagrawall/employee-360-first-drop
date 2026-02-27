import type { FeedbackType } from './enums';

// ─── Feedback Response ──────────────────────────────────────────────
export interface Feedback {
    id: number;
    fromEmployeeName: string;
    fromEmployeeId: number;
    toEmployeeName: string;
    toEmployeeId: number;
    projectName: string | null;
    type: FeedbackType;
    content: string;
    rating: number;
    isAnonymous: boolean;
    createdAt: string; // ISO datetime
}

// ─── Request ────────────────────────────────────────────────────────
export interface FeedbackRequest {
    toEmployeeId: number;
    projectId?: number;
    type: FeedbackType;
    content: string;
    rating?: number;
    isAnonymous?: boolean;
}
