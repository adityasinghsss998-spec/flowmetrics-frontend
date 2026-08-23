'use client'

import { PrSizeBucket } from '@/types/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Layers } from 'lucide-react'

interface PrSizeChartProps {
  data: PrSizeBucket[]
  isLoading: boolean
}

const SIZE_CONFIG: Record<string, { color: string; label: string; lightColor: string }> = {
  small:  { color: '#10b981', lightColor: 'rgba(16,185,129,0.15)', label: 'Small · <50 lines' },
  medium: { color: '#6366f1', lightColor: 'rgba(99,102,241,0.15)', label: 'Medium · 50–199' },
  large:  { color: '#f59e0b', lightColor: 'rgba(245,158,11,0.15)', label: 'Large · 200–499' },
  xlarge: { color: '#ef4444', lightColor: 'rgba(239,68,68,0.15)',   label: 'XLarge · 500+' },
}

interface TooltipPayloadItem {
  payload: PrSizeBucket & { color: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const cfg = SIZE_CONFIG[item.size_bucket]
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs min-w-40">
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/[0.06]">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg?.color }} />
        <p className="font-semibold text-foreground">{cfg?.label ?? item.size_bucket}</p>
      </div>
      <div className="space-y-1.5">
        {[
          { label: 'PR count', val: `${item.pr_count} PRs` },
          { label: 'Avg cycle', val: item.avg_cycle_hours != null ? `${Number(item.avg_cycle_hours).toFixed(1)}h` : '—' },
          { label: 'Avg lead', val: item.avg_lead_time_hours != null ? `${Number(item.avg_lead_time_hours).toFixed(1)}h` : '—' },
          { label: 'Avg lines', val: `${item.avg_lines_changed ?? 0}` },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between gap-5">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground tabular-nums">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PrSizeChart({ data, isLoading }: PrSizeChartProps) {
  const chartData = data.map((d) => ({
  ...d,
  color: SIZE_CONFIG[d.size_bucket]?.color ?? '#94a3b8',
  'Avg Cycle (h)': d.avg_cycle_hours != null ? Number(Number(d.avg_cycle_hours).toFixed(2)) : 0,
}))

  const total = data.reduce((s, d) => s + d.pr_count, 0)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      <div className="absolute -top-12 right-1/4 h-32 w-48 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
              <Layers className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">PR Size vs Cycle Time</span>
          </div>
          {!isLoading && total > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/15 bg-violet-500/8 px-2.5 py-1">
              <span className="text-[10px] text-muted-foreground/60">total</span>
              <span className="text-xs font-bold text-violet-400 tabular-nums">{total} PRs</span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/50 ml-9">Avg cycle time per size bucket</p>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center gap-3 px-5 pb-3 flex-wrap">
          {data.map((d) => {
            const cfg = SIZE_CONFIG[d.size_bucket]
            return (
              <div key={d.size_bucket} className="flex items-center gap-1.5">
                <div className="h-1.5 w-3 rounded-full" style={{ backgroundColor: cfg?.color }} />
                <span className="text-[10px] text-muted-foreground/50">
                  {d.size_bucket.charAt(0).toUpperCase() + d.size_bucket.slice(1)}
                  <span className="ml-1 font-semibold" style={{ color: cfg?.color }}>{d.pr_count}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="px-2 pb-4">
        {isLoading ? (
          <div className="px-3 pb-1 space-y-3">
            <div className="h-52 w-full rounded-xl bg-white/[0.03] animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.05] mx-3 mb-3">
            <Layers className="h-7 w-7 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">No PR size data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="size_bucket"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="Avg Cycle (h)" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
