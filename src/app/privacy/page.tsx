// DRAFT — This document was generated from the real capabilities of the FlowMetrics platform.
// It must be reviewed by qualified legal counsel before FlowMetrics is opened to the public.
// Do not treat this as a binding legal document.

import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | FlowMetrics',
  description: 'Privacy Policy for the FlowMetrics developer analytics platform.',
}

export default function PrivacyPage() {
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
            Privacy Policy
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
                1. What this policy covers
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                This policy describes what data FlowMetrics collects when you use the service,
                how that data is used, and the choices you have. FlowMetrics is an engineering
                analytics tool that reads GitHub repository metadata and activity to compute
                DORA metrics and delivery insights for your team.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                2. Data we collect
              </h2>
              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                We collect two types of data:
              </p>

              <h3
                className="font-mono text-sm font-medium mb-3"
                style={{ color: 'var(--fm-text)' }}
              >
                Account data
              </h3>
              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                When you sign in with GitHub we receive your GitHub username, display name and
                primary email address. When you sign in with email and password, we store your
                email address and a hashed version of your password. We store your organization
                membership and role within FlowMetrics.
              </p>

              <h3
                className="font-mono text-sm font-medium mb-3"
                style={{ color: 'var(--fm-text)' }}
              >
                Repository activity data
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                When you connect a GitHub repository, FlowMetrics reads and stores: repository
                name and owner; pull request numbers, titles, author usernames, and open/merge
                timestamps; commit timestamps and author usernames; code review timestamps and
                reviewer usernames; deployment records including environment, status, and
                timestamps. Source code file contents are never read or stored.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                3. How we use this data
              </h2>
              <ul
                className="text-base leading-relaxed space-y-2"
                style={{
                  color: 'var(--fm-text-muted)',
                  fontFamily: 'var(--font-ibm-plex-sans)',
                  paddingLeft: '1.5rem',
                }}
              >
                <li>
                  Computing DORA metrics, cycle time, contributor leaderboards and open PR lists
                  for display in the dashboard.
                </li>
                <li>
                  Detecting metric anomalies and triggering alert emails to the organization
                  administrator.
                </li>
                <li>
                  Generating automated weekly digest emails summarizing delivery health.
                </li>
                <li>
                  Caching API responses in Redis to reduce GitHub API load (cached data is
                  short-lived and not persisted to disk).
                </li>
              </ul>
              <p
                className="text-base leading-relaxed mt-4"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                We do not sell your data. We do not use your data to train machine learning
                models. We do not share your data with third parties except as necessary to
                operate the service (for example, sending email through a transactional mail
                provider).
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                4. Data retention
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                Repository activity data is retained while the repository is connected to
                FlowMetrics. When you disconnect a repository you can request deletion of all
                stored activity data for that repository. Account data is retained until you
                delete your account.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                5. GitHub OAuth tokens
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                When you sign in with GitHub, we store an OAuth access token in an encrypted
                Redis cache (keyed to your user ID) to make API requests on your behalf. The
                token is used only to read data from the repositories you have connected.
                Revoking FlowMetrics access from your GitHub settings immediately invalidates
                the token.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                6. Your rights
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                You can disconnect repositories, leave organizations and request account deletion
                from the dashboard settings at any time. To request export or deletion of data
                outside the dashboard, contact us. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2
                className="font-mono text-base font-semibold mb-4"
                style={{ color: 'var(--fm-text)' }}
              >
                7. Changes to this policy
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
              >
                We may update this policy when the platform changes. We will update the date at
                the top of this page. For material changes we will notify organization
                administrators by email.
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
