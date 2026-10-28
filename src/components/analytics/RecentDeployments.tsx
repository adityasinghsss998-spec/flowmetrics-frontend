'use client'

import { RecentDeployment } from '@/types/api'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentDeploymentsProps {
  data: RecentDeployment[]
  isLoading: boolean
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    label: 'Success',
    className: 'text-[var(--fm-status-good)]',
    badgeClass: 'border-[var(--fm-status-good)]/30 text-[var(--fm-status-good)] bg-[var(--fm-status-good)]/10',
  },
  failure: {
    icon: XCircle,
    label: 'Failed',
    className: 'text-[var(--fm-status-poor)]',
    badgeClass: 'border-[var(--fm-status-poor)]/30 text-[var(--fm-status-poor)] bg-[var(--fm-status-poor)]/10',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'text-[var(--fm-text-muted)]',
    badgeClass: 'border-[var(--fm-line)] text-[var(--fm-text-muted)] bg-[var(--fm-surface)]',
  },
  in_progress: {
    icon: Loader2,
    label: 'Running',
    className: 'text-[var(--fm-accent)] animate-spin',
    badgeClass: 'border-[var(--fm-accent)]/30 text-[var(--fm-accent)] bg-[var(--fm-accent)]/10',
  },
} as const

export default function RecentDeployments({ data, isLoading }: RecentDeploymentsProps) {
  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Recent deployments</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Latest deployment activity</p>
        </div>
        {data.length > 0 && (
          <span className="font-mono text-xs text-[var(--fm-text-muted)]">
            {data.length} recorded
          </span>
        )}
      </div>

      <div>
        {isLoading ? (
          <div className="p-5 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-mono text-sm font-medium text-[var(--fm-text)]">No deployments yet</p>
            <p className="text-xs text-[var(--fm-text-muted)] mt-1">Deployment history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="fm-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Environment</th>
                  <th>SHA</th>
                  <th className="hidden sm:table-cell">Deployed by</th>
                  <th className="hidden md:table-cell">Build</th>
                  <th className="text-right pr-5">When</th>
                </tr>
              </thead>
              <tbody>
                {data.map((dep) => {
                  const cfg = STATUS_CONFIG[dep.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                  const Icon = cfg.icon
                  const hoursAgo = Number(dep.hours_ago)

                  let relativeTime = ''
                  if (hoursAgo < 1) {
                    relativeTime = `${Math.max(1, Math.round(hoursAgo * 60))}m ago`
                  } else if (hoursAgo < 24) {
                    relativeTime = `${Math.round(hoursAgo)}h ago`
                  } else {
                    relativeTime = `${Math.floor(hoursAgo / 24)}d ago`
                  }

                  return (
                    <tr key={dep.id}>
                      <td>
                        <span className="flex items-center gap-1.5">
                          <Icon className={cn('h-3.5 w-3.5', cfg.className)} />
                          <span
                            className={cn(
                              'font-mono text-xs px-1.5 py-0.5 rounded-[2px] border font-medium',
                              cfg.badgeClass
                            )}
                          >
                            {cfg.label}
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--fm-text)] capitalize">
                          {dep.environment}
                        </span>
                      </td>
                      <td>
                        <code className="font-mono text-xs text-[var(--fm-text-muted)] bg-[var(--fm-surface)] px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-line)]">
                          {dep.sha ? dep.sha.slice(0, 7) : '-'}
                        </code>
                      </td>
                      <td className="hidden sm:table-cell font-mono text-xs text-[var(--fm-text-muted)]">
                        {dep.deployed_by_username ? `@${dep.deployed_by_username}` : '-'}
                      </td>
                      <td className="hidden md:table-cell font-mono text-xs text-[var(--fm-text-muted)] tabular-nums">
                        {dep.build_duration_minutes != null
                          ? `${Number(dep.build_duration_minutes).toFixed(1)}m`
                          : '-'}
                      </td>
                      <td className="text-right pr-5 font-mono text-xs text-[var(--fm-text-muted)] tabular-nums">
                        {relativeTime}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
