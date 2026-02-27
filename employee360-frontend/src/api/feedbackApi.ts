import api from './axiosInstance';
import type {
    ApiResponse,
    Feedback,
    FeedbackRequest,
    FeedbackType
} from '../types';

export const feedbackApi = {
    getFeedbackForEmployee: async (employeeId: number, type?: FeedbackType) => {
        const { data } = await api.get<ApiResponse<Feedback[]>>(`/feedback/employee/${employeeId}`, {
            params: { type }
        });
        return data.data;
    },

    submitFeedback: async (request: FeedbackRequest, fromEmployeeId: number) => {
        const { data } = await api.post<ApiResponse<Feedback>>('/feedback', request, {
            params: { fromEmployeeId }
        });
        return data.data;
    },

    getFeedbackByProject: async (projectId: number) => {
        const { data } = await api.get<ApiResponse<Feedback[]>>(`/feedback/project/${projectId}`);
        return data.data;
    },

    getFeedbackGivenByEmployee: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<Feedback[]>>(`/feedback/given/${employeeId}`);
        return data.data;
    },

    getFeedbackForTeam: async (managerId: number) => {
        const { data } = await api.get<ApiResponse<Feedback[]>>(`/feedback/team/${managerId}`);
        return data.data;
    },

    deleteFeedback: async (id: number, employeeId: number) => {
        const { data } = await api.delete<ApiResponse<string>>(`/feedback/${id}`, {
            params: { employeeId }
        });
        return data.data;
    }
};
