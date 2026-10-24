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
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)] p-3 text-xs min-w-40">
      <p className="font-mono font-medium text-[var(--fm-text)] mb-2 pb-1.5 border-b border-[var(--fm-line)]">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: item.color }} />
              <span className="text-[var(--fm-text-muted)]">{item.name}</span>
            </span>
            <span className="font-mono font-medium text-[var(--fm-text)] tabular-nums">{item.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-t border-[var(--fm-line)] pt-1.5 mt-1">
          <span className="text-[var(--fm-text-muted)]">Total</span>
          <span className="font-mono font-bold text-[var(--fm-text)] tabular-nums">{total}</span>
        </div>
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
          <span className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: entry.color }} />
          <span className="font-mono text-[11px] text-[var(--fm-text-muted)]">{entry.value}</span>
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
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Deployment frequency</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Weekly deploy volume & outcomes</p>
        </div>
        {!isLoading && totalDeps > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-[var(--fm-line)] bg-[var(--fm-surface)] px-2.5 py-1 rounded-[4px]">
              <span className="font-mono text-xs text-[var(--fm-text-muted)]">Total</span>
              <span className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">{totalDeps}</span>
            </div>
            {totalFailed > 0 && (
              <div className="flex items-center gap-1.5 border border-[var(--fm-status-poor)]/40 bg-[var(--fm-status-poor)]/10 px-2.5 py-1 rounded-[4px]">
                <span className="font-mono text-xs text-[var(--fm-status-poor)]">Failed</span>
                <span className="font-mono text-xs font-medium text-[var(--fm-status-poor)] tabular-nums">{totalFailed}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-56 w-full rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 border border-dashed border-[var(--fm-line)] rounded-[4px]">
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">No deployment data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barCategoryGap="30%">
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--fm-surface)' }} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="Successful" stackId="a" fill="var(--fm-status-good)" radius={[0, 0, 0, 0]} maxBarSize={48} />
              <Bar dataKey="Failed" stackId="a" fill="var(--fm-status-poor)" radius={[2, 2, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
