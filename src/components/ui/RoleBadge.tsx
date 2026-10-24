'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type OrgRole = 'owner' | 'admin' | 'member' | string

interface RoleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: OrgRole
}

export function RoleBadge({ role, className, ...props }: RoleBadgeProps) {
  const normalizedRole = (role || 'member').toLowerCase()

  const roleStyles: Record<string, string> = {
    owner: 'border-[var(--fm-accent)] text-[var(--fm-accent)] bg-transparent font-medium',
    admin: 'border-[var(--fm-line)] text-[var(--fm-text)] bg-[var(--fm-surface)] font-medium',
    member: 'border-[var(--fm-line)] text-[var(--fm-text-muted)] bg-[var(--fm-surface)] font-normal',
  }

  const selectedStyle = roleStyles[normalizedRole] || roleStyles.member

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[11px] px-2 py-0.5 rounded-[4px] border',
        selectedStyle,
        className
      )}
      {...props}
    >
      {normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}
    </Badge>
  )
}
