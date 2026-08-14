'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, Activity, Zap, Trash2, X } from 'lucide-react'
import api from '@/lib/axios'
import { DoraMetrics, CycleTimeTrendPoint, PrSizeBucket, OpenPr, RecentDeployment } from '@/types/api'
import DoraScoreCard from '@/components/analytics/DoraScoreCard'
import CycleTimeTrend from '@/components/analytics/CycleTimeTrend'
import PrSizeChart from '@/components/analytics/PrSizeChart'
import OpenPrAlert from '@/components/analytics/OpenPrAlert'
import RecentDeployments from '@/components/analytics/RecentDeployments'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function RepoDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()
  const repoId = params.repoId as string
  const rawDays = Number(searchParams.get('days') ?? 30)
  const days = Number.isFinite(rawDays) && rawDays > 0 && [7, 30, 60, 90].includes(rawDays) ? rawDays : 30
  const [confirmOpen, setConfirmOpen] = useState(false)

  const disconnectMutation = useMutation({
    mutationFn: () => api.delete(`/repos/${repoId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repos'] })
      qc.invalidateQueries({ queryKey: ['available-repos'] })
      router.push('/dashboard')
    },
  })

  const doraQuery = useQuery<DoraMetrics>({
    queryKey: ['dora', repoId, days],
    queryFn: () =>
      api.get(`/analytics/dora?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const cycleTrendQuery = useQuery<CycleTimeTrendPoint[]>({
    queryKey: ['cycle-trend', repoId, days],
    queryFn: () =>
      api.get(`/analytics/cycle-time/trend?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const prSizeQuery = useQuery<PrSizeBucket[]>({
    queryKey: ['cycle-by-size', repoId, days],
    queryFn: () =>
      api.get(`/analytics/cycle-time/by-size?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const openPrsQuery = useQuery<OpenPr[]>({
    queryKey: ['open-prs', repoId],
    queryFn: () =>
      api.get(`/analytics/prs/open?repoId=${repoId}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const deploymentsQuery = useQuery<RecentDeployment[]>({
    queryKey: ['recent-deployments', repoId],
    queryFn: () =>
      api.get(`/analytics/deployments/recent?repoId=${repoId}&limit=15`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const dora = doraQuery.data

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            id="back-to-dashboard"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground -ml-2 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                DORA Analytics
              </h1>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                Repository #{repoId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 backdrop-blur">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            <Select
              value={String(days)}
              onValueChange={(v) => router.push(`?days=${v}`)}
            >
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

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-semibold h-9 rounded-xl"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Disconnect
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(newOpen) => !newOpen && setConfirmOpen(false)}>
        <DialogContent showCloseButton={false} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-card shadow-2xl p-6 space-y-4">
          <DialogHeader className="border-b border-white/[0.06] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </div>
                <DialogTitle className="text-sm font-semibold text-foreground">Disconnect Repository</DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <DialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to disconnect repository <strong className="text-foreground font-semibold">#{repoId}</strong>? Webhook tracking will stop and you will be returned to the dashboard.
          </DialogDescription>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="h-9 px-4 rounded-lg border border-white/[0.08] text-xs font-semibold text-muted-foreground hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate()}
              className="h-9 px-4 rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {disconnectMutation.isPending ? 'Disconnecting…' : 'Disconnect Repository'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent blur-2xl pointer-events-none" />
        <div className="relative mb-3 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            DORA Metrics · Last {days} days
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DoraScoreCard
            title="Deployment Frequency"
            value={dora ? `${dora.deployment_frequency.deployments_per_week.toFixed(1)}/wk` : null}
            subtitle={dora ? `${dora.deployment_frequency.total_deployments} total · ${dora.deployment_frequency.successful} success` : null}
            level={dora?.deployment_frequency.level ?? null}
            trend={dora?.deployment_frequency.trend_percent ?? null}
            isLoading={doraQuery.isLoading}
            isError={doraQuery.isError}
          />
          <DoraScoreCard
            title="Lead Time for Changes"
            value={dora?.lead_time.avg_lead_time_hours != null ? `${dora.lead_time.avg_lead_time_hours.toFixed(1)}h` : null}
            subtitle={dora ? `${dora.lead_time.total_prs} PRs · ${dora.lead_time.prs_with_lead_time} measured` : null}
            level={dora?.lead_time.level ?? null}
            trend={null}
            isLoading={doraQuery.isLoading}
            isError={doraQuery.isError}
          />
          <DoraScoreCard
            title="Change Failure Rate"
            value={dora ? `${dora.change_failure_rate.failure_rate_percent.toFixed(1)}%` : null}
            subtitle={dora ? `${dora.change_failure_rate.failed_deployments} of ${dora.change_failure_rate.total_deployments} failed` : null}
            level={dora?.change_failure_rate.level ?? null}
            trend={null}
            isLoading={doraQuery.isLoading}
            isError={doraQuery.isError}
          />
          <DoraScoreCard
            title="Mean Time to Recovery"
            value={dora?.mean_time_to_recovery.avg_mttr_hours != null ? `${dora.mean_time_to_recovery.avg_mttr_hours.toFixed(1)}h` : null}
            subtitle={dora ? `${dora.mean_time_to_recovery.incidents_recovered} incidents recovered` : null}
            level={dora?.mean_time_to_recovery.level ?? null}
            trend={null}
            isLoading={doraQuery.isLoading}
            isError={doraQuery.isError}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CycleTimeTrend data={cycleTrendQuery.data ?? []} isLoading={cycleTrendQuery.isLoading} isError={cycleTrendQuery.isError} />
        <PrSizeChart data={prSizeQuery.data ?? []} isLoading={prSizeQuery.isLoading} isError={prSizeQuery.isError} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OpenPrAlert data={openPrsQuery.data ?? []} isLoading={openPrsQuery.isLoading} isError={openPrsQuery.isError} />
        </div>
        <div className="lg:col-span-3">
          <RecentDeployments data={deploymentsQuery.data ?? []} isLoading={deploymentsQuery.isLoading} isError={deploymentsQuery.isError} />
        </div>
      </div>
    </div>
  )
}
