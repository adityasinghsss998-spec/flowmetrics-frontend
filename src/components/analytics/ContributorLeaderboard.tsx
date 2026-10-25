'use client'

import { useState } from 'react'
import { AuthorStats, ReviewerStats } from '@/types/api'
import { cn } from '@/lib/utils'

interface Props {
  authors: AuthorStats[]
  reviewers: ReviewerStats[]
  isLoading: boolean
  onSelectAuthor: (username: string) => void
}

function Skeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
      ))}
    </div>
  )
}

export default function ContributorLeaderboard({ authors, reviewers, isLoading, onSelectAuthor }: Props) {
  const [tab, setTab] = useState<'authors' | 'reviewers'>('authors')

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] overflow-hidden">
      <div className="p-5 pb-3 border-b border-[var(--fm-line)]/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Contributor leaderboard</h3>
            <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Top authors and reviewers</p>
          </div>
        </div>

        <div className="flex gap-1 border border-[var(--fm-line)] bg-[var(--fm-surface)] p-0.5 rounded-[4px]">
          <button
            onClick={() => setTab('authors')}
            className={cn(
              'flex-1 py-1 font-mono text-xs transition-colors rounded-[2px]',
              tab === 'authors'
                ? 'bg-[var(--fm-surface-raised)] text-[var(--fm-text)] border border-[var(--fm-line)] font-medium'
                : 'fm-nav-link text-[var(--fm-text-muted)]'
            )}
          >
            <span>Authors</span>
          </button>
          <button
            onClick={() => setTab('reviewers')}
            className={cn(
              'flex-1 py-1 font-mono text-xs transition-colors rounded-[2px]',
              tab === 'reviewers'
                ? 'bg-[var(--fm-surface-raised)] text-[var(--fm-text)] border border-[var(--fm-line)] font-medium'
                : 'fm-nav-link text-[var(--fm-text-muted)]'
            )}
          >
            <span>Reviewers</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : tab === 'authors' ? (
        <div className="divide-y divide-[var(--fm-line)]">
          {authors.length === 0 ? (
            <div className="flex h-36 items-center justify-center font-mono text-xs text-[var(--fm-text-muted)]">No author data</div>
          ) : (
            authors.slice(0, 10).map((a, i) => (
              <button
                key={a.author_username}
                onClick={() => onSelectAuthor(a.author_username)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[var(--fm-surface)] transition-colors group cursor-pointer"
              >
                <div className="font-mono text-xs text-[var(--fm-text-muted)] w-5 shrink-0 tabular-nums">
                  {i + 1}.
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-medium text-[var(--fm-text)] truncate group-hover:text-[var(--fm-accent)] transition-colors">
                    @{a.author_username}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--fm-text-muted)] mt-0.5 tabular-nums">
                    {a.prs_merged} PRs · {Number(a.total_lines_changed).toLocaleString()} lines
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs text-[var(--fm-text-muted)]">Cycle</p>
                  <p className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">
                    {a.avg_cycle_hours != null ? `${Number(a.avg_cycle_hours).toFixed(1)}h` : '-'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="divide-y divide-[var(--fm-line)]">
          {reviewers.length === 0 ? (
            <div className="flex h-36 items-center justify-center font-mono text-xs text-[var(--fm-text-muted)]">No reviewer data</div>
          ) : (
            reviewers.slice(0, 10).map((r, i) => (
              <div
                key={r.reviewer_username}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--fm-surface)] transition-colors"
              >
                <div className="font-mono text-xs text-[var(--fm-text-muted)] w-5 shrink-0 tabular-nums">
                  {i + 1}.
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-medium text-[var(--fm-text)] truncate">
                    @{r.reviewer_username}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--fm-text-muted)] mt-0.5 tabular-nums">
                    {r.total_reviews} reviews ({r.approvals} approved)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs text-[var(--fm-text-muted)]">Turnaround</p>
                  <p className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">
                    {r.avg_review_turnaround_hours != null ? `${Number(r.avg_review_turnaround_hours).toFixed(1)}h` : '-'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
