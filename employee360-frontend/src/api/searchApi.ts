import api from './axiosInstance';
import type { ApiResponse, SearchResults } from '../types';

export const searchApi = {
    globalSearch: async (query: string): Promise<SearchResults> => {
        const { data } = await api.get<ApiResponse<SearchResults>>('/search', {
            params: { q: query },
        });
        return data.data;
    },
};
