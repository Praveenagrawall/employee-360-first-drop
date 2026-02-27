import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api';
import type { TeamMemberAddRequest } from '../types';

export function useTeamsByProject(projectId: number | undefined) {
    return useQuery({
        queryKey: ['project', projectId, 'teams'],
        queryFn: () => teamApi.getTeamsByProject(projectId!),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useAddTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TeamMemberAddRequest) => teamApi.addMember(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
        },
    });
}

export function useRemoveTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, employeeId }: { teamId: number; employeeId: number }) =>
            teamApi.removeMember(teamId, employeeId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
        },
    });
}
