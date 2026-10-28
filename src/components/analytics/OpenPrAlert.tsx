'use client'

import { OpenPr } from '@/types/api'
import { cn } from '@/lib/utils'

interface OpenPrAlertProps {
  data: OpenPr[]
  isLoading: boolean
}

function PrRow({ pr }: { pr: OpenPr }) {
  const size = pr.additions + pr.deletions
  const sizeLabel = size < 50 ? 'XS' : size < 200 ? 'S' : size < 500 ? 'M' : 'XL'

  return (
    <div className={cn(
      'p-3.5 border-b border-[var(--fm-line)] last:border-b-0 transition-colors',
      pr.is_critical ? 'bg-[var(--fm-status-poor)]/5' : pr.is_stale ? 'bg-[var(--fm-status-caution)]/5' : 'hover:bg-[var(--fm-surface)]'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-[var(--fm-text-muted)]">#{pr.number}</span>
            {pr.is_critical && (
              <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-status-poor)]/40 text-[var(--fm-status-poor)]">
                Critical
              </span>
            )}
            {!pr.is_critical && pr.is_stale && (
              <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-status-caution)]/40 text-[var(--fm-status-caution)]">
                Stale
              </span>
            )}
            {pr.needs_review && (
              <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-line)] text-[var(--fm-text)]">
                Review
              </span>
            )}
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-line)] text-[var(--fm-text-muted)]">
              {sizeLabel}
            </span>
          </div>

          <p className="text-sm font-medium text-[var(--fm-text)] leading-snug truncate">
            {pr.title}
          </p>
          <p className="font-mono text-xs text-[var(--fm-text-muted)] mt-0.5">
            by @{pr.author_username}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">
            {pr.waiting_hours >= 24
              ? `${Math.floor(pr.waiting_hours / 24)}d ${Math.round(pr.waiting_hours % 24)}h`
              : `${Math.round(pr.waiting_hours)}h`}
          </span>
          <span className="text-[11px] text-[var(--fm-text-muted)]">waiting</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2.5 text-xs text-[var(--fm-text-muted)] font-mono">
        <span className="tabular-nums">
          <span className="text-[var(--fm-status-good)]">+{pr.additions}</span>
          {' '}
          <span className="text-[var(--fm-status-poor)]">-{pr.deletions}</span>
        </span>
        <span>·</span>
        <span>{pr.changed_files} files</span>
        <span>·</span>
        <span>
          {pr.review_count > 0 ? `${pr.review_count} review${pr.review_count !== 1 ? 's' : ''}` : 'no reviews'}
        </span>
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
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] h-full flex flex-col">
      <div className="p-5 flex items-center justify-between shrink-0 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Open pull requests</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Needs attention</p>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <span className="font-mono text-xs px-2 py-0.5 rounded-[2px] border border-[var(--fm-status-poor)]/40 text-[var(--fm-status-poor)] tabular-nums">
                {urgentCount} urgent
              </span>
            )}
            <span className="font-mono text-xs px-2 py-0.5 rounded-[2px] border border-[var(--fm-line)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)] tabular-nums">
              {data.length} total
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            <p className="font-mono text-sm font-medium text-[var(--fm-text)]">All clear</p>
            <p className="text-xs text-[var(--fm-text-muted)] mt-1">No open pull requests need attention.</p>
          </div>
        ) : (
          <div>
            {sorted.map((pr) => (
              <PrRow key={pr.id} pr={pr} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
