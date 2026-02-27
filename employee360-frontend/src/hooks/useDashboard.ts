import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

export function useDashboard(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['dashboard', employeeId],
        queryFn: () => dashboardApi.getDashboard(employeeId!),
        enabled: !!employeeId,
        staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data can change frequently
    });
}
