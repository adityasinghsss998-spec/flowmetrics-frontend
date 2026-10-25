import Link from 'next/link'

export const metadata = {
  title: '404 Page Not Found | FlowMetrics',
  description: 'The requested page could not be found.',
}

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--fm-bg)', color: 'var(--fm-text)' }}
    >
      <div className="w-full max-w-md text-left">
        <p className="font-mono text-xs mb-3" style={{ color: 'var(--fm-text-muted)' }}>
          404 error
        </p>
        <h1
          className="font-mono font-bold mb-4"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.1 }}
        >
          Page not found.
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
        >
          The page you requested does not exist or may have been moved.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="fm-btn-accent px-4 py-2 text-sm">
            <span>Return to dashboard</span>
          </Link>
          <Link href="/" className="fm-inline-link font-mono text-xs">
            Home page
          </Link>
        </div>
      </div>
    </div>
  )
}
