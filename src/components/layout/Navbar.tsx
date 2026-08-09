'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, BarChart3, Zap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  variant?: 'landing' | 'dashboard'
  onMenuClick?: () => void
}

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar({ variant = 'landing', onMenuClick }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const path = usePathname()

  const toggle = () => setOpen((p) => !p)

  if (variant === 'dashboard') {
    return (
      <header
        id="dashboard-navbar"
        className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6"
      >
        <div className="flex items-center gap-4">
          <button
            id="sidebar-mobile-toggle"
            aria-label="Toggle sidebar"
            onClick={onMenuClick}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:block">
              FlowMetrics
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            id="realtime-badge-slot"
            className="hidden sm:block"
            aria-label="Realtime status placeholder"
          />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/20">
            <span className="text-xs font-semibold text-indigo-400">U</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      id="landing-navbar"
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <nav className="flex h-16 w-full items-center justify-between px-6 lg:px-12 xl:px-24">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 transition-shadow group-hover:shadow-indigo-500/40">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Flow<span className="text-indigo-400">Metrics</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex lg:gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                path === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
          >
            Get Started
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          id="mobile-nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={toggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav-menu"
          className="absolute inset-x-0 top-full border-b border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 border-t border-border/40" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Get Started <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}