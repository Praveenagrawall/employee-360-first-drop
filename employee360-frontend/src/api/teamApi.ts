import api from './axiosInstance';
import type {
    ApiResponse,
    Team,
    TeamCreateRequest,
    TeamMemberAddRequest
} from '../types';

export const teamApi = {
    getTeamsByProject: async (projectId: number) => {
        const { data } = await api.get<ApiResponse<Team[]>>(`/teams/project/${projectId}`);
        return data.data;
    },

    createTeam: async (request: TeamCreateRequest) => {
        const { data } = await api.post<ApiResponse<Team>>('/teams', request);
        return data.data;
    },

    addMember: async (request: TeamMemberAddRequest) => {
        const { data } = await api.post<ApiResponse<void>>('/teams/members', request);
        return data.data; // usually null for void, but unwraps success safely
    },

    removeMember: async (teamId: number, employeeId: number) => {
        const { data } = await api.delete<ApiResponse<void>>(`/teams/${teamId}/members/${employeeId}`);
        return data.data;
    }
};
