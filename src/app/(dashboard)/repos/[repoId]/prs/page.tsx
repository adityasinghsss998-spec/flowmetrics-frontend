'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { GitPullRequest, ArrowLeft, AlertTriangle, Clock, Eye, Plus, Minus, Users2 } from 'lucide-react'
import api from '@/lib/axios'
import { OpenPr } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function PrAlertBadge({ label, variant }: { label: string; variant: 'stale' | 'critical' | 'review' }) {
  const styles = {
    stale: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  return (
    <Badge className={cn('h-4 text-[10px] px-1.5 border font-medium', styles[variant])}>
      {label}
    </Badge>
  )
}

function SizeBar({ additions, deletions }: { additions: number; deletions: number }) {
  const total = additions + deletions
  const addRatio = total > 0 ? (additions / total) * 100 : 50
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-emerald-400 font-semibold tabular-nums flex items-center gap-0.5">
        <Plus className="h-2.5 w-2.5" />{additions}
      </span>
      <div className="h-1.5 w-16 rounded-full bg-white/[0.05] overflow-hidden">
        <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${addRatio}%` }} />
      </div>
      <span className="text-[10px] text-red-400 font-semibold tabular-nums flex items-center gap-0.5">
        <Minus className="h-2.5 w-2.5" />{deletions}
      </span>
    </div>
  )
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={cn('flex flex-col gap-0.5 rounded-xl border px-3 py-2.5', color)}>
      <p className="text-[10px] text-muted-foreground/60">{label}</p>
      <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground/50">{sub}</p>}
    </div>
  )
}

export default function PrsPage() {
  const params = useParams()
  const router = useRouter()
  const repoId = params.repoId as string

  const prsQuery = useQuery<OpenPr[]>({
    queryKey: ['open-prs', repoId],
    queryFn: () =>
      api.get(`/analytics/prs/open?repoId=${repoId}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!repoId,
  })

  const prs = prsQuery.data ?? []
  const staleCount = prs.filter((p) => p.is_stale).length
  const criticalCount = prs.filter((p) => p.is_critical).length
  const needsReviewCount = prs.filter((p) => p.needs_review).length
  const avgWait = prs.length > 0
    ? prs.reduce((s, p) => s + Number(p.waiting_hours), 0) / prs.length
    : 0

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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
              <GitPullRequest className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                Open Pull Requests
              </h1>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                Repository #{repoId}
              </p>
            </div>
          </div>
        </div>

        {!prsQuery.isLoading && prs.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 backdrop-blur">
            <span className="text-xs font-semibold text-foreground tabular-nums">{prs.length}</span>
            <span className="text-xs text-muted-foreground/60">open PRs</span>
          </div>
        )}
      </div>

      {!prsQuery.isLoading && prs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Open PRs" value={prs.length} sub="awaiting merge" color="border-blue-500/15 bg-blue-500/5" />
          <SummaryCard label="Stale" value={staleCount} sub=">48h no activity" color="border-amber-500/15 bg-amber-500/5" />
          <SummaryCard label="Critical" value={criticalCount} sub="needs urgent review" color="border-red-500/15 bg-red-500/5" />
          <SummaryCard label="Avg Wait" value={`${Number(Number(avgWait).toFixed(1))}h`} sub="since opened" color="border-indigo-500/15 bg-indigo-500/5" />
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
              <GitPullRequest className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Pull Request Queue</span>
            {needsReviewCount > 0 && (
              <span className="ml-2 flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400 font-medium">
                <Eye className="h-2.5 w-2.5" />{needsReviewCount} need review
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/50 ml-9">All open PRs ranked by waiting time</p>
        </div>

        <div className="px-4 pb-4">
          {prsQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : prs.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.05]">
              <GitPullRequest className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">No open pull requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prs.map((pr) => {
                const reviewers = pr.reviewers ? pr.reviewers.split(',').map((r) => r.trim()).filter(Boolean) : []
                return (
                  <div
                    key={pr.id}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl border px-4 py-3 transition-colors',
                      pr.is_critical
                        ? 'border-red-500/20 bg-red-500/[0.03]'
                        : pr.is_stale
                        ? 'border-amber-500/15 bg-amber-500/[0.02]'
                        : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground/50">#{pr.number}</span>
                          {pr.is_critical && <PrAlertBadge label="Critical" variant="critical" />}
                          {pr.is_stale && <PrAlertBadge label="Stale" variant="stale" />}
                          {pr.needs_review && <PrAlertBadge label="Needs Review" variant="review" />}
                        </div>
                        <p className="text-sm font-medium text-foreground leading-snug truncate">{pr.title}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          by @{pr.author_username}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                          <Clock className="h-2.5 w-2.5" />
                          <span className="tabular-nums font-medium text-foreground">
                            {Number(Number(pr.waiting_hours).toFixed(0))}h
                          </span>
                          <span>waiting</span>
                        </div>
                        {pr.review_count > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Eye className="h-2.5 w-2.5" />
                            <span>{pr.review_count} review{pr.review_count !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <SizeBar additions={pr.additions} deletions={pr.deletions} />

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground/50">{pr.changed_files} files</span>

                        {reviewers.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users2 className="h-2.5 w-2.5 text-muted-foreground/40" />
                            <div className="flex gap-1">
                              {reviewers.slice(0, 3).map((r) => (
                                <span key={r} className="text-[10px] text-muted-foreground/60 bg-white/[0.04] rounded px-1 py-0.5">
                                  @{r}
                                </span>
                              ))}
                              {reviewers.length > 3 && (
                                <span className="text-[10px] text-muted-foreground/40">+{reviewers.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {pr.time_to_first_review_hours != null && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span className="tabular-nums">
                              1st review: {Number(Number(pr.time_to_first_review_hours).toFixed(1))}h
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
