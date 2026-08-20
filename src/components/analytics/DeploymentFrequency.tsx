'use client'

import { DeploymentFrequencyPoint } from '@/types/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Rocket } from 'lucide-react'

interface Props {
  data: DeploymentFrequencyPoint[]
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
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs min-w-40">
      <p className="font-semibold text-foreground mb-2 pb-2 border-b border-white/[0.06]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </span>
            <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-5 border-t border-white/[0.06] pt-1.5 mt-1">
          <span className="text-muted-foreground/60">Total</span>
          <span className="font-bold text-foreground tabular-nums">{total}</span>
        </div>
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
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-muted-foreground/70">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DeploymentFrequency({ data, isLoading }: Props) {
  const chartData = data.map((pt) => ({
    week: pt.week_start,
    Successful: pt.successful,
    Failed: pt.failed,
    rate: pt.failure_rate_percent != null ? Number(Number(pt.failure_rate_percent).toFixed(1)) : 0,
  }))

  const totalDeps = data.reduce((s, pt) => s + pt.total_deployments, 0)
  const totalFailed = data.reduce((s, pt) => s + pt.failed, 0)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      <div className="absolute -top-10 left-1/4 h-28 w-40 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
              <Rocket className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Deployment Frequency</span>
          </div>
          {!isLoading && totalDeps > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/15 bg-emerald-500/8 px-2.5 py-1">
                <span className="text-[10px] text-muted-foreground/60">total</span>
                <span className="text-xs font-bold text-emerald-400 tabular-nums">{totalDeps}</span>
              </div>
              {totalFailed > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/8 px-2.5 py-1">
                  <span className="text-[10px] text-muted-foreground/60">failed</span>
                  <span className="text-xs font-bold text-red-400 tabular-nums">{totalFailed}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/50 ml-9">Weekly deployments by status</p>
      </div>

      <div className="px-2 pb-4">
        {isLoading ? (
          <div className="space-y-3 px-3 pb-3">
            <div className="h-56 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.05] mx-3 mb-3">
            <Rocket className="h-7 w-7 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">No deployment data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barGap={2}>
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
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="Successful" stackId="deps" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Failed" stackId="deps" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
