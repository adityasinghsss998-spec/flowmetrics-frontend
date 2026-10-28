'use client'

import { BuildDurationPoint, BuildDurationSummary } from '@/types/api'
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
  trend: BuildDurationPoint[]
  summary: BuildDurationSummary | null
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
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)] p-3 text-xs min-w-40">
      <p className="font-mono font-medium text-[var(--fm-text)] mb-2 pb-1.5 border-b border-[var(--fm-line)]">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-3 rounded-[1px]" style={{ backgroundColor: item.color }} />
              <span className="text-[var(--fm-text-muted)]">{item.name}</span>
            </span>
            <span className="font-mono font-medium text-[var(--fm-text)] tabular-nums">{item.value != null ? `${item.value}m` : '-'}</span>
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

export default function BuildDurationTrend({ trend, summary, isLoading }: Props) {
  const chartData = trend.map((pt) => ({
    week: pt.week_start,
    'Avg Build': pt.avg_build_minutes != null ? Number(Number(pt.avg_build_minutes).toFixed(1)) : 0,
    '4-Week Avg': pt.rolling_4week_avg_minutes != null ? Number(Number(pt.rolling_4week_avg_minutes).toFixed(1)) : null,
    'Fastest': pt.fastest_build_minutes != null ? Number(Number(pt.fastest_build_minutes).toFixed(1)) : 0,
  }))

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Build duration trend</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Average build duration in minutes</p>
        </div>
      </div>

      {!isLoading && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
          <div className="p-3 rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">Current average</p>
            <p className="font-mono text-base font-semibold text-[var(--fm-text)] tabular-nums mt-0.5">
              {summary.avg_build_minutes != null ? `${Number(summary.avg_build_minutes).toFixed(1)}m` : '-'}
            </p>
          </div>
          <div className="p-3 rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">Fastest build</p>
            <p className="font-mono text-base font-semibold text-[var(--fm-text)] tabular-nums mt-0.5">
              {summary.fastest_build_minutes != null ? `${Number(summary.fastest_build_minutes).toFixed(1)}m` : '-'}
            </p>
          </div>
          <div className="p-3 rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)] col-span-2 sm:col-span-1">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">Slowest build</p>
            <p className="font-mono text-base font-semibold text-[var(--fm-text)] tabular-nums mt-0.5">
              {summary.slowest_build_minutes != null ? `${Number(summary.slowest_build_minutes).toFixed(1)}m` : '-'}
            </p>
          </div>
        </div>
      )}

      <div className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-56 w-full rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
          </div>
        ) : trend.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed border-[var(--fm-line)] rounded-[4px]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">No build duration data for this period</p>
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
                unit="m"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--fm-line)', strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="Avg Build"
                stroke="var(--fm-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--fm-accent)', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="4-Week Avg"
                stroke="var(--fm-text-muted)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Fastest"
                stroke="var(--fm-status-good)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
