import axios from 'axios';

import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Prototype Simulation: Add current user ID header
export const setCurrentUserId = (id: number | string) => {
    localStorage.setItem('e360_sim_user_id', String(id));
    api.defaults.headers.common['X-Current-User-Id'] = String(id);
};

api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Prototype Simulation: Ensure header is set from storage
        const simUserId = localStorage.getItem('e360_sim_user_id') || '15';
        config.headers['X-Current-User-Id'] = simUserId;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
