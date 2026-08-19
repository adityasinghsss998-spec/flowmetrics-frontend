'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  LayoutDashboard,
  Users,
  Rocket,
  GitPullRequest,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Building2,
  GitBranch,
  Clock,
  Zap,
  Settings,
  UserCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import RealtimeBadge from '@/components/layout/RealtimeBadge'
import api from '@/lib/axios'
import type { Organization, Repository } from '@/types/api'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface OrgWithMembers extends Organization {
  members?: { id: number; name: string; OrgMember: { role: string } }[]
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const params = useParams()
  const repoId = params?.repoId
  const { user, logout } = useAuthStore()

  const orgsQuery = useQuery<OrgWithMembers[]>({
    queryKey: ['orgs'],
    queryFn: () =>
      api.get('/orgs').then((r) => r.data.data).catch(() => api.get('/organizations').then((r) => r.data.data)),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const activeOrg = orgsQuery.data?.[0] ?? null

  const reposQuery = useQuery<Repository[]>({
    queryKey: ['repos', activeOrg?.id ? String(activeOrg.id) : null],
    queryFn: () => api.get(`/repos/org/${activeOrg!.id}`).then((r) => r.data.data),
    enabled: !!activeOrg?.id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const recentRepos = useMemo(() => {
    return (reposQuery.data ?? []).slice(0, 3)
  }, [reposQuery.data])

  const navSections: NavSection[] = useMemo(() => {
    const sections: NavSection[] = [
      {
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
          { label: 'Settings', href: '/settings', icon: Settings },
        ],
      },
    ]

    if (repoId) {
      sections.push({
        title: 'Analytics',
        items: [
          { label: 'DORA Overview', href: `/repos/${repoId}`, icon: BarChart3, exact: true },
          { label: 'Contributors', href: `/repos/${repoId}/contributors`, icon: Users },
          { label: 'Deployments', href: `/repos/${repoId}/deployments`, icon: Rocket },
          { label: 'Pull Requests', href: `/repos/${repoId}/prs`, icon: GitPullRequest },
        ],
      })
    }

    return sections
  }, [repoId])

  useEffect(() => {
    if (mobileOpen) onMobileClose?.()
  }, [pathname])

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href) && item.href !== '#'
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight truncate">
              Flow<span className="text-indigo-400">Metrics</span>
            </span>
          )}
        </Link>

        <button
          id="sidebar-collapse-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {mobileOpen && (
          <button
            id="sidebar-mobile-close"
            aria-label="Close sidebar"
            onClick={onMobileClose}
            className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!collapsed && activeOrg && (
        <div className="border-b border-border/30 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{activeOrg.name}</p>
              <p className="truncate text-[10px] text-muted-foreground/60">{activeOrg.slug}</p>
            </div>
          </div>
          {activeOrg.members && activeOrg.members.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <Users className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                {activeOrg.members.length} {activeOrg.members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Main navigation">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={cn('mb-3', sectionIdx > 0 && 'border-t border-border/30 pt-3')}>
            {section.title && !collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                        collapsed ? 'justify-center px-2' : '',
                        active
                          ? 'bg-indigo-600/15 text-indigo-400 shadow-sm'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active ? 'text-indigo-400' : 'text-muted-foreground'
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {active && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {!collapsed && recentRepos.length > 0 && (
          <div className="border-t border-border/30 pt-3 mt-3">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Recent Repos
            </p>
            <ul className="space-y-0.5">
              {recentRepos.map((repo) => (
                <li key={repo.id}>
                  <Link
                    href={`/repos/${repo.id}`}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      pathname === `/repos/${repo.id}`
                        ? 'bg-indigo-600/10 text-indigo-400'
                        : 'text-muted-foreground/70 hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                    <span className="truncate">{repo.name}</span>
                    {repo.last_synced_at && (
                      <span className="ml-auto flex items-center gap-0.5 text-[9px] text-muted-foreground/40">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(repo.last_synced_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-border/50 p-2 space-y-2">
        {!collapsed && (
          <div className="px-2 mt-2">
            <div className="mb-3 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Zap className="h-4 w-4 text-red-400" />
              </div>
              <h4 className="text-xs font-semibold text-white mb-1">Webhook Events</h4>
              <p className="text-[10px] text-muted-foreground mb-3">Approaching monthly limit</p>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>
              <p className="text-[9px] font-medium text-red-400/80">85% quota reached</p>
            </div>
            <RealtimeBadge className="w-full justify-center" />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center px-1">
            <RealtimeBadge compact />
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent/50 transition-colors',
              collapsed ? 'justify-center px-2' : ''
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/20 border border-red-500/30">
              <span className="text-xs font-semibold text-red-400">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{user?.name ?? 'User'}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? ''}</p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur border-border/50">
            <div className="px-2 py-1.5 text-sm font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email ?? ''}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      <aside
        id="desktop-sidebar"
        className={cn(
          'hidden lg:flex flex-col border-r border-border/50 bg-background/95 backdrop-blur transition-all duration-300 shrink-0',
          collapsed ? 'w-[56px]' : 'w-[240px]'
        )}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        />
      )}

      <aside
        id="mobile-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-border/50 bg-background transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  )
}
