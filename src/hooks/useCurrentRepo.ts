import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Repository, Organization } from '@/types/api'

export function useCurrentRepo(repoId: string | number | undefined) {
  const qc = useQueryClient()

  const cachedRepo = repoId
    ? qc
        .getQueriesData<Repository[]>({ queryKey: ['repos'] })
        .flatMap(([_, data]) => data ?? [])
        .find((r) => String(r.id) === String(repoId))
    : undefined

  const orgsQuery = useQuery<Organization[]>({
    queryKey: ['orgs'],
    queryFn: () =>
      api.get('/orgs').then((r) => r.data.data).catch(() => api.get('/organizations').then((r) => r.data.data)),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !cachedRepo && Boolean(repoId),
  })

  const reposQuery = useQuery<Repository[]>({
    queryKey: ['repos-lookup', orgsQuery.data?.map((o) => o.id).join(',')],
    queryFn: async () => {
      if (!orgsQuery.data?.length) return []
      const results = await Promise.all(
        orgsQuery.data.map((o) =>
          api.get(`/repos/org/${o.id}`).then((r) => r.data.data as Repository[]).catch(() => [])
        )
      )
      return results.flat()
    },
    enabled: !cachedRepo && Boolean(orgsQuery.data?.length) && Boolean(repoId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const repo =
    cachedRepo ??
    reposQuery.data?.find((r) => String(r.id) === String(repoId))

  return {
    repo,
    repoFullName: repo?.full_name ?? repo?.name ?? null,
    isLoading: !cachedRepo && (orgsQuery.isLoading || reposQuery.isLoading),
  }
}
