'use client'

import { DoraLevel } from '@/types/api'

// Status colors from the design brief — for data only
const DORA_STATUS: Record<DoraLevel | 'unknown', { color: string; label: string }> = {
  elite:   { color: 'var(--fm-status-good)',    label: 'Elite' },
  high:    { color: 'var(--fm-status-good)',    label: 'High' },
  medium:  { color: 'var(--fm-status-caution)', label: 'Medium' },
  low:     { color: 'var(--fm-status-poor)',    label: 'Low' },
  unknown: { color: 'var(--fm-status-unknown)', label: 'Unknown' },
}

interface DoraScoreCardProps {
  title: string
  value: string | null
  subtitle: string | null
  level: DoraLevel | null
  trend: number | null
  isLoading: boolean
  hasData?: boolean
}

export default function DoraScoreCard({
  title,
  value,
  subtitle,
  level,
  trend,
  isLoading,
  hasData = true,
}: DoraScoreCardProps) {
  const status = level ? DORA_STATUS[level] : DORA_STATUS.unknown

  if (isLoading) {
    return (
      <div
        style={{
          padding: 20,
          border: '1px solid var(--fm-line)',
          borderRadius: 4,
          background: 'var(--fm-surface)',
        }}
      >
        <div className="space-y-3">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-8 w-20" />
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-5 w-14" />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 20,
        border: '1px solid var(--fm-line)',
        borderRadius: 4,
        background: 'var(--fm-surface)',
      }}
    >
      {/* Title */}
      <p
        style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--fm-text-muted)',
          marginBottom: 12,
        }}
      >
        {title}
      </p>

      {/* Value + trend */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--fm-text)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value ?? '-'}
        </span>
        {trend != null && hasData && (
          <span
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 11,
              fontWeight: 500,
              color: trend > 0 ? 'var(--fm-status-good)' : trend < 0 ? 'var(--fm-status-poor)' : 'var(--fm-text-muted)',
              marginBottom: 3,
            }}
          >
            {trend > 0 ? '+' : ''}{Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: 12,
            color: 'var(--fm-text-muted)',
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Level badge or No data */}
      {!hasData ? (
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--fm-text-muted)',
            border: '1px solid var(--fm-line)',
            borderRadius: 4,
            padding: '2px 7px',
            display: 'inline-block',
          }}
        >
          No data
        </span>
      ) : level ? (
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 10,
            fontWeight: 600,
            color: status.color,
            border: `1px solid color-mix(in srgb, ${status.color} 30%, transparent)`,
            borderRadius: 4,
            padding: '2px 7px',
            display: 'inline-block',
          }}
        >
          {status.label}
        </span>
      ) : null}
    </div>
  )
}
