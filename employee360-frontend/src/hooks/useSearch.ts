import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function useGlobalSearch(query: string) {
    const debouncedQuery = useDebounce(query, 300);

    return useQuery({
        queryKey: ['globalSearch', debouncedQuery],
        queryFn: () => searchApi.globalSearch(debouncedQuery),
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 60 * 1000,
    });
}
