import api from './axiosInstance';

export const createAllocationRequest = (data: any) => api.post('/allocation-requests', data);
export const approveRequest = (id: number, data: any) => api.put(`/allocation-requests/${id}/approve`, data);
export const rejectRequest = (id: number, data: any) => api.put(`/allocation-requests/${id}/reject`, data);
export const withdrawRequest = (id: number) => api.put(`/allocation-requests/${id}/withdraw`);
export const fetchPendingRequests = () => api.get('/allocation-requests/pending');
export const fetchMyRequests = () => api.get('/allocation-requests/my-requests');
export const fetchPendingCount = () => api.get('/allocation-requests/pending-count');
export const fetchRequestSummary = () => api.get('/allocation-requests/summary');
export const fetchEmployeeRequests = (employeeId: number) => api.get(`/allocation-requests/employee/${employeeId}`);
export const fetchAvailableEmployees = (params: any) => api.get('/employees/available', { params });
