import api from './axiosInstance';
import type {
    ApiResponse,
    PaginatedResponse,
    Project,
    ProjectDetail,
    ProjectCreateRequest,
    ProjectType,
    ProjectStatus
} from '../types';

export const projectApi = {
    getAllProjects: async (type?: ProjectType, status?: ProjectStatus, page = 0, size = 20) => {
        const { data } = await api.get<ApiResponse<PaginatedResponse<Project>>>('/projects', {
            params: { type, status, page, size }
        });
        return data.data;
    },

    getProjectById: async (id: number) => {
        const { data } = await api.get<ApiResponse<ProjectDetail>>(`/projects/${id}`);
        return data.data;
    },

    getProjectsByEmployee: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<Project[]>>(`/projects/employee/${employeeId}`);
        return data.data;
    },

    createProject: async (request: ProjectCreateRequest) => {
        const { data } = await api.post<ApiResponse<Project>>('/projects', request);
        return data.data;
    }
};
