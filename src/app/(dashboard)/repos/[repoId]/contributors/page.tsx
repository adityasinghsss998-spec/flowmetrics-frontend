'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '@/lib/axios'
import { ContributorData, HeatmapPoint, ContributorTrendPoint } from '@/types/api'
import ContributorLeaderboard from '@/components/analytics/ContributorLeaderboard'
import ReviewHeatmap from '@/components/analytics/ReviewHeatmap'
import ContributorTrend from '@/components/analytics/ContributorTrend'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import { useCurrentRepo } from '@/hooks/useCurrentRepo'

export default function ContributorsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const repoId = params.repoId as string
  const days = Number(searchParams.get('days') ?? 30)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const { repoFullName } = useCurrentRepo(repoId)

  const contributorsQuery = useQuery<ContributorData>({
    queryKey: ['contributors', repoId, days],
    queryFn: () =>
      api.get(`/analytics/contributors?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const heatmapQuery = useQuery<HeatmapPoint[]>({
    queryKey: ['heatmap', repoId, days],
    queryFn: () =>
      api.get(`/analytics/reviews/heatmap?repoId=${repoId}&days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const trendQuery = useQuery<ContributorTrendPoint[]>({
    queryKey: ['contributor-trend', repoId, selectedAuthor, days],
    queryFn: () =>
      api
        .get(`/analytics/contributors/${selectedAuthor}/trend?repoId=${repoId}&days=${days}`)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId && !!selectedAuthor,
  })

  const contrib = contributorsQuery.data

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
              Contributors
            </h1>
            <p className="font-mono text-xs text-[var(--fm-text-muted)] mt-1">
              {repoFullName || `Repository #${repoId}`} · {days}-day review and commit metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContributorLeaderboard
          authors={contrib?.authors ?? []}
          reviewers={contrib?.reviewers ?? []}
          isLoading={contributorsQuery.isLoading}
          onSelectAuthor={(u) => setSelectedAuthor(u)}
        />
        <ReviewHeatmap
          data={heatmapQuery.data ?? []}
          isLoading={heatmapQuery.isLoading}
        />
      </div>

      {selectedAuthor && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--fm-text)] font-medium">
              Author drill-down: @{selectedAuthor}
            </span>
            <button
              onClick={() => setSelectedAuthor(null)}
              className="font-mono text-xs text-[var(--fm-text-muted)] hover:text-[var(--fm-accent)] transition-colors cursor-pointer"
            >
              [clear]
            </button>
          </div>
          <ContributorTrend
            username={selectedAuthor}
            data={trendQuery.data ?? []}
            isLoading={trendQuery.isLoading}
          />
        </div>
      )}
    </div>
  )
}
