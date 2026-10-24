'use client'

import { ContributorTrendPoint } from '@/types/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Props {
  username: string
  data: ContributorTrendPoint[]
  isLoading: boolean
}

interface TooltipPayloadItem {
  color: string
  name: string
  value: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)] p-3 text-xs min-w-36">
      <p className="font-mono font-medium text-[var(--fm-text)] mb-2 pb-1.5 border-b border-[var(--fm-line)]">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-3 rounded-[1px]" style={{ backgroundColor: item.color }} />
              <span className="text-[var(--fm-text-muted)]">{item.name}</span>
            </span>
            <span className="font-mono font-medium text-[var(--fm-text)] tabular-nums">
              {item.name.includes('PRs') || item.name.includes('Commits')
                ? item.value
                : `${item.value}h`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: { color: string; value: string }[] }) {
  if (!payload) return null
  return (
    <div className="flex items-center justify-center gap-6 pt-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded-[1px]" style={{ backgroundColor: entry.color }} />
          <span className="font-mono text-[11px] text-[var(--fm-text-muted)]">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ContributorTrend({ username, data, isLoading }: Props) {
  const chartData = data.map((pt) => ({
    week: pt.week_start,
    PRs: pt.prs_merged,
    'Cycle Time': pt.avg_cycle_hours != null ? Number(Number(pt.avg_cycle_hours).toFixed(1)) : 0,
    Commits: pt.total_commits,
    Lines: pt.lines_changed,
  }))

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Activity Trend · @{username}</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Weekly pull requests merged and cycle time</p>
        </div>
      </div>

      <div className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-56 w-full rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed border-[var(--fm-line)] rounded-[4px]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">No trend data for @{username}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="var(--fm-line)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: '#A0A498', fontFamily: 'var(--font-ibm-plex-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#A0A498', fontFamily: 'var(--font-ibm-plex-mono)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--fm-line)', strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="PRs"
                stroke="var(--fm-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--fm-accent)', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Cycle Time"
                stroke="var(--fm-text-muted)"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Commits"
                stroke="var(--fm-status-good)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
