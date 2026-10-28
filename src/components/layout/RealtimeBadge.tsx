'use client'

/**
 * RealtimeBadge — the visual badge is intentionally not rendered (per DESIGN-BRIEF.md).
 * The realtime connection code (useRealtimeStore) is preserved and active.
 * If you need to surface connection state, use useRealtimeStore directly.
 */
import { useRealtimeStore } from '@/store/realtimeStore'

interface RealtimeBadgeProps {
  className?: string
  compact?: boolean
}

export default function RealtimeBadge({ className: _c, compact: _compact }: RealtimeBadgeProps) {
  // Keep the store subscription alive so the socket still tracks connection state.
  useRealtimeStore((s) => s.isConnected)
  return null
}
