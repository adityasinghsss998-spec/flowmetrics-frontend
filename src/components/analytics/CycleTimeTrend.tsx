'use client'

import { CycleTimeTrendPoint } from '@/types/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'

interface CycleTimeTrendProps {
  data: CycleTimeTrendPoint[]
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
              {item.value.toFixed(1)}h
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

export default function CycleTimeTrend({ data, isLoading }: CycleTimeTrendProps) {
  const chartData = data.map((pt) => ({
    week: pt.week_start,
    'Cycle Time': pt.avg_cycle_hours != null ? Number(Number(pt.avg_cycle_hours).toFixed(2)) : 0,
    'Lead Time': pt.avg_lead_time_hours != null ? Number(Number(pt.avg_lead_time_hours).toFixed(2)) : null,
    prs: pt.pr_count || 0,
  }))

  const avg = chartData.length
    ? chartData.reduce((s, d) => s + d['Cycle Time'], 0) / chartData.length
    : 0

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Cycle time trend</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Weekly average cycle & lead time</p>
        </div>
        {!isLoading && chartData.length > 0 && (
          <div className="flex items-center gap-1.5 border border-[var(--fm-line)] bg-[var(--fm-surface)] px-2.5 py-1 rounded-[4px]">
            <span className="font-mono text-xs text-[var(--fm-text-muted)]">Avg</span>
            <span className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">{avg.toFixed(1)}h</span>
          </div>
        )}
      </div>

      <div className="pt-3">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-56 w-full rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed border-[var(--fm-line)] rounded-[4px]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">No trend data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
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
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--fm-line)', strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="var(--fm-text-muted)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
              )}
              <Line
                type="monotone"
                dataKey="Cycle Time"
                stroke="var(--fm-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--fm-accent)', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Lead Time"
                stroke="var(--fm-text-muted)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--fm-text-muted)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
