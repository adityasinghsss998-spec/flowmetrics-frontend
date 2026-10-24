// Draft Privacy Policy — must be reviewed by legal counsel before public launch.

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy: FlowMetrics',
  description: 'Privacy Policy for the FlowMetrics developer analytics platform.',
}

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-[var(--fm-text-muted)]">
              Last updated: October 2026. This is a draft document.
            </p>
          </div>

          <div className="space-y-6 text-sm text-[var(--fm-text)] leading-relaxed border-t border-[var(--fm-line)] pt-8">
            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                1. Information we collect
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                When you create a FlowMetrics account, we collect your name, email address, and GitHub username. When you connect a GitHub repository, we sync and store:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[var(--fm-text-muted)] text-xs font-mono">
                <li>Repository metadata (name, owner, default branch)</li>
                <li>Pull request data (numbers, titles, state, author, reviewers, size, timestamps)</li>
                <li>Commit metadata (hashes, commit times, author usernames)</li>
                <li>Deployment event records (environment, status, duration, timestamps)</li>
              </ul>
              <p className="text-[var(--fm-text-muted)] mt-2">
                We do not collect, read, or store the contents of your source code files.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                2. How your data is used
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                We use collected information solely to provide FlowMetrics features:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[var(--fm-text-muted)] text-xs font-mono">
                <li>Calculating team DORA metrics and cycle time trends</li>
                <li>Generating contributor activity and code review turnaround heatmaps</li>
                <li>Sending notification emails when anomalies (e.g. failing deployments) occur</li>
                <li>Delivering automated weekly digest summaries to organization members</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                3. Data sharing and disclosure
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                We do not sell, rent, or trade your personal information or engineering metrics. Your metrics are only accessible to authorized members of your organization.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                4. Security and token storage
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                GitHub OAuth access tokens are securely encrypted at rest. We adhere to industry-standard security practices to protect data against unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                5. Data retention and deletion
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                You retain ownership of all your data. If you disconnect a repository or request account deletion, we purge the associated analytics records from active databases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">
                6. Questions and contact
              </h2>
              <p className="text-[var(--fm-text-muted)]">
                If you have questions about this privacy policy or your stored data, contact us via your organization settings or on our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
