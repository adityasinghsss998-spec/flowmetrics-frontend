'use client'

/**
 * FlowMetricsLogo.tsx
 *
 * The text-only wordmark. "flowmetrics" in IBM Plex Mono, always lowercase.
 * No icon, no gradient, no glow. Follows the design brief exactly.
 * The hover wipe is handled by the parent link via fm-wordmark-link class.
 */

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const textSizes = {
  sm:  'text-sm',
  md:  'text-base',
  lg:  'text-xl',
}

export default function FlowMetricsLogo({ size = 'md', className }: LogoProps) {
  return (
    <span
      className={cn(
        'font-mono font-semibold tracking-tight select-none',
        textSizes[size],
        className,
      )}
      style={{ color: 'var(--fm-text)' }}
    >
      flowmetrics
    </span>
  )
}
