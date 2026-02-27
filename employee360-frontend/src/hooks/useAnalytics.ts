import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export function useOrgOverview() {
    return useQuery({
        queryKey: ['analytics', 'org-overview'],
        queryFn: analyticsApi.getOrgOverview,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProjectOverview() {
    return useQuery({
        queryKey: ['analytics', 'project-overview'],
        queryFn: analyticsApi.getProjectOverview,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePerformanceOverview() {
    return useQuery({
        queryKey: ['analytics', 'performance-overview'],
        queryFn: analyticsApi.getPerformanceOverview,
        staleTime: 5 * 60 * 1000,
    });
}
