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
import { Timer, Zap, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs min-w-40">
      <p className="font-semibold text-foreground mb-2 pb-2 border-b border-white/[0.06]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </span>
            <span className="font-semibold text-foreground tabular-nums">{item.value != null ? `${item.value}m` : '—'}</span>
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

function SummaryCard({ label, value, unit, icon: Icon, color }: { label: string; value: number | null; unit: string; icon: React.ElementType; color: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2.5', color)}>
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground/60 truncate">{label}</p>
        <p className="text-sm font-bold text-foreground tabular-nums">
          {value != null ? `${Number(Number(value).toFixed(1))}${unit}` : '—'}
        </p>
      </div>
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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="absolute -top-10 right-1/4 h-28 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
            <Timer className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Build Duration Trend</span>
        </div>
        <p className="text-[11px] text-muted-foreground/50 ml-9">Weekly average build times with rolling average</p>
      </div>

      {!isLoading && summary && (
        <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SummaryCard label="Avg Build" value={summary.avg_build_minutes} unit="m" icon={Timer} color="border-amber-500/15 bg-amber-500/5 text-amber-400" />
          <SummaryCard label="Fastest" value={summary.fastest_build_minutes} unit="m" icon={Zap} color="border-emerald-500/15 bg-emerald-500/5 text-emerald-400" />
          <SummaryCard label="Slowest" value={summary.slowest_build_minutes} unit="m" icon={TrendingUp} color="border-red-500/15 bg-red-500/5 text-red-400" />
          <SummaryCard label="Success Rate" value={summary.total_deployments > 0 ? (summary.successful / summary.total_deployments) * 100 : null} unit="%" icon={TrendingDown} color="border-indigo-500/15 bg-indigo-500/5 text-indigo-400" />
        </div>
      )}

      <div className="px-2 pb-4">
        {isLoading ? (
          <div className="space-y-3 px-3 pb-3">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
            <div className="h-52 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          </div>
        ) : trend.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.05] mx-3 mb-3">
            <Timer className="h-7 w-7 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">No build duration data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
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
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} unit="m" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              <Line type="monotone" dataKey="Avg Build" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f59e0b' }} connectNulls />
              <Line type="monotone" dataKey="4-Week Avg" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="Fastest" stroke="#10b981" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
