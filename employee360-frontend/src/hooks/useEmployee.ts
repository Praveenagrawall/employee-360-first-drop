import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api';
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from '../types';
import { useState, useEffect } from 'react';

// Custom hook for debouncing search queries
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function useEmployees(page = 0, size = 20, sort = 'id,asc') {
    return useQuery({
        queryKey: ['employees', { page, size, sort }],
        queryFn: () => employeeApi.getAllEmployees(page, size, sort),
        staleTime: 5 * 60 * 1000,
    });
}

export function useEmployee(id: number | undefined) {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: () => employeeApi.getEmployeeById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useEmployeeByCode(empCode: string | undefined) {
    return useQuery({
        queryKey: ['employee', 'code', empCode],
        queryFn: () => employeeApi.getEmployeeByCode(empCode!),
        enabled: !!empCode,
        staleTime: 5 * 60 * 1000,
    });
}

export function useEmployeeSearch(query: string) {
    const debouncedQuery = useDebounce(query, 300);

    return useQuery({
        queryKey: ['employees', 'search', debouncedQuery],
        queryFn: () => employeeApi.searchEmployees(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
        staleTime: 60 * 1000, // shorter stale time for search
    });
}

export function useEmployeeFilter(filters: any, page = 0, size = 12) {
    const debouncedFilters = useDebounce(filters, 500);

    return useQuery({
        queryKey: ['employees', 'filter', { filters: debouncedFilters, page, size }],
        queryFn: () => employeeApi.filterEmployees(debouncedFilters, page, size),
        staleTime: 2 * 60 * 1000,
    });
}

export function useDirectReports(managerId: number | undefined) {
    return useQuery({
        queryKey: ['employee', managerId, 'directReports'],
        queryFn: () => employeeApi.getDirectReports(managerId!),
        enabled: !!managerId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useOrgHierarchy(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['employee', employeeId, 'hierarchy'],
        queryFn: () => employeeApi.getOrgHierarchy(employeeId!),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useTeammates(employeeId: number | undefined) {
    return useQuery({
        queryKey: ['employee', employeeId, 'teammates'],
        queryFn: () => employeeApi.getTeammates(employeeId!),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeCreateRequest) => employeeApi.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EmployeeUpdateRequest }) =>
            employeeApi.updateEmployee(id, data),
        onSuccess: (updatedEmployee) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', updatedEmployee.id] });
            queryClient.invalidateQueries({ queryKey: ['employee', 'code', updatedEmployee.empCode] });
        },
    });
}
