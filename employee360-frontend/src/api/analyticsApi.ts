import api from './axiosInstance';
import type {
    ApiResponse,
    LeadershipAnalytics
} from '../types';

export const analyticsApi = {
    getOrgOverview: async () => {
        const { data } = await api.get<ApiResponse<LeadershipAnalytics>>('/analytics/org-overview');
        return data.data;
    },

    getProjectOverview: async () => {
        const { data } = await api.get<ApiResponse<import('../types').ProjectOverview>>('/analytics/project-overview');
        return data.data;
    },

    getPerformanceOverview: async () => {
        const { data } = await api.get<ApiResponse<import('../types').PerformanceOverview>>('/analytics/performance-overview');
        return data.data;
    }
};
