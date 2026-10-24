'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Organization, Repository } from '@/types/api'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  label: string
  href: string
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
          { label: 'Dashboard', href: '/dashboard', exact: true },
          { label: 'Settings', href: '/settings' },
        ],
      },
    ]

    if (repoId) {
      sections.push({
        title: 'Analytics',
        items: [
          { label: 'DORA overview', href: `/repos/${repoId}`, exact: true },
          { label: 'Contributors', href: `/repos/${repoId}/contributors` },
          { label: 'Deployments', href: `/repos/${repoId}/deployments` },
          { label: 'Pull requests', href: `/repos/${repoId}/prs` },
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
    <div className="flex h-full flex-col" style={{ background: 'var(--fm-surface)' }}>
      {/* Wordmark */}
      <div
        className="flex h-14 items-center px-4"
        style={{ borderBottom: '1px solid var(--fm-line)' }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-0 min-w-0"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--fm-text)',
            letterSpacing: '-0.01em',
          }}
        >
          {!collapsed && <span>flowmetrics</span>}
          {collapsed && <span>fm</span>}
        </Link>

        <button
          id="sidebar-collapse-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto hidden h-6 w-6 shrink-0 items-center justify-center transition-colors lg:flex"
          style={{ color: 'var(--fm-text-muted)', borderRadius: 4 }}
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
            className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center transition-colors lg:hidden"
            style={{ color: 'var(--fm-text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Org name */}
      {!collapsed && activeOrg && (
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid var(--fm-line)' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--fm-text)',
              marginBottom: 2,
            }}
          >
            {activeOrg.name}
          </p>
          {activeOrg.slug && (
            <p style={{ fontSize: 11, color: 'var(--fm-text-muted)', opacity: 0.6 }}>
              {activeOrg.slug}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Main navigation">
        {navSections.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className={cn('mb-4', sectionIdx > 0 && 'pt-3')}
            style={sectionIdx > 0 ? { borderTop: '1px solid var(--fm-line)' } : undefined}
          >
            {section.title && !collapsed && (
              <p
                className="mb-1 px-2"
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--fm-text-muted)',
                }}
              >
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center rounded px-2 py-2 text-sm transition-colors',
                        collapsed ? 'justify-center' : '',
                      )}
                      style={{
                        fontFamily: 'var(--font-ibm-plex-mono)',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--fm-text)' : 'var(--fm-text-muted)',
                        background: active ? 'var(--fm-surface-raised)' : 'transparent',
                        borderRadius: 4,
                        fontSize: 13,
                      }}
                    >
                      <span className={cn(collapsed ? 'sr-only' : 'truncate')}>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {!collapsed && recentRepos.length > 0 && (
          <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--fm-line)' }}>
            <p
              className="mb-1 px-2"
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--fm-text-muted)',
              }}
            >
              Recent
            </p>
            <ul className="space-y-0.5">
              {recentRepos.map((repo) => (
                <li key={repo.id}>
                  <Link
                    href={`/repos/${repo.id}`}
                    className="flex items-center rounded px-2 py-1.5 text-xs transition-colors"
                    style={{
                      fontFamily: 'var(--font-ibm-plex-mono)',
                      color: pathname === `/repos/${repo.id}` ? 'var(--fm-text)' : 'var(--fm-text-muted)',
                      background: pathname === `/repos/${repo.id}` ? 'var(--fm-surface-raised)' : 'transparent',
                      borderRadius: 4,
                    }}
                  >
                    <span className="truncate">{repo.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* User menu */}
      <div className="p-2" style={{ borderTop: '1px solid var(--fm-line)' }}>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors',
              collapsed ? 'justify-center' : '',
            )}
            style={{ borderRadius: 4, outline: 'none' }}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded"
              style={{
                background: 'var(--fm-surface-raised)',
                border: '1px solid var(--fm-line)',
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--fm-text)',
                borderRadius: 4,
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-medium"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--fm-text)', fontSize: 12 }}
                >
                  {user?.name ?? 'User'}
                </p>
                <p className="truncate text-xs" style={{ color: 'var(--fm-text-muted)', fontSize: 11 }}>
                  {user?.email ?? ''}
                </p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            style={{
              background: 'var(--fm-surface-raised)',
              border: '1px solid var(--fm-line)',
              borderRadius: 4,
            }}
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium" style={{ color: 'var(--fm-text)' }}>
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs" style={{ color: 'var(--fm-text-muted)' }}>
                {user?.email ?? ''}
              </p>
            </div>
            <DropdownMenuSeparator style={{ background: 'var(--fm-line)' }} />
            <DropdownMenuItem
              onClick={() => router.push('/settings')}
              className="cursor-pointer text-sm"
              style={{ color: 'var(--fm-text)' }}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: 'var(--fm-line)' }} />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-sm"
              style={{ color: 'var(--fm-status-poor)' }}
            >
              Log out
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
          'hidden lg:flex flex-col shrink-0 transition-all duration-200',
          collapsed ? 'w-[56px]' : 'w-[220px]',
        )}
        style={{ borderRight: '1px solid var(--fm-line)', background: 'var(--fm-surface)' }}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(11,12,10,0.7)' }}
          aria-hidden="true"
          onClick={onMobileClose}
        />
      )}

      <aside
        id="mobile-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col lg:hidden transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ borderRight: '1px solid var(--fm-line)', background: 'var(--fm-surface)' }}
        aria-label="Mobile sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  )
}
