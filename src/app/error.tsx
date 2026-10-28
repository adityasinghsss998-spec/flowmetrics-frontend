'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--fm-bg)', color: 'var(--fm-text)' }}
    >
      <div className="w-full max-w-md text-left">
        <p className="font-mono text-xs mb-3" style={{ color: 'var(--fm-status-poor)' }}>
          Application error
        </p>
        <h1
          className="font-mono font-bold mb-4"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.1 }}
        >
          Something went wrong.
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
        >
          An unexpected error occurred while loading this view. You can retry or return to the dashboard.
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="fm-btn-accent px-4 py-2 text-sm"
          >
            <span>Try again</span>
          </button>
          <Link href="/dashboard" className="fm-inline-link font-mono text-xs">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
