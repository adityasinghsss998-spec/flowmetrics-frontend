'use client'

import { RecentDeployment } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Rocket, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentDeploymentsProps {
  data: RecentDeployment[]
  isLoading: boolean
  isError?: boolean
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    label: 'Success',
    className: 'text-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  failure: {
    icon: XCircle,
    label: 'Failed',
    className: 'text-red-500',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'text-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  in_progress: {
    icon: Loader2,
    label: 'In Progress',
    className: 'text-blue-400 animate-spin',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
} as const

const ENV_COLORS: Record<string, string> = {
  production: 'text-violet-400',
  staging: 'text-indigo-400',
  development: 'text-slate-400',
}

export default function RecentDeployments({ data, isLoading, isError }: RecentDeploymentsProps) {
  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Rocket className="h-4 w-4 text-violet-400" />
          Recent Deployments
          {data.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {data.length} deployments
            </span>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Latest deployment activity</p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-8 w-8 text-red-400/50 mb-3" />
            <p className="text-sm font-medium text-red-400">Error loading deployments</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Please try again later.</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Rocket className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No deployments yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Deployment history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground font-medium px-4">Status</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium">Environment</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium">SHA</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium hidden sm:table-cell">Deployed by</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">Build</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium text-right pr-4">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((dep) => {
                  const cfg = STATUS_CONFIG[dep.status] ?? STATUS_CONFIG.pending
                  const Icon = cfg.icon
                  return (
                    <TableRow
                      key={dep.id}
                      className="border-border/20 hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <Icon className={cn('h-3.5 w-3.5', cfg.className)} />
                          <Badge
                            className={cn(
                              'h-4 text-[10px] px-1.5 border font-medium',
                              cfg.badgeClass
                            )}
                          >
                            {cfg.label}
                          </Badge>
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span
                          className={cn(
                            'text-xs font-medium capitalize',
                            ENV_COLORS[dep.environment.toLowerCase()] ?? 'text-muted-foreground'
                          )}
                        >
                          {dep.environment}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <code className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">
                          {dep.sha ? dep.sha.slice(0, 7) : '—'}
                        </code>
                      </TableCell>
                      <TableCell className="py-2.5 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {dep.deployed_by_username ? `@${dep.deployed_by_username}` : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {dep.build_duration_minutes != null
                            ? `${dep.build_duration_minutes.toFixed(1)}m`
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-4">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {dep.hours_ago < 1
                            ? `${Math.round(dep.hours_ago * 60)}m ago`
                            : dep.hours_ago < 24
                            ? `${dep.hours_ago.toFixed(0)}h ago`
                            : `${Math.floor(dep.hours_ago / 24)}d ago`}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
