import { QueryClient } from '@tanstack/react-query'

/**
 * Standard React Query client configuration for FlowMetrics.
 * All analytics queries use:
 *  - staleTime: 5 minutes (don't refetch fresh data)
 *  - refetchOnWindowFocus: false (no backend spam on tab switch)
 *  - retry: 1 (single retry on failure)
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}
