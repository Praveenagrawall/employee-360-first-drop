import api from './axiosInstance';
import type {
    ApiResponse,
    DashboardData
} from '../types';

export const dashboardApi = {
    getDashboard: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<DashboardData>>(`/dashboard/${employeeId}`);
        // The backend endpoint structure is /api/v1/dashboard/{employeeId}, 
        // retrieving full contextual dashboard for that employee
        return data.data;
    }
};
