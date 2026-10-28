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

interface PrSizeChartProps {
  data: PrSizeBucket[]
  isLoading: boolean
}

const SIZE_CONFIG: Record<string, { color: string; label: string }> = {
  small:  { color: 'var(--fm-status-good)',    label: 'Small (<50 lines)' },
  medium: { color: 'var(--fm-text-muted)',     label: 'Medium (50-199)' },
  large:  { color: 'var(--fm-status-caution)', label: 'Large (200-499)' },
  xlarge: { color: 'var(--fm-status-poor)',    label: 'XLarge (500+)' },
}

interface TooltipPayloadItem {
  payload: PrSizeBucket & { color: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const cfg = SIZE_CONFIG[item.size_bucket]
  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)] p-3 text-xs min-w-40">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[var(--fm-line)]">
        <div className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: cfg?.color }} />
        <p className="font-mono font-medium text-[var(--fm-text)]">{cfg?.label ?? item.size_bucket}</p>
      </div>
      <div className="space-y-1">
        {[
          { label: 'PR count', val: `${item.pr_count} PRs` },
          { label: 'Avg cycle', val: item.avg_cycle_hours != null ? `${Number(item.avg_cycle_hours).toFixed(1)}h` : '-' },
          { label: 'Avg lead', val: item.avg_lead_time_hours != null ? `${Number(item.avg_lead_time_hours).toFixed(1)}h` : '-' },
          { label: 'Avg lines', val: `${item.avg_lines_changed ?? 0}` },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-[var(--fm-text-muted)]">{label}</span>
            <span className="font-mono font-medium text-[var(--fm-text)] tabular-nums">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PrSizeChart({ data, isLoading }: PrSizeChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    color: SIZE_CONFIG[d.size_bucket]?.color ?? 'var(--fm-text-muted)',
    'Avg Cycle (h)': d.avg_cycle_hours != null ? Number(Number(d.avg_cycle_hours).toFixed(2)) : 0,
  }))

  const total = data.reduce((s, d) => s + d.pr_count, 0)

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">PR size vs cycle time</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Average cycle time per pull request size</p>
        </div>
        {!isLoading && total > 0 && (
          <div className="flex items-center gap-1.5 border border-[var(--fm-line)] bg-[var(--fm-surface)] px-2.5 py-1 rounded-[4px]">
            <span className="font-mono text-xs text-[var(--fm-text-muted)]">Total</span>
            <span className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">{total} PRs</span>
          </div>
        )}
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center gap-4 py-2 flex-wrap">
          {data.map((d) => {
            const cfg = SIZE_CONFIG[d.size_bucket]
            return (
              <div key={d.size_bucket} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: cfg?.color }} />
                <span className="font-mono text-[11px] text-[var(--fm-text-muted)]">
                  {d.size_bucket.charAt(0).toUpperCase() + d.size_bucket.slice(1)}:
                  <span className="ml-1 font-mono text-[var(--fm-text)] tabular-nums">{d.pr_count}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-52 w-full rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed border-[var(--fm-line)] rounded-[4px]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">No PR size data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="2 2" stroke="var(--fm-line)" vertical={false} />
              <XAxis
                dataKey="size_bucket"
                tick={{ fontSize: 10, fill: '#A0A498', fontFamily: 'var(--font-ibm-plex-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#A0A498', fontFamily: 'var(--font-ibm-plex-mono)' }}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--fm-surface)' }} />
              <Bar dataKey="Avg Cycle (h)" radius={[2, 2, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
