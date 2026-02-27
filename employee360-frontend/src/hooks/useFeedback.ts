import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '../api';
import type { FeedbackRequest } from '../types';

export function useEmployeeFeedback(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['employee', employeeId, 'feedback'],
        queryFn: () => feedbackApi.getFeedbackForEmployee(employeeId!),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProjectFeedback(projectId: number | undefined) {
    return useQuery({
        queryKey: ['project', projectId, 'feedback'],
        queryFn: () => feedbackApi.getFeedbackByProject(projectId!),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useSubmitFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, fromEmployeeId }: { data: FeedbackRequest; fromEmployeeId: number }) =>
            feedbackApi.submitFeedback(data, fromEmployeeId),
        onSuccess: (newFeedback) => {
            queryClient.invalidateQueries({ queryKey: ['employee', newFeedback.toEmployeeId, 'feedback'] });
            queryClient.invalidateQueries({ queryKey: ['employee', newFeedback.fromEmployeeId, 'given-feedback'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['team'] });
        },
    });
}

export function useGivenFeedback(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['employee', employeeId, 'given-feedback'],
        queryFn: () => feedbackApi.getFeedbackGivenByEmployee(employeeId!),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useTeamFeedback(managerId: number | undefined) {
    return useQuery({
        queryKey: ['team', managerId, 'feedback'],
        queryFn: () => feedbackApi.getFeedbackForTeam(managerId!),
        enabled: !!managerId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useDeleteFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, employeeId }: { id: number; employeeId: number }) =>
            feedbackApi.deleteFeedback(id, employeeId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId, 'given-feedback'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['team'] });
        },
    });
}
