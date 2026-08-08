'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  LayoutDashboard,
  GitBranch,
  Users,
  Rocket,
  GitPullRequest,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface SidebarProps {
  /** Controlled open state for mobile overlay */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  exact?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'DORA Overview', href: '/dashboard', icon: BarChart3 },
      { label: 'Contributors', href: '#', icon: Users },
      { label: 'Deployments', href: '#', icon: Rocket },
      { label: 'Pull Requests', href: '#', icon: GitPullRequest },
    ],
  },
  {
    title: 'Repositories',
    items: [
      { label: 'All Repositories', href: '#', icon: GitBranch },
    ],
  },
]

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen) onMobileClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href) && item.href !== '#'
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
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

        {/* Collapse toggle (desktop only) */}
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

        {/* Mobile close button */}
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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={cn('mb-4', sectionIdx > 0 && 'border-t border-border/30 pt-4')}>
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
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border/50 p-2">
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2',
            collapsed ? 'justify-center px-2' : ''
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{user?.name ?? 'User'}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? ''}</p>
            </div>
          )}
          {!collapsed && (
            <button
              id="logout-button"
              aria-label="Logout"
              onClick={logout}
              title="Logout"
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        id="desktop-sidebar"
        className={cn(
          'hidden lg:flex flex-col border-r border-border/50 bg-background/95 backdrop-blur transition-all duration-300 shrink-0',
          collapsed ? 'w-[56px]' : 'w-[220px]'
        )}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-border/50 bg-background transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  )
}
