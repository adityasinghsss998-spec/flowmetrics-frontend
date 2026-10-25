'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X, AlertTriangle } from 'lucide-react'
import api from '@/lib/axios'
import { DoraMetrics, CycleTimeTrendPoint, PrSizeBucket, OpenPr, RecentDeployment } from '@/types/api'
import DoraScoreCard from '@/components/analytics/DoraScoreCard'
import CycleTimeTrend from '@/components/analytics/CycleTimeTrend'
import PrSizeChart from '@/components/analytics/PrSizeChart'
import OpenPrAlert from '@/components/analytics/OpenPrAlert'
import RecentDeployments from '@/components/analytics/RecentDeployments'
import { useCurrentRepo } from '@/hooks/useCurrentRepo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function RepoDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()
  const repoId = params.repoId as string
  const days = Number(searchParams.get('days') ?? 30)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { repoFullName } = useCurrentRepo(repoId)

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

  const hasError =
    doraQuery.isError ||
    cycleTrendQuery.isError ||
    prSizeQuery.isError ||
    openPrsQuery.isError ||
    deploymentsQuery.isError

  return (
    <div style={{ maxWidth: 1120, padding: '32px 24px' }}>
      {/* Header */}
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ marginBottom: 32 }}
      >
        <div className="flex items-center gap-3">
          <button
            id="back-to-dashboard"
            type="button"
            onClick={() => router.push('/dashboard')}
            className="fm-btn-quiet flex items-center gap-1.5 text-sm"
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 4,
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
          <span style={{ color: 'var(--fm-line)' }}>/</span>
          <h1
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--fm-text)',
              margin: 0,
            }}
          >
            {repoFullName || `Repository #${repoId}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--fm-line)',
              borderRadius: 4,
              padding: '4px 10px',
              background: 'var(--fm-surface)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11, color: 'var(--fm-text-muted)' }}>
              Period:
            </span>
            <Select
              value={String(days)}
              onValueChange={(v) => router.push(`?days=${v}`)}
            >
              <SelectTrigger
                id="time-range-selector"
                className="h-7 w-28 border-0 bg-transparent p-0 text-xs font-medium focus-visible:ring-0 shadow-none cursor-pointer"
                style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text)' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--fm-surface-raised)', border: '1px solid var(--fm-line)', borderRadius: 4 }}>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disconnect */}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="fm-btn-destructive"
            style={{
              fontSize: 12,
              padding: '5px 14px',
            }}
          >
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* Disconnect confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={(val) => { if (!val) setConfirmOpen(false) }}>
        <DialogContent
          className="max-w-md p-6 space-y-4"
          showCloseButton={false}
          style={{
            background: 'var(--fm-surface-raised)',
            border: '1px solid var(--fm-line)',
            borderRadius: 4,
          }}
        >
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--fm-line)' }}>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 14, fontWeight: 600, color: 'var(--fm-text)' }}>
              Disconnect repository
            </span>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="fm-btn-quiet flex h-7 w-7 items-center justify-center p-0"
              style={{ borderRadius: 4 }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)', lineHeight: 1.6 }}>
            Disconnect repository <strong style={{ color: 'var(--fm-text)' }}>#{repoId}</strong>? Webhook tracking will stop and you will be returned to the dashboard. Analytics data is preserved.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setConfirmOpen(false)} className="fm-btn-quiet">
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate()}
              className="fm-btn-destructive"
              style={{
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <span>{disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error banner */}
      {hasError && (
        <div
          className="flex items-center gap-3 p-4 mb-6"
          style={{
            border: '1px solid color-mix(in srgb, var(--fm-status-poor) 30%, transparent)',
            borderRadius: 4,
            background: 'color-mix(in srgb, var(--fm-status-poor) 8%, transparent)',
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--fm-status-poor)' }} />
          <span style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
            Failed to load some analytics data. Check API connectivity.
          </span>
        </div>
      )}

      {/* DORA section label */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: 11,
          color: 'var(--fm-text-muted)',
        }}>
          Dora metrics, last {days} days
        </span>
      </div>

      {/* DORA cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" style={{ marginBottom: 32 }}>
        <DoraScoreCard
          title="Deployment frequency"
          value={dora ? `${dora.deployment_frequency.deployments_per_week.toFixed(1)}/wk` : doraQuery.isError ? 'Error' : null}
          subtitle={dora ? `${dora.deployment_frequency.total_deployments} total, ${dora.deployment_frequency.successful} successful` : doraQuery.isError ? 'Failed to load' : null}
          level={dora?.deployment_frequency.level ?? null}
          trend={dora?.deployment_frequency.trend_percent ?? null}
          isLoading={doraQuery.isLoading}
          hasData={(dora?.deployment_frequency.total_deployments ?? 0) > 0}
        />
        <DoraScoreCard
          title="Lead time for changes"
          value={dora?.lead_time.avg_lead_time_hours != null ? `${dora.lead_time.avg_lead_time_hours.toFixed(1)}h` : doraQuery.isError ? 'Error' : null}
          subtitle={dora ? `${dora.lead_time.total_prs} PRs, ${dora.lead_time.prs_with_lead_time} measured` : doraQuery.isError ? 'Failed to load' : null}
          level={dora?.lead_time.level ?? null}
          trend={null}
          isLoading={doraQuery.isLoading}
          hasData={(dora?.lead_time.prs_with_lead_time ?? 0) > 0 && dora?.lead_time.avg_lead_time_hours != null}
        />
        <DoraScoreCard
          title="Change failure rate"
          value={dora ? `${dora.change_failure_rate.failure_rate_percent.toFixed(1)}%` : doraQuery.isError ? 'Error' : null}
          subtitle={dora ? `${dora.change_failure_rate.failed_deployments} of ${dora.change_failure_rate.total_deployments} failed` : doraQuery.isError ? 'Failed to load' : null}
          level={dora?.change_failure_rate.level ?? null}
          trend={null}
          isLoading={doraQuery.isLoading}
          hasData={(dora?.change_failure_rate.total_deployments ?? 0) > 0}
        />
        <DoraScoreCard
          title="Mean time to recovery"
          value={dora?.mean_time_to_recovery.avg_mttr_hours != null ? `${dora.mean_time_to_recovery.avg_mttr_hours.toFixed(1)}h` : doraQuery.isError ? 'Error' : null}
          subtitle={dora ? `${dora.mean_time_to_recovery.incidents_recovered} incidents recovered` : doraQuery.isError ? 'Failed to load' : null}
          level={dora?.mean_time_to_recovery.level ?? null}
          trend={null}
          isLoading={doraQuery.isLoading}
          hasData={(dora?.mean_time_to_recovery.incidents_recovered ?? 0) > 0 && dora?.mean_time_to_recovery.avg_mttr_hours != null}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2" style={{ marginBottom: 24 }}>
        <CycleTimeTrend data={cycleTrendQuery.data ?? []} isLoading={cycleTrendQuery.isLoading} />
        <PrSizeChart data={prSizeQuery.data ?? []} isLoading={prSizeQuery.isLoading} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OpenPrAlert data={openPrsQuery.data ?? []} isLoading={openPrsQuery.isLoading} />
        </div>
        <div className="lg:col-span-3">
          <RecentDeployments data={deploymentsQuery.data ?? []} isLoading={deploymentsQuery.isLoading} />
        </div>
      </div>
    </div>
  )
}
