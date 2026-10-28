'use client'

import { HeatmapPoint } from '@/types/api'

interface Props {
  data: HeatmapPoint[]
  isLoading: boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getCellColor(count: number, max: number): string {
  if (count === 0 || max === 0) return 'var(--fm-surface)'
  const ratio = count / max
  if (ratio < 0.2) return 'color-mix(in srgb, var(--fm-accent) 20%, var(--fm-surface))'
  if (ratio < 0.4) return 'color-mix(in srgb, var(--fm-accent) 40%, var(--fm-surface))'
  if (ratio < 0.6) return 'color-mix(in srgb, var(--fm-accent) 65%, var(--fm-surface))'
  if (ratio < 0.8) return 'color-mix(in srgb, var(--fm-accent) 85%, var(--fm-surface))'
  return 'var(--fm-accent)'
}

export default function ReviewHeatmap({ data, isLoading }: Props) {
  const matrix: Record<string, HeatmapPoint> = {}
  data.forEach((pt) => {
    matrix[`${pt.day_of_week}_${pt.hour_of_day}`] = pt
  })

  const max = data.reduce((m, pt) => Math.max(m, pt.review_count), 0)
  const total = data.reduce((s, pt) => s + pt.review_count, 0)

  const peakPoint = data.reduce<HeatmapPoint | null>((best, pt) => {
    if (!best || pt.review_count > best.review_count) return pt
    return best
  }, null)

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[var(--fm-line)]/50">
        <div>
          <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Review activity heatmap</h3>
          <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">Code reviews by day and hour</p>
        </div>
        {!isLoading && total > 0 && (
          <div className="flex items-center gap-1.5 border border-[var(--fm-line)] bg-[var(--fm-surface)] px-2.5 py-1 rounded-[4px]">
            <span className="font-mono text-xs text-[var(--fm-text-muted)]">Total</span>
            <span className="font-mono text-xs font-medium text-[var(--fm-text)] tabular-nums">{total}</span>
          </div>
        )}
      </div>

      {peakPoint && !isLoading && (
        <div className="my-3 flex items-center gap-2 p-2.5 rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)]">
          <span className="font-mono text-xs text-[var(--fm-accent)] font-medium">Peak:</span>
          <span className="font-mono text-xs text-[var(--fm-text-muted)]">
            {DAYS[peakPoint.day_of_week - 1]} at {peakPoint.hour_of_day.toString().padStart(2, '0')}:00
            · {peakPoint.review_count} reviews
            {peakPoint.avg_turnaround_hours != null && ` · avg ${Number(Number(peakPoint.avg_turnaround_hours).toFixed(1))}h`}
          </span>
        </div>
      )}

      <div className="pt-2">
        {isLoading ? (
          <div className="h-52 w-full rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="flex">
                <div className="w-8 shrink-0" />
                <div className="flex flex-1">
                  {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
                    <div key={h} className="flex-1 font-mono text-[9px] text-[var(--fm-text-muted)] text-center">
                      {h.toString().padStart(2, '0')}h
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-1 space-y-1">
                {DAYS.map((day, dayIdx) => {
                  const dow = dayIdx + 1
                  return (
                    <div key={day} className="flex items-center gap-1">
                      <div className="w-8 shrink-0 font-mono text-[10px] text-[var(--fm-text-muted)] text-right pr-1">{day}</div>
                      <div className="flex flex-1 gap-0.5">
                        {HOURS.map((hour) => {
                          const pt = matrix[`${dow}_${hour}`]
                          const count = pt?.review_count ?? 0
                          const turnaround = pt?.avg_turnaround_hours
                          const color = getCellColor(count, max)

                          return (
                            <div
                              key={hour}
                              title={`${day} ${hour}:00, ${count} reviews${turnaround ? ` (${Number(turnaround).toFixed(1)}h avg)` : ''}`}
                              style={{ backgroundColor: color }}
                              className="h-4 flex-1 rounded-[1px] transition-opacity hover:opacity-80 cursor-default border border-[var(--fm-line)]/30"
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[var(--fm-text-muted)] font-mono">
                <span className="text-[11px]">Less</span>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-4 rounded-[1px] bg-[var(--fm-surface)] border border-[var(--fm-line)]" />
                  <div className="h-2.5 w-4 rounded-[1px]" style={{ backgroundColor: getCellColor(1, 5) }} />
                  <div className="h-2.5 w-4 rounded-[1px]" style={{ backgroundColor: getCellColor(2, 5) }} />
                  <div className="h-2.5 w-4 rounded-[1px]" style={{ backgroundColor: getCellColor(3, 5) }} />
                  <div className="h-2.5 w-4 rounded-[1px]" style={{ backgroundColor: getCellColor(4, 5) }} />
                  <div className="h-2.5 w-4 rounded-[1px]" style={{ backgroundColor: getCellColor(5, 5) }} />
                </div>
                <span className="text-[11px]">More</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
