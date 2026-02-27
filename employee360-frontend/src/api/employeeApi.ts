import api from './axiosInstance';
import type {
    ApiResponse,
    PaginatedResponse,
    Employee,
    EmployeeDetail,
    EmployeeSlim,
    EmployeeCreateRequest,
    EmployeeUpdateRequest,
    OrgHierarchy
} from '../types';

export const employeeApi = {
    getAllEmployees: async (page = 0, size = 20, sort = 'id,asc') => {
        const { data } = await api.get<ApiResponse<PaginatedResponse<Employee>>>('/employees', {
            params: { page, size, sort }
        });
        return data.data;
    },

    getEmployeeById: async (id: number) => {
        const { data } = await api.get<ApiResponse<EmployeeDetail>>(`/employees/${id}`);
        return data.data;
    },

    getEmployeeByCode: async (empCode: string) => {
        const { data } = await api.get<ApiResponse<EmployeeDetail>>(`/employees/code/${empCode}`);
        return data.data;
    },

    searchEmployees: async (query: string) => {
        const { data } = await api.get<ApiResponse<EmployeeSlim[]>>('/employees/search', {
            params: { query }
        });
        return data.data;
    },

    getDirectReports: async (managerId: number) => {
        const { data } = await api.get<ApiResponse<EmployeeSlim[]>>(`/employees/${managerId}/direct-reports`);
        return data.data;
    },

    getOrgHierarchy: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<OrgHierarchy>>(`/employees/${employeeId}/org-hierarchy`);
        return data.data;
    },

    getTeammates: async (employeeId: number) => {
        const { data } = await api.get<ApiResponse<EmployeeSlim[]>>(`/employees/${employeeId}/teammates`);
        return data.data;
    },

    createEmployee: async (request: EmployeeCreateRequest) => {
        const { data } = await api.post<ApiResponse<Employee>>('/employees', request);
        return data.data;
    },

    updateEmployee: async (id: number, request: EmployeeUpdateRequest) => {
        const { data } = await api.put<ApiResponse<Employee>>(`/employees/${id}`, request);
        return data.data;
    },

    filterEmployees: async (params: any, page = 0, size = 12) => {
        const { data } = await api.get<ApiResponse<PaginatedResponse<Employee>>>('/employees/filter', {
            params: { ...params, page, size }
        });
        return data.data;
    },

    exportEmployees: async () => {
        const { data } = await api.get('/employees/export', {
            responseType: 'blob'
        });
        return data;
    }
};
