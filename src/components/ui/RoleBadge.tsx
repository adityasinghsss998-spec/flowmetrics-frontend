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
    owner: 'border-purple-500/30 bg-purple-500/10 text-purple-400 font-semibold shadow-xs shadow-purple-500/10',
    admin: 'border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold shadow-xs shadow-blue-500/10',
    member: 'border-slate-500/30 bg-slate-500/10 text-slate-400 font-medium',
  }

  const selectedStyle = roleStyles[normalizedRole] || roleStyles.member

  return (
    <Badge
      variant="outline"
      className={cn('capitalize tracking-wide text-[11px] px-2 py-0.5 border', selectedStyle, className)}
      {...props}
    >
      {normalizedRole}
    </Badge>
  )
}
