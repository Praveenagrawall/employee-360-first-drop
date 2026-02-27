import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../api';
import type { ReviewRequest } from '../types';

export function usePerformanceReviews(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['employee', employeeId, 'performance-reviews'],
        queryFn: () => performanceApi.getReviewsByEmployee(employeeId!),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePerformanceSummary(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['employee', employeeId, 'performance-summary'],
        queryFn: () => performanceApi.getPerformanceSummary(employeeId!),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePendingReviews(reviewerId: number | undefined) {
    return useQuery({
        queryKey: ['employee', reviewerId, 'pending-reviews'],
        queryFn: () => performanceApi.getPendingReviews(reviewerId!),
        enabled: !!reviewerId,
        staleTime: 1 * 60 * 1000, // Shorter stale time to keep pending list fresh
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ReviewRequest) => performanceApi.createReview(data),
        onSuccess: (newReview) => {
            queryClient.invalidateQueries({ queryKey: ['employee', newReview.employeeId, 'performance-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['employee', newReview.employeeId, 'performance-summary'] });
            queryClient.invalidateQueries({ queryKey: ['employee', newReview.reviewerId, 'pending-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useReviewsForTeam(managerId: number | undefined) {
    return useQuery({
        queryKey: ['team', managerId, 'performance-reviews'],
        queryFn: () => performanceApi.getReviewsForTeam(managerId!),
        enabled: !!managerId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useReviewsWithFilters(filters: { department?: string; designation?: number; cycle?: string; status?: string }) {
    return useQuery({
        queryKey: ['performance-reviews', filters],
        queryFn: () => performanceApi.getReviewsWithFilters(filters),
        staleTime: 5 * 60 * 1000,
    });
}

export function useReviewsByCycle(cycle: string | undefined) {
    return useQuery({
        queryKey: ['performance-reviews', 'cycle', cycle],
        queryFn: () => performanceApi.getReviewsByCycle(cycle!),
        enabled: !!cycle,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: any }) => performanceApi.updateReview(id, request),
        onSuccess: (updatedReview) => {
            queryClient.invalidateQueries({ queryKey: ['employee', updatedReview.employeeId, 'performance-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['employee', updatedReview.reviewerId, 'pending-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['team'] });
            queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
        }
    });
}

export function useReviewTransition(endpointFn: (id: number) => Promise<any>) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => endpointFn(id),
        onSuccess: (updatedReview) => {
            queryClient.invalidateQueries({ queryKey: ['employee', updatedReview.employeeId, 'performance-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['employee', updatedReview.employeeId, 'performance-summary'] });
            queryClient.invalidateQueries({ queryKey: ['employee', updatedReview.reviewerId, 'pending-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['team'] });
            queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });
}

export function useSubmitReview() { return useReviewTransition(performanceApi.submitReview); }
export function useAcknowledgeReview() { return useReviewTransition(performanceApi.acknowledgeReview); }
export function useCompleteReview() { return useReviewTransition(performanceApi.completeReview); }

export function usePerformanceOverview() {
    return useQuery({
        queryKey: ['performance', 'overview'],
        queryFn: () => performanceApi.getPerformanceOverview(),
        staleTime: 5 * 60 * 1000,
    });
}
