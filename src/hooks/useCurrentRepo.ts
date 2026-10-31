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

  const activeOrgId = typeof window !== 'undefined' ? localStorage.getItem('flowmetrics-active-org') : null

  const reposQuery = useQuery<Repository[]>({
    queryKey: ['repos-lookup', repoId, activeOrgId],
    queryFn: async () => {
      if (!repoId) return []

      // 1. Check active org first (fast path - avoids N+1 org queries)
      if (activeOrgId) {
        try {
          const res = await api.get(`/repos/org/${activeOrgId}`)
          const list = (res.data?.data ?? []) as Repository[]
          const match = list.find((r) => String(r.id) === String(repoId))
          if (match) return list
        } catch (_) {}
      }

      // 2. Fall back to fetching organizations and finding repo across other orgs
      let orgs: Organization[] = []
      try {
        const res = await api.get('/orgs')
        orgs = res.data?.data ?? []
      } catch {
        try {
          const res = await api.get('/organizations')
          orgs = res.data?.data ?? []
        } catch (_) {}
      }

      if (!orgs.length) return []

      const otherOrgs = orgs.filter((o) => String(o.id) !== String(activeOrgId))
      for (const org of otherOrgs) {
        try {
          const res = await api.get(`/repos/org/${org.id}`)
          const list = (res.data?.data ?? []) as Repository[]
          if (list.some((r) => String(r.id) === String(repoId))) {
            return list
          }
        } catch (_) {}
      }

      return []
    },
    enabled: !cachedRepo && Boolean(repoId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const repo =
    cachedRepo ??
    reposQuery.data?.find((r) => String(r.id) === String(repoId))

  return {
    repo,
    repoFullName: repo?.full_name ?? repo?.name ?? null,
    isLoading: !cachedRepo && reposQuery.isLoading,
  }
}
