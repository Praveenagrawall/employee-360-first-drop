/**
 * Standalone QueryClient singleton.
 * Extracted from main.tsx so it can be imported by non-component modules
 * (like UserContextProvider) without triggering React Fast Refresh warnings.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});
