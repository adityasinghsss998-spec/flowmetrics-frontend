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
import { GitPullRequest } from 'lucide-react'
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
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs min-w-36">
      <p className="font-semibold text-foreground mb-2.5 pb-2 border-b border-white/[0.06]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </span>
            <span className="font-semibold text-foreground tabular-nums">
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
    <div className="flex items-center justify-center gap-5 pt-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-muted-foreground/70">{entry.value}</span>
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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="absolute -top-12 left-1/4 h-32 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
              <GitPullRequest className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Cycle Time Trend</span>
          </div>
          {!isLoading && chartData.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/15 bg-indigo-500/8 px-2.5 py-1">
              <span className="text-[10px] text-muted-foreground/60">avg</span>
              <span className="text-xs font-bold text-indigo-400 tabular-nums">{avg.toFixed(1)}h</span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/50 ml-9">Weekly avg cycle & lead time</p>
      </div>

      <div className={cn('px-2 pb-4', isLoading && 'px-5 pb-5')}>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-56 w-full rounded-xl bg-white/[0.03] animate-pulse" />
            <div className="flex justify-center gap-6">
              <div className="h-3 w-20 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.05] mx-3 mb-3">
            <GitPullRequest className="h-7 w-7 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">No trend data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
              )}
              <Line
                type="monotone"
                dataKey="Cycle Time"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: 'rgba(99,102,241,0.3)', strokeOpacity: 1 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Lead Time"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 2, stroke: 'rgba(167,139,250,0.3)', strokeOpacity: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
