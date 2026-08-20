'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Rocket, Clock, ArrowLeft } from 'lucide-react'
import api from '@/lib/axios'
import { DeploymentFrequencyPoint, BuildDurationPoint, BuildDurationSummary, RecentDeployment, Organization } from '@/types/api'
import DeploymentFrequency from '@/components/analytics/DeploymentFrequency'
import BuildDurationTrend from '@/components/analytics/BuildDurationTrend'
import RecentDeployments from '@/components/analytics/RecentDeployments'
import RecordDeploymentDialog from '@/components/deployments/RecordDeploymentDialog'
import GithubActionsSetup from '@/components/deployments/GithubActionsSetup'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            id="back-to-repo"
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/repos/${repoId}`)}
            className="text-muted-foreground hover:text-foreground -ml-2 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Overview
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
              <Rocket className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                Deployments
              </h1>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                Repository #{repoId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 backdrop-blur">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            <Select value={String(days)} onValueChange={(v) => router.push(`?days=${v}`)}>
              <SelectTrigger id="time-range-selector" className="h-7 w-32 border-0 bg-transparent p-0 text-xs font-medium focus-visible:ring-0 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canRecord && activeOrg && (
            <Button
              onClick={() => setRecordOpen(true)}
              size="sm"
              className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
            >
              Record Deployment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
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
