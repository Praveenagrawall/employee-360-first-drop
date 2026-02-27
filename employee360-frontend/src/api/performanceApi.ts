import api from './axiosInstance';
import type {
    ApiResponse,
    PerformanceReview,
    PerformanceSummary,
    ReviewRequest,
    ReviewUpdateRequest
} from '../types';

export const performanceApi = {
    getReviewsByEmployee: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews/employee/${employeeId}`);
        return data.data;
    },

    getPerformanceSummary: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<PerformanceSummary>>(`/performance/summary/${employeeId}`);
        return data.data;
    },

    createReview: async (request: ReviewRequest) => {
        const { data } = await api.post<ApiResponse<PerformanceReview>>('/performance/reviews', request);
        return data.data;
    },

    getPendingReviews: async (reviewerId: number) => {
        const { data } = await api.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews/pending/${reviewerId}`);
        return data.data;
    },

    getReviewsForTeam: async (managerId: number) => {
        const { data } = await api.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews/team/${managerId}`);
        return data.data;
    },

    getReviewsWithFilters: async (filters: { department?: string; designation?: number; cycle?: string; status?: string }) => {
        const { data } = await api.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews`, { params: filters });
        return data.data;
    },

    getReviewsByCycle: async (cycle: string) => {
        const { data } = await api.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews/cycle/${cycle}`);
        return data.data;
    },

    updateReview: async (id: number, request: ReviewUpdateRequest) => {
        const { data } = await api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}`, request);
        return data.data;
    },

    submitReview: async (id: number) => {
        const { data } = await api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}/submit`);
        return data.data;
    },

    acknowledgeReview: async (id: number) => {
        const { data } = await api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}/acknowledge`);
        return data.data;
    },

    completeReview: async (id: number) => {
        const { data } = await api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}/complete`);
        return data.data;
    },

    getPerformanceOverview: async () => {
        const { data } = await api.get<ApiResponse<import('../types').PerformanceOverview>>('/performance/overview');
        return data.data;
    }
};
