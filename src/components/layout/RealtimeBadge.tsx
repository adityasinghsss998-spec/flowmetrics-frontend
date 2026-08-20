'use client'

import { useRealtimeStore } from '@/store/realtimeStore'
import { cn } from '@/lib/utils'

interface RealtimeBadgeProps {
  className?: string
  compact?: boolean
}

export default function RealtimeBadge({ className, compact = false }: RealtimeBadgeProps) {
  const isConnected = useRealtimeStore((s) => s.isConnected)
  const eventCount = useRealtimeStore((s) => s.events.length)

  return (
    <div
      id="realtime-badge"
      className={cn(
        'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-300',
        isConnected
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
          : 'border-red-500/20 bg-red-500/5 text-red-400',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            isConnected ? 'animate-ping bg-emerald-400' : 'bg-red-400'
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            isConnected ? 'bg-emerald-500' : 'bg-red-500'
          )}
        />
      </span>
      {!compact && (
        <span>{isConnected ? 'Live' : 'Offline'}</span>
      )}
      {!compact && isConnected && eventCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/15 px-1 text-[10px] font-semibold tabular-nums">
          {eventCount}
        </span>
      )}
    </div>
  )
}
