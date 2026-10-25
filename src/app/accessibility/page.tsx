// DRAFT — This document was generated from the real capabilities of the FlowMetrics platform.
// It must be reviewed by qualified legal counsel before FlowMetrics is opened to the public.
// Do not treat this as a binding legal document.

import Link from 'next/link'

export const metadata = {
  title: 'Accessibility | FlowMetrics',
  description: 'Accessibility statement for the FlowMetrics developer analytics platform.',
}

export default function AccessibilityPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--fm-bg)', color: 'var(--fm-text)' }}>
      <header
        style={{
          borderBottom: '1px solid var(--fm-line)',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: 'max(24px, calc((100vw - 1120px) / 2))',
          paddingRight: 'max(24px, calc((100vw - 1120px) / 2))',
        }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-sm font-semibold tracking-tight"
            style={{ color: 'var(--fm-text)' }}
          >
            flowmetrics
          </Link>
          <Link
            href="/login"
            className="font-mono text-xs"
            style={{ color: 'var(--fm-text-muted)' }}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main
        style={{
          paddingTop: '72px',
          paddingBottom: '120px',
          paddingLeft: 'max(24px, calc((100vw - 1120px) / 2))',
          paddingRight: 'max(24px, calc((100vw - 1120px) / 2))',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <p className="font-mono text-xs mb-4" style={{ color: 'var(--fm-text-muted)' }}>
            Accessibility
          </p>
          <h1
            className="font-mono font-bold mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.1 }}
          >
            Accessibility statement
          </h1>
          <p className="font-mono text-xs mb-16" style={{ color: 'var(--fm-text-muted)' }}>
            Last updated October 2026.
          </p>

          <div
            style={{ borderTop: '1px solid var(--fm-line)', paddingTop: '48px' }}
            className="space-y-10"
          >
            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                Our commitment
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                FlowMetrics aims to be usable by anyone, regardless of ability or the technology
                they use to access it. We target WCAG 2.1 level AA compliance. All interactive
                controls have visible focus states, text contrast meets 4.5 to 1 against its
                background, and animations respect the browser prefers-reduced-motion preference.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                Known issues
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                The recharts-based charts in the analytics dashboard do not yet have full
                screen-reader descriptions. We plan to add accessible data tables alongside each
                chart.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                Feedback
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                If you encounter a barrier, please open an issue on our GitHub repository or
                contact us directly.
              </p>
            </section>
          </div>

          <div
            className="flex flex-wrap gap-6 mt-16"
            style={{ borderTop: '1px solid var(--fm-line)', paddingTop: '32px' }}
          >
            <Link
              href="/terms"
              className="font-mono text-xs underline underline-offset-4"
              style={{ color: 'var(--fm-text-muted)' }}
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="font-mono text-xs underline underline-offset-4"
              style={{ color: 'var(--fm-text-muted)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="font-mono text-xs underline underline-offset-4"
              style={{ color: 'var(--fm-text-muted)' }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
