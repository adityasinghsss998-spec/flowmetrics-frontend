'use client'

import { useState } from 'react'
import { AuthorStats, ReviewerStats } from '@/types/api'
import { cn } from '@/lib/utils'
import { Trophy, Star, GitMerge, Eye, Clock, Code2, ThumbsUp } from 'lucide-react'

interface Props {
  authors: AuthorStats[]
  reviewers: ReviewerStats[]
  isLoading: boolean
  onSelectAuthor: (username: string) => void
}

const RANK_COLORS = ['text-amber-400', 'text-slate-300', 'text-amber-600']
const RANK_BG = ['bg-amber-500/10 border-amber-500/20', 'bg-slate-500/10 border-slate-500/20', 'bg-amber-700/10 border-amber-700/20']

function Skeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
      ))}
    </div>
  )
}

export default function ContributorLeaderboard({ authors, reviewers, isLoading, onSelectAuthor }: Props) {
  const [tab, setTab] = useState<'authors' | 'reviewers'>('authors')

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      <div className="absolute -top-10 right-1/4 h-28 w-40 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
            <Trophy className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Contributor Leaderboard</span>
        </div>

        <div className="flex gap-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-1">
          <button
            onClick={() => setTab('authors')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              tab === 'authors'
                ? 'bg-violet-600/20 text-violet-300 shadow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <GitMerge className="h-3 w-3" />
            Authors
          </button>
          <button
            onClick={() => setTab('reviewers')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              tab === 'reviewers'
                ? 'bg-violet-600/20 text-violet-300 shadow'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="h-3 w-3" />
            Reviewers
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : tab === 'authors' ? (
        <div className="px-4 pb-4 space-y-1.5">
          {authors.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-sm text-muted-foreground/50">No author data</div>
          ) : (
            authors.slice(0, 10).map((a, i) => (
              <button
                key={a.author_username}
                onClick={() => onSelectAuthor(a.author_username)}
                className="w-full flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-left hover:bg-white/[0.05] hover:border-violet-500/20 transition-all group"
              >
                <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold', i < 3 ? RANK_BG[i] : 'bg-white/[0.03] border-white/[0.06]')}>
                  <span className={cn(i < 3 ? RANK_COLORS[i] : 'text-muted-foreground')}>{i + 1}</span>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 border border-violet-500/20">
                  <span className="text-[11px] font-bold text-violet-400">{a.author_username[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-violet-300 transition-colors">@{a.author_username}</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {a.prs_merged} PRs · {Number(a.total_lines_changed).toLocaleString()} lines
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-muted-foreground/50">Cycle</p>
                    <p className="text-xs font-semibold text-foreground tabular-nums">
                      {a.avg_cycle_hours != null ? `${Number(Number(a.avg_cycle_hours).toFixed(1))}h` : '—'}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] text-muted-foreground/50">Commits</p>
                    <p className="text-xs font-semibold text-foreground tabular-nums">{a.total_commits}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-1.5">
          {reviewers.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-sm text-muted-foreground/50">No reviewer data</div>
          ) : (
            reviewers.slice(0, 10).map((r, i) => {
              const approvalRate = r.total_reviews > 0 ? Math.round((r.approvals / r.total_reviews) * 100) : 0
              return (
                <div
                  key={r.reviewer_username}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold', i < 3 ? RANK_BG[i] : 'bg-white/[0.03] border-white/[0.06]')}>
                    <span className={cn(i < 3 ? RANK_COLORS[i] : 'text-muted-foreground')}>{i + 1}</span>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
                    <span className="text-[11px] font-bold text-emerald-400">{r.reviewer_username[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">@{r.reviewer_username}</p>
                    <p className="text-[10px] text-muted-foreground/60">{r.total_reviews} reviews · {r.unique_prs_reviewed} PRs</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-2.5 w-2.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400 tabular-nums">{approvalRate}%</span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />avg</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        {r.avg_review_turnaround_hours != null ? `${Number(Number(r.avg_review_turnaround_hours).toFixed(1))}h` : '—'}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />CRs</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums">{r.change_requests}</p>
                    </div>
                    <div className="text-right hidden lg:block">
                      <p className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5"><Code2 className="h-2.5 w-2.5" />fast</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        {r.fastest_review_hours != null ? `${Number(Number(r.fastest_review_hours).toFixed(1))}h` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
