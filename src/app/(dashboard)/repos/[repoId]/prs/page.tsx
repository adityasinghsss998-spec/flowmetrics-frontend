'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, Eye, Plus, Minus } from 'lucide-react'
import api from '@/lib/axios'
import { OpenPr } from '@/types/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function SizeBar({ additions, deletions }: { additions: number; deletions: number }) {
  const total = additions + deletions
  const addRatio = total > 0 ? (additions / total) * 100 : 50
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="text-[var(--fm-status-good)] tabular-nums flex items-center">
        <Plus className="h-3 w-3" />{additions}
      </span>
      <div className="h-1.5 w-16 bg-[var(--fm-surface)] border border-[var(--fm-line)] overflow-hidden rounded-[1px]">
        <div className="h-full bg-[var(--fm-status-good)]" style={{ width: `${addRatio}%` }} />
      </div>
      <span className="text-[var(--fm-status-poor)] tabular-nums flex items-center">
        <Minus className="h-3 w-3" />{deletions}
      </span>
    </div>
  )
}

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-4 flex flex-col gap-1">
      <p className="font-mono text-xs text-[var(--fm-text-muted)]">{label}</p>
      <p className="font-mono text-2xl font-bold text-[var(--fm-text)] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--fm-text-muted)]">{sub}</p>}
    </div>
  )
}

import { useCurrentRepo } from '@/hooks/useCurrentRepo'

export default function PrsPage() {
  const params = useParams()
  const router = useRouter()
  const repoId = params.repoId as string
  const { repoFullName } = useCurrentRepo(repoId)

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
    <div style={{ maxWidth: 1120, padding: '32px 24px' }} className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[var(--fm-line)]">
        <div className="flex items-center gap-4">
          <Button
            id="back-to-repo"
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/repos/${repoId}`)}
            className="border border-[var(--fm-line)] hover:bg-[var(--fm-surface)]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Overview
          </Button>
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-[var(--fm-text)]">
              Open Pull Requests
            </h1>
            <p className="font-mono text-xs text-[var(--fm-text-muted)] mt-1">
              {repoFullName || `Repository #${repoId}`} · Open pull requests ranked by wait time
            </p>
          </div>
        </div>

        {!prsQuery.isLoading && prs.length > 0 && (
          <div className="flex items-center gap-2 border border-[var(--fm-line)] bg-[var(--fm-surface)] px-3 py-1 rounded-[4px]">
            <span className="font-mono text-xs font-semibold text-[var(--fm-text)] tabular-nums">{prs.length}</span>
            <span className="font-mono text-xs text-[var(--fm-text-muted)]">open PRs</span>
          </div>
        )}
      </div>

      {!prsQuery.isLoading && prs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard label="Open PRs" value={prs.length} sub="awaiting merge" />
          <SummaryCard label="Stale" value={staleCount} sub=">48h no activity" />
          <SummaryCard label="Critical" value={criticalCount} sub="urgent attention" />
          <SummaryCard label="Avg Wait" value={`${Number(Number(avgWait).toFixed(1))}h`} sub="time awaiting review" />
        </div>
      )}

      <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[var(--fm-line)]/50">
          <div>
            <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Pull Request Queue</h3>
            <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Ranked by waiting time</p>
          </div>
          {needsReviewCount > 0 && (
            <span className="font-mono text-xs px-2 py-0.5 rounded-[2px] border border-[var(--fm-line)] bg-[var(--fm-surface)] text-[var(--fm-text)] flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              {needsReviewCount} need review
            </span>
          )}
        </div>

        <div className="divide-y divide-[var(--fm-line)]">
          {prsQuery.isLoading ? (
            <div className="p-5 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
              ))}
            </div>
          ) : prs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <p className="font-mono text-sm font-medium text-[var(--fm-text)]">No open pull requests</p>
              <p className="text-xs text-[var(--fm-text-muted)] mt-1">All pull requests have been merged or closed.</p>
            </div>
          ) : (
            prs.map((pr) => {
              const reviewers = pr.reviewers ? pr.reviewers.split(',').map((r) => r.trim()).filter(Boolean) : []
              return (
                <div
                  key={pr.id}
                  className={cn(
                    'p-4 transition-colors',
                    pr.is_critical
                      ? 'bg-[var(--fm-status-poor)]/5'
                      : pr.is_stale
                      ? 'bg-[var(--fm-status-caution)]/5'
                      : 'hover:bg-[var(--fm-surface)]'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-[var(--fm-text-muted)]">#{pr.number}</span>
                        {pr.is_critical && (
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-status-poor)]/40 text-[var(--fm-status-poor)] font-medium">
                            Critical
                          </span>
                        )}
                        {!pr.is_critical && pr.is_stale && (
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-status-caution)]/40 text-[var(--fm-status-caution)] font-medium">
                            Stale
                          </span>
                        )}
                        {pr.needs_review && (
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-line)] text-[var(--fm-text)]">
                            Needs review
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[var(--fm-text)] leading-snug truncate">{pr.title}</p>
                      <p className="font-mono text-xs text-[var(--fm-text-muted)] mt-0.5">
                        by @{pr.author_username}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1 font-mono text-xs text-[var(--fm-text)]">
                        <Clock className="h-3 w-3 text-[var(--fm-text-muted)]" />
                        <span className="tabular-nums font-medium">
                          {pr.waiting_hours >= 24
                            ? `${Math.floor(pr.waiting_hours / 24)}d ${Math.round(pr.waiting_hours % 24)}h`
                            : `${Math.round(pr.waiting_hours)}h`}
                        </span>
                        <span className="text-[var(--fm-text-muted)] text-[11px]">waiting</span>
                      </div>
                      {pr.review_count > 0 && (
                        <span className="font-mono text-[11px] text-[var(--fm-text-muted)]">
                          {pr.review_count} review{pr.review_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-3 flex-wrap">
                    <SizeBar additions={pr.additions} deletions={pr.deletions} />

                    <div className="flex items-center gap-3 font-mono text-xs text-[var(--fm-text-muted)]">
                      <span>{pr.changed_files} files</span>

                      {reviewers.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span>reviewers:</span>
                          <div className="flex gap-1">
                            {reviewers.map((r) => (
                              <span key={r} className="text-[var(--fm-text)] bg-[var(--fm-surface)] px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-line)]">
                                @{r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {pr.time_to_first_review_hours != null && (
                        <span className="tabular-nums">
                          1st review: {Number(Number(pr.time_to_first_review_hours).toFixed(1))}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
