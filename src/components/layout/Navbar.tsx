'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  variant?: 'landing' | 'dashboard'
  onMenuClick?: () => void
}

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Log in', href: '/login' },
]

export default function Navbar({ variant = 'landing', onMenuClick }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const toggle = () => setOpen((p) => !p)

  if (variant === 'dashboard') {
    return (
      <header
        id="dashboard-navbar"
        className="sticky top-0 z-40 flex h-14 w-full items-center justify-between px-4 lg:px-6"
        style={{
          borderBottom: '1px solid var(--fm-line)',
          background: 'var(--fm-bg)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            id="sidebar-mobile-toggle"
            aria-label="Toggle sidebar"
            onClick={onMenuClick}
            className="inline-flex h-8 w-8 items-center justify-center transition-colors lg:hidden"
            style={{ color: 'var(--fm-text-muted)', borderRadius: 4 }}
          >
            <Menu className="h-5 w-5" />
          </button>

          <span
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 13,
              color: 'var(--fm-text-muted)',
            }}
          >
            {path.startsWith('/settings/github')
              ? 'Settings / GitHub'
              : path.startsWith('/settings')
              ? 'Settings'
              : path.startsWith('/repos')
              ? (path.includes('/contributors')
                  ? 'Contributors'
                  : path.includes('/deployments')
                  ? 'Deployments'
                  : path.includes('/prs')
                  ? 'Pull requests'
                  : 'Repositories')
              : path.startsWith('/invite')
              ? 'Invite'
              : 'Dashboard'}
          </span>
        </div>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-8 w-8 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: 'var(--fm-surface-raised)',
              border: '1px solid var(--fm-line)',
              borderRadius: 4,
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--fm-text)',
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 mt-2"
            style={{
              background: 'var(--fm-surface-raised)',
              border: '1px solid var(--fm-line)',
              borderRadius: 4,
            }}
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium" style={{ color: 'var(--fm-text)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
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
      </header>
    )
  }

  // Landing page navbar (unchanged in scope for this task, but tokens updated)
  return (
    <header
      id="landing-navbar"
      className="sticky top-0 z-50 w-full"
      style={{ borderBottom: '1px solid var(--fm-line)', background: 'var(--fm-surface)' }}
    >
      <nav className="flex h-16 w-full items-center justify-between px-6 lg:px-12 xl:px-24">
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--fm-text)',
            letterSpacing: '-0.01em',
          }}
        >
          flowmetrics
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn('text-sm transition-colors', path === link.href ? '' : '')}
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 13,
                color: path === link.href ? 'var(--fm-text)' : 'var(--fm-text-muted)',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 13,
              color: 'var(--fm-text-muted)',
            }}
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="btn-accent"
          >
            Continue with GitHub
          </Link>
        </div>

        <button
          id="mobile-nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={toggle}
          className="inline-flex h-9 w-9 items-center justify-center transition-colors md:hidden"
          style={{ color: 'var(--fm-text-muted)', borderRadius: 4 }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav-menu"
          className="absolute inset-x-0 top-full md:hidden"
          style={{ borderBottom: '1px solid var(--fm-line)', background: 'var(--fm-surface)' }}
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm"
                style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--fm-text-muted)', fontSize: 13 }}
              >
                {link.label}
              </a>
            ))}
            <div className="my-2" style={{ borderTop: '1px solid var(--fm-line)' }} />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn-accent self-start"
            >
              Continue with GitHub
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}