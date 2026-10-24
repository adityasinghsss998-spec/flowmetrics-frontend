// Draft Terms of Service — must be reviewed by legal counsel before public launch.

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service: FlowMetrics',
  description: 'Terms of Service for the FlowMetrics developer analytics platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--fm-bg)] text-[var(--fm-text)]">
      <header className="border-b border-[var(--fm-line)] px-6 py-4">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between">
          <Link
            href="/"
            className="font-mono text-sm font-semibold tracking-tight text-[var(--fm-text)] hover:text-[var(--fm-accent)] transition-colors"
          >
            flowmetrics
          </Link>
          <Link
            href="/login"
            className="font-mono text-xs text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-6 py-16">
        <div className="max-w-2xl space-y-8">
          <div>
            <p className="font-mono text-xs text-[var(--fm-text-muted)]">Legal</p>
            <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight text-[var(--fm-text)]">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-[var(--fm-text-muted)]">
              Last updated: October 2026. This is a draft document.
            </p>
          </div>

          <div className="space-y-6 text-sm text-[var(--fm-text)] leading-relaxed border-t border-[var(--fm-line)] pt-8">
            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                1. What FlowMetrics does
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                FlowMetrics is an engineering analytics platform that tracks four key DORA metrics (deployment frequency, lead time for changes, change failure rate, and time to restore service), cycle time, open pull requests, and contributor activity. The service is free to use.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                2. Authentication and repository access
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                You authenticate using GitHub OAuth or your email address. When you connect a GitHub repository, FlowMetrics requests read-only permissions to sync pull request data, commit logs, review comments, and deployment event records. FlowMetrics never requests write permissions to your source code and never modifies your repositories.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                3. Data collection and storage
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                We store repository metadata, pull request titles, author usernames, commit timestamps, review turnarounds, and deployment records in order to compute team analytics. Source code contents and files are not indexed or stored on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                4. Automated communications
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                By connecting repositories to an organization, team administrators agree to receive operational alert emails when metric anomalies are detected (such as deployment failures or cycle time spikes) and automated weekly digest summaries. You can configure notification recipients at any time in organization settings.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                5. Disconnecting repositories and termination
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                You can disconnect a repository or leave an organization at any time from the dashboard. Disconnecting a repository stops future syncing and queued jobs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                6. Service availability
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                FlowMetrics is provided free of charge on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. We strive for high uptime but do not guarantee uninterrupted availability.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
