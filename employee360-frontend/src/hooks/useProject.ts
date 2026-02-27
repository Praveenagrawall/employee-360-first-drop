import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api';
import type { ProjectCreateRequest } from '../types';

export function useProjects(filters?: { type?: string; status?: string }, page = 0, size = 10) {
    return useQuery({
        queryKey: ['projects', filters, page, size],
        queryFn: () => projectApi.getAllProjects(
            filters?.type as any,
            filters?.status as any,
            page,
            size
        )
    });
}

export function useProject(id: number | undefined) {
    return useQuery({
        queryKey: ['projects', id],
        queryFn: () => projectApi.getProjectById(id!),
        enabled: !!id
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: ProjectCreateRequest) => projectApi.createProject(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
}

export function useActiveProjects() {
    return useQuery({
        queryKey: ['projects', 'active'],
        queryFn: () => projectApi.getAllProjects()
    });
}
