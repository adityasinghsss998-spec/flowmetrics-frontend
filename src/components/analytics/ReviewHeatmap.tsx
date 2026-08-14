'use client'

import { HeatmapPoint } from '@/types/api'
import { cn } from '@/lib/utils'
import { Activity } from 'lucide-react'

interface Props {
  data: HeatmapPoint[]
  isLoading: boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getColor(count: number, max: number): string {
  if (count === 0 || max === 0) return 'bg-white/[0.03]'
  const ratio = count / max
  if (ratio < 0.2) return 'bg-indigo-500/10'
  if (ratio < 0.4) return 'bg-indigo-500/25'
  if (ratio < 0.6) return 'bg-indigo-500/45'
  if (ratio < 0.8) return 'bg-indigo-500/65'
  return 'bg-indigo-500/90'
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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Review Activity Heatmap</span>
          </div>
          {!isLoading && total > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/15 bg-indigo-500/8 px-2.5 py-1">
              <span className="text-[10px] text-muted-foreground/60">total</span>
              <span className="text-xs font-bold text-indigo-400 tabular-nums">{total}</span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/50 ml-9">Code reviews by day and hour of week</p>

        {peakPoint && !isLoading && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-1.5">
            <span className="text-[10px] text-amber-400/80 font-medium">Peak:</span>
            <span className="text-[10px] text-muted-foreground">
              {DAYS[peakPoint.day_of_week - 1]} at {peakPoint.hour_of_day.toString().padStart(2, '0')}:00
              · {peakPoint.review_count} reviews
              {peakPoint.avg_turnaround_hours != null && ` · avg ${Number(Number(peakPoint.avg_turnaround_hours).toFixed(1))}h turnaround`}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="h-52 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="flex">
                <div className="w-8 shrink-0" />
                <div className="flex flex-1">
                  {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
                    <div key={h} className="flex-1 text-[9px] text-muted-foreground/40 text-center">
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
                      <div className="w-8 shrink-0 text-[10px] text-muted-foreground/50 text-right pr-1">{day}</div>
                      <div className="flex flex-1 gap-0.5">
                        {HOURS.map((hour) => {
                          const pt = matrix[`${dow}_${hour}`]
                          const count = pt?.review_count ?? 0
                          const turnaround = pt?.avg_turnaround_hours
                          return (
                            <div
                              key={hour}
                              title={
                                count > 0
                                  ? `${day} ${hour.toString().padStart(2, '0')}:00 — ${count} reviews${turnaround != null ? `, avg ${Number(Number(turnaround).toFixed(1))}h` : ''}`
                                  : `${day} ${hour.toString().padStart(2, '0')}:00 — no reviews`
                              }
                              className={cn(
                                'flex-1 h-5 rounded-[3px] transition-all cursor-default border border-white/[0.02]',
                                getColor(count, max)
                              )}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-3 flex items-center gap-2 justify-end">
                <span className="text-[9px] text-muted-foreground/40">Less</span>
                {['bg-white/[0.03]', 'bg-indigo-500/10', 'bg-indigo-500/25', 'bg-indigo-500/45', 'bg-indigo-500/65', 'bg-indigo-500/90'].map((c) => (
                  <div key={c} className={cn('h-3 w-3 rounded-[2px] border border-white/[0.04]', c)} />
                ))}
                <span className="text-[9px] text-muted-foreground/40">More</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
