import api from './axiosInstance';

export const fetchCurrentUser = () => api.get('/user-context/me');
export const switchUser = (employeeId: number) => api.get(`/user-context/switch/${employeeId}`);
export const fetchSwitchableUsers = () => api.get('/user-context/switchable-users');
