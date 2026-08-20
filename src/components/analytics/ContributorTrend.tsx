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
import { TrendingUp } from 'lucide-react'

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
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs min-w-36">
      <p className="font-semibold text-foreground mb-2 pb-2 border-b border-white/[0.06]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </span>
            <span className="font-semibold text-foreground tabular-nums">
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

export default function ContributorTrend({ username, data, isLoading }: Props) {
  const chartData = data.map((pt) => ({
    week: pt.week_start,
    PRs: pt.prs_merged,
    'Cycle Time': pt.avg_cycle_hours != null ? Number(Number(pt.avg_cycle_hours).toFixed(1)) : 0,
    Commits: pt.total_commits,
    Lines: pt.lines_changed,
  }))

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Weekly Velocity</span>
            <span className="ml-2 text-xs text-muted-foreground/60">@{username}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/50 ml-9">PRs merged and cycle time per week</p>
      </div>

      <div className="px-2 pb-4">
        {isLoading ? (
          <div className="h-52 rounded-xl bg-white/[0.03] animate-pulse mx-3 mb-3" />
        ) : data.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.05] mx-3 mb-3">
            <TrendingUp className="h-7 w-7 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">No trend data for @{username}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
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
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              <Line type="monotone" dataKey="PRs" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls />
              <Line type="monotone" dataKey="Cycle Time" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 5 }} connectNulls />
              <Line type="monotone" dataKey="Commits" stroke="#a78bfa" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
