// DRAFT — This document was generated from the real capabilities of the FlowMetrics platform.
// It must be reviewed by qualified legal counsel before FlowMetrics is opened to the public.
// Do not treat this as a binding legal document.

import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | FlowMetrics',
  description: 'Terms of Service for the FlowMetrics developer analytics platform.',
}

export default function TermsPage() {
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
            className="font-mono text-sm font-semibold tracking-tight text-[var(--fm-text)] hover:text-[var(--fm-accent)] transition-colors"
          >
            flowmetrics
          </Link>
          <Link
            href="/login"
            className="font-mono text-xs text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] transition-colors"
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
            Legal
          </p>
          <h1
            className="font-mono font-bold mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.1 }}
          >
            Terms of Service
          </h1>
          <p className="font-mono text-xs mb-16" style={{ color: 'var(--fm-text-muted)' }}>
            Last updated October 2026. Draft document, not yet in effect.
          </p>

          <div
            style={{ borderTop: '1px solid var(--fm-line)', paddingTop: '48px' }}
            className="space-y-12"
          >
            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                1. What FlowMetrics does
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                FlowMetrics is an engineering analytics platform. It connects to your GitHub
                repositories and computes four DORA metrics: deployment frequency, lead time for
                changes, change failure rate and time to restore service. It also tracks cycle time,
                open pull requests and contributor activity. The service is free to use.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                2. Authentication and access
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                You can authenticate with GitHub OAuth or with an email address and password.
                When you connect a GitHub repository, FlowMetrics requests read-only access to
                sync pull request data, commit history, review comments and deployment records
                via the GitHub API. FlowMetrics never requests write permissions to your source
                code and never modifies your repositories.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                3. Data we collect and store
              </h2>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                To compute team analytics we store:
              </p>
              <ul
                className="text-base leading-relaxed space-y-2"
                style={{
                  color: 'var(--fm-text-muted)',
                  fontFamily: 'var(--font-ibm-plex-sans)',
                  paddingLeft: '1.5rem',
                }}
              >
                <li>Repository metadata: name, owner, default branch.</li>
                <li>Pull request titles, authors, creation and merge timestamps.</li>
                <li>Commit timestamps (not commit contents or file contents).</li>
                <li>Review turnaround times and reviewer usernames.</li>
                <li>Deployment records: status, environment, build duration, timestamps.</li>
              </ul>
              <p
                className="text-base leading-relaxed mt-4"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                Source code files are never indexed or stored on our servers.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                4. Automated communications
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                By connecting repositories to an organization, the administrator agrees to receive
                alert emails when metric anomalies are detected (for example: a deployment failure
                spike, a cycle time increase above threshold, or stale open pull requests) and an
                automated weekly digest summarizing delivery health. Notification recipients can be
                configured at any time in organization settings.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                5. Disconnecting repositories
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                You can disconnect any repository or delete your organization at any time from the
                dashboard. Disconnecting a repository stops future syncing. You can request that
                stored data for a disconnected repository be deleted by contacting us.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                6. Service availability
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                FlowMetrics is provided free of charge on an "as is" and "as available" basis
                without warranties of any kind. We aim for high availability but do not guarantee
                uninterrupted service.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                7. Changes to these terms
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                We may update these terms when the platform changes. We will update the date at
                the top of this page and, for material changes, notify organization administrators
                by email.
              </p>
            </section>
          </div>

          <div
            className="flex flex-wrap gap-6 mt-16"
            style={{ borderTop: '1px solid var(--fm-line)', paddingTop: '32px' }}
          >
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
