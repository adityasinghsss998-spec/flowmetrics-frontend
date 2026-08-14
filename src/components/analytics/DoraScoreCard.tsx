'use client'

import { DoraLevel } from '@/types/api'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DORA_COLORS = {
  elite:   { bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981', glow: 'hover:shadow-xl hover:shadow-emerald-500/20', border: 'border-emerald-500/20', strip: 'from-emerald-500 to-emerald-400', ambient: 'from-emerald-500/10 via-transparent to-transparent' },
  high:    { bg: 'bg-blue-500',    text: 'text-blue-400',    hex: '#3b82f6', glow: 'hover:shadow-xl hover:shadow-blue-500/20',    border: 'border-blue-500/20',    strip: 'from-blue-500 to-blue-400',    ambient: 'from-blue-500/10 via-transparent to-transparent' },
  medium:  { bg: 'bg-amber-500',   text: 'text-amber-400',   hex: '#f59e0b', glow: 'hover:shadow-xl hover:shadow-amber-500/20',   border: 'border-amber-500/20',   strip: 'from-amber-500 to-amber-400',   ambient: 'from-amber-500/10 via-transparent to-transparent' },
  low:     { bg: 'bg-red-500',     text: 'text-red-400',     hex: '#ef4444', glow: 'hover:shadow-xl hover:shadow-red-500/20',     border: 'border-red-500/20',     strip: 'from-red-500 to-red-400',     ambient: 'from-red-500/10 via-transparent to-transparent' },
  unknown: { bg: 'bg-slate-400',   text: 'text-slate-400',   hex: '#94a3b8', glow: 'hover:shadow-xl hover:shadow-slate-500/10',   border: 'border-slate-500/10',   strip: 'from-slate-500 to-slate-400',   ambient: 'from-slate-500/5 via-transparent to-transparent' },
} as const

interface DoraScoreCardProps {
  title: string
  value: string | null
  subtitle: string | null
  level: DoraLevel | null
  trend: number | null
  isLoading: boolean
  isError?: boolean
}

export default function DoraScoreCard({ title, value, subtitle, level, trend, isLoading, isError }: DoraScoreCardProps) {
  const colors = level ? DORA_COLORS[level] : DORA_COLORS.unknown

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        <div className="relative space-y-4">
          <div className="h-3 w-28 rounded-full bg-white/10 animate-pulse" />
          <div className="h-9 w-20 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-3 w-36 rounded-full bg-white/8 animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-white/8 animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-5">
        <div className="relative space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            {title}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-400">Error</span>
          </div>
          <p className="text-xs text-muted-foreground/60">Failed to load metric</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-5',
      'bg-white/[0.03] hover:bg-white/[0.05]',
      'transition-all duration-300 hover:-translate-y-1',
      colors.border,
      !isLoading && level && colors.glow
    )}>
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        colors.ambient
      )} />

      <div className={cn(
        'absolute inset-x-0 top-0 h-px bg-gradient-to-r via-transparent to-transparent',
        colors.strip
      )} />

      <div className="absolute -top-12 -right-8 h-32 w-32 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: colors.hex }}
      />

      <div className="relative z-10 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          {title}
        </p>

        <div className="flex items-end gap-2.5">
          <span className={cn('text-[2rem] font-bold tabular-nums leading-none tracking-tight', colors.text)}>
            {value ?? '—'}
          </span>
          {trend != null && (
            <span className={cn(
              'flex items-center gap-0.5 mb-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
              trend > 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : trend < 0
                ? 'bg-red-500/10 text-red-400'
                : 'bg-muted/20 text-muted-foreground'
            )}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground/60 leading-relaxed">{subtitle}</p>
        )}

        {level && (
          <div className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
            colors.border
          )} style={{ backgroundColor: `${colors.hex}15` }}>
            <div className={cn('h-1.5 w-1.5 rounded-full animate-pulse', colors.bg)} />
            <span className={cn('text-[10px] font-bold uppercase tracking-widest', colors.text)}>
              {level}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
