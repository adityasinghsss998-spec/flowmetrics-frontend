'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus } from 'lucide-react'
import api from '@/lib/axios'
import { DeploymentFrequencyPoint, BuildDurationPoint, BuildDurationSummary, RecentDeployment, Organization } from '@/types/api'
import DeploymentFrequency from '@/components/analytics/DeploymentFrequency'
import BuildDurationTrend from '@/components/analytics/BuildDurationTrend'
import RecentDeployments from '@/components/analytics/RecentDeployments'
import RecordDeploymentDialog from '@/components/deployments/RecordDeploymentDialog'
import GithubActionsSetup from '@/components/deployments/GithubActionsSetup'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCurrentRepo } from '@/hooks/useCurrentRepo'

interface BuildDurationResponse {
  trend: BuildDurationPoint[]
  summary: BuildDurationSummary
}

interface OrgWithMembers extends Organization {
  members?: { id: number; name: string; OrgMember: { role: string } }[]
}

export default function DeploymentsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()
  const repoId = params.repoId as string
  const days = Number(searchParams.get('days') ?? 30)
  const { user } = useAuthStore()
  const [recordOpen, setRecordOpen] = useState(false)
  const { repoFullName } = useCurrentRepo(repoId)

  const orgsQuery = useQuery<OrgWithMembers[]>({
    queryKey: ['orgs'],
    queryFn: () =>
      api.get('/orgs').then((r) => r.data.data).catch(() => api.get('/organizations').then((r) => r.data.data)),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const activeOrg = orgsQuery.data?.[0]
  const member = activeOrg?.members?.find(m => m.id === user?.id)
  const canRecord = !!member && ['owner', 'admin', 'member'].includes(member.OrgMember.role)

  const handleRecordSuccess = () => {
    qc.invalidateQueries({ queryKey: ['recent-deployments', repoId] })
    qc.invalidateQueries({ queryKey: ['deploy-frequency', repoId] })
    qc.invalidateQueries({ queryKey: ['build-duration', repoId] })
    qc.invalidateQueries({ queryKey: ['dora', repoId] })
  }

  const freqQuery = useQuery<DeploymentFrequencyPoint[]>({
    queryKey: ['deploy-frequency', repoId, days],
    queryFn: () =>
      api.get(`/analytics/deployments/frequency?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const buildQuery = useQuery<BuildDurationResponse>({
    queryKey: ['build-duration', repoId, days],
    queryFn: () =>
      api.get(`/analytics/deployments/build-duration?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const recentQuery = useQuery<RecentDeployment[]>({
    queryKey: ['recent-deployments', repoId],
    queryFn: () =>
      api.get(`/analytics/deployments/recent?repoId=${repoId}&limit=15`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  return (
    <div style={{ maxWidth: 1120, padding: '32px 24px' }} className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[var(--fm-line)]">
        <div className="flex items-center gap-4">
          <Button
            id="back-to-repo"
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/repos/${repoId}`)}
            className="border border-[var(--fm-line)]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Overview
          </Button>
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-[var(--fm-text)]">
              Deployments
            </h1>
            <p className="font-mono text-xs text-[var(--fm-text-muted)] mt-1">
              {repoFullName || `Repository #${repoId}`} · {days}-day frequency and build duration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={String(days)} onValueChange={(v) => router.push(`?days=${v}`)}>
            <SelectTrigger id="time-range-selector" className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] px-3 font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          {canRecord && activeOrg && (
            <button
              onClick={() => setRecordOpen(true)}
              className="fm-btn-accent flex items-center gap-1.5"
              style={{ fontSize: 12, padding: '6px 14px' }}
            >
              <Plus className="h-4 w-4" />
              <span>Record Deployment</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DeploymentFrequency
          data={freqQuery.data ?? []}
          isLoading={freqQuery.isLoading}
        />
        <BuildDurationTrend
          trend={buildQuery.data?.trend ?? []}
          summary={buildQuery.data?.summary ?? null}
          isLoading={buildQuery.isLoading}
        />
      </div>

      {recentQuery.data?.length === 0 && !recentQuery.isLoading ? (
        <GithubActionsSetup 
          repoId={Number(repoId)}
          onManualRecord={() => setRecordOpen(true)}
        />
      ) : (
        <RecentDeployments
          data={recentQuery.data ?? []}
          isLoading={recentQuery.isLoading}
        />
      )}

      {activeOrg && (
        <RecordDeploymentDialog
          repoId={Number(repoId)}
          orgId={activeOrg.id}
          open={recordOpen}
          onOpenChange={setRecordOpen}
          onSuccess={handleRecordSuccess}
        />
      )}
    </div>
  )
}
