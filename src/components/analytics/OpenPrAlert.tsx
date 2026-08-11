'use client'

import { OpenPr } from '@/types/api'
import { AlertTriangle, Clock, Eye, EyeOff, GitPullRequest } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OpenPrAlertProps {
  data: OpenPr[]
  isLoading: boolean
}

function PrRow({ pr }: { pr: OpenPr }) {
  const size = pr.additions + pr.deletions
  const sizeLabel = size < 50 ? 'XS' : size < 200 ? 'S' : size < 500 ? 'M' : 'XL'
  const sizeColors: Record<string, string> = {
    XS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
    S:  'text-blue-400 bg-blue-500/10 border-blue-500/15',
    M:  'text-amber-400 bg-amber-500/10 border-amber-500/15',
    XL: 'text-red-400 bg-red-500/10 border-red-500/15',
  }

  const rowVariant = pr.is_critical
    ? 'border-red-500/25 bg-red-500/5 hover:bg-red-500/8'
    : pr.is_stale
    ? 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/8'
    : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04]'

  return (
    <div className={cn(
      'rounded-xl border p-3 transition-all duration-200 cursor-default',
      rowVariant
    )}>
      <div className="flex items-start gap-2.5">
        <div className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border mt-0.5',
          pr.is_critical ? 'border-red-500/20 bg-red-500/10' : pr.is_stale ? 'border-amber-500/20 bg-amber-500/10' : 'border-white/[0.06] bg-white/[0.02]'
        )}>
          <GitPullRequest className={cn(
            'h-3 w-3',
            pr.is_critical ? 'text-red-400' : pr.is_stale ? 'text-amber-400' : 'text-indigo-400'
          )} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-foreground leading-snug truncate">{pr.title}</p>
            <div className={cn('shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', sizeColors[sizeLabel])}>
              {sizeLabel}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
            #{pr.number} · @{pr.author_username}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
        <div className={cn(
          'flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border',
          pr.waiting_hours > 48
            ? 'text-red-400 bg-red-500/8 border-red-500/15'
            : pr.waiting_hours > 24
            ? 'text-amber-400 bg-amber-500/8 border-amber-500/15'
            : 'text-muted-foreground/60 bg-white/[0.02] border-white/[0.05]'
        )}>
          <Clock className="h-2.5 w-2.5" />
          {pr.waiting_hours >= 24
            ? `${Math.floor(pr.waiting_hours / 24)}d ${Math.round(pr.waiting_hours % 24)}h`
            : `${Math.round(pr.waiting_hours)}h`}
        </div>

        <span className="text-[10px] text-muted-foreground/40">
          <span className="text-emerald-500/70">+{pr.additions}</span>
          {' '}
          <span className="text-red-500/70">-{pr.deletions}</span>
          {' · '}
          {pr.changed_files}f
        </span>

        {pr.review_count > 0 ? (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500/70">
            <Eye className="h-2.5 w-2.5" />
            {pr.review_count}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-amber-500/70">
            <EyeOff className="h-2.5 w-2.5" />
            no reviews
          </span>
        )}

        {pr.is_critical && (
          <span className="rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-400">
            Critical
          </span>
        )}
        {!pr.is_critical && pr.is_stale && (
          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400">
            Stale
          </span>
        )}
        {pr.needs_review && (
          <span className="rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-400">
            Review
          </span>
        )}
      </div>
    </div>
  )
}

export default function OpenPrAlert({ data, isLoading }: OpenPrAlertProps) {
  const critical = data.filter((p) => p.is_critical)
  const stale = data.filter((p) => !p.is_critical && p.is_stale)
  const needs = data.filter((p) => !p.is_critical && !p.is_stale && p.needs_review)
  const rest = data.filter((p) => !p.is_critical && !p.is_stale && !p.needs_review)
  const sorted = [...critical, ...stale, ...needs, ...rest]

  const urgentCount = critical.length + stale.length

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl h-full flex flex-col">
      <div className={cn(
        'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
        urgentCount > 0 ? 'via-amber-500/40' : 'via-white/10'
      )} />

      <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg border',
            urgentCount > 0
              ? 'border-amber-500/20 bg-amber-500/10'
              : 'border-white/[0.06] bg-white/[0.02]'
          )}>
            <AlertTriangle className={cn('h-3.5 w-3.5', urgentCount > 0 ? 'text-amber-400' : 'text-muted-foreground/40')} />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Open PRs</span>
            <p className="text-[11px] text-muted-foreground/50">Needs attention</p>
          </div>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-1.5">
            {urgentCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-1.5 text-[10px] font-bold text-red-400">
                {urgentCount}
              </span>
            )}
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5 text-[10px] font-medium text-muted-foreground/60">
              {data.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center h-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 mb-3">
              <GitPullRequest className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground/50 mt-1">No open PRs need attention.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((pr) => (
              <PrRow key={pr.id} pr={pr} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
