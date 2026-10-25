'use client'

import Link from 'next/link'
import HeroSection, { LandingNav } from '@/components/layout/HeroSection'
import PanelScene from '@/components/layout/PanelScene'

/* ─── DORA metric definitions ───────────────────────────────── */

const METRICS = [
  {
    name: 'Deployment frequency',
    description:
      'How often a team deploys code to production. Elite teams deploy multiple times per day. FlowMetrics counts workflow runs recorded via the GitHub Actions webhook.',
    source: 'GitHub Actions deployment events',
  },
  {
    name: 'Lead time for changes',
    description:
      'The time from the first commit on a branch to that branch being deployed. Measures how fast new code reaches users.',
    source: 'Commit timestamps and deployment records',
  },
  {
    name: 'Change failure rate',
    description:
      'The percentage of deployments that result in a failure requiring remediation. Tracked from failed deployment records.',
    source: 'Deployment status and outcome flags',
  },
  {
    name: 'Time to restore service',
    description:
      'How long it takes to recover from a failure in production. Calculated from the time a failed deployment is recorded to the next successful one.',
    source: 'Failed-to-successful deployment pairs',
  },
]

/* ─── How it works steps ───────────────────────────────────── */

const STEPS = [
  {
    n: '1',
    title: 'Connect a repository',
    desc: 'Sign in with GitHub. FlowMetrics installs a webhook and begins reading pull request and deployment history.',
  },
  {
    n: '2',
    title: 'Read the metrics',
    desc: 'The dashboard shows DORA scores, cycle time trends, contributor leaderboards and open pull requests, updated as events arrive.',
  },
  {
    n: '3',
    title: 'Get alerts and a weekly summary',
    desc: 'When a metric crosses a threshold, an alert email goes to the organization. Every week a digest summarizes delivery health across all connected repositories.',
  },
]

/* ─── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--fm-bg)', color: 'var(--fm-text)' }}>
      {/* Fixed nav pill */}
      <LandingNav />

      {/* Hero */}
      <HeroSection />

      {/* ── Product panels ──────────────────────────────────── */}
      <PanelScene />

      {/* ── Metrics definition list ─────────────────────────── */}
      <section
        aria-labelledby="metrics-heading"
        className="border-t border-[var(--fm-line)]"
        style={{
          paddingTop: '120px',
          paddingBottom: '120px',
        }}
      >
        <div className="mx-auto max-w-[1120px] px-6">
          <p
            className="font-mono text-xs mb-4"
            style={{ color: 'var(--fm-text-muted)' }}
          >
            The four metrics
          </p>
          <h2
            id="metrics-heading"
            className="font-mono font-bold mb-16"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              color: 'var(--fm-text)',
              lineHeight: 1.1,
            }}
          >
            What FlowMetrics measures.
          </h2>

          <dl>
            {METRICS.map((m, i) => (
              <div
                key={m.name}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 py-6 border-b border-[var(--fm-line)]"
                style={{
                  borderTop: i === 0 ? '1px solid var(--fm-line)' : undefined,
                }}
              >
                <dt>
                  <span
                    className="font-mono text-sm font-medium block"
                    style={{ color: 'var(--fm-text)' }}
                  >
                    {m.name}
                  </span>
                  <span
                    className="font-mono text-xs block mt-2"
                    style={{ color: 'var(--fm-text-muted)' }}
                  >
                    Source: {m.source}
                  </span>
                </dt>
                <dd
                  className="text-base leading-relaxed m-0"
                  style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
                >
                  {m.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="border-t border-[var(--fm-line)]"
        style={{
          paddingTop: '120px',
          paddingBottom: '120px',
        }}
      >
        <div className="mx-auto max-w-[1120px] px-6">
          <p
            className="font-mono text-xs mb-4"
            style={{ color: 'var(--fm-text-muted)' }}
          >
            How it works
          </p>
          <h2
            id="how-heading"
            className="font-mono font-bold mb-16"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              color: 'var(--fm-text)',
              lineHeight: 1.1,
            }}
          >
            Three steps.
          </h2>

          <ol
            className="space-y-0"
            style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: '640px' }}
          >
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                className="flex gap-8 py-6"
                style={{
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--fm-line)' : undefined,
                }}
              >
                <span
                  className="font-mono text-sm shrink-0 tabular"
                  style={{ color: 'var(--fm-text-muted)', minWidth: '1.5rem' }}
                >
                  {step.n}.
                </span>
                <div>
                  <p
                    className="font-mono text-sm font-medium mb-2"
                    style={{ color: 'var(--fm-text)' }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Closing line ─────────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="border-t border-[var(--fm-line)]"
        style={{
          paddingTop: '120px',
          paddingBottom: '120px',
        }}
      >
        <div className="mx-auto max-w-[1120px] px-6">
          <h2
            id="cta-heading"
            className="font-mono font-bold mb-6"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: 'var(--fm-text)',
              lineHeight: 1.05,
              maxWidth: '22ch',
            }}
          >
            Start measuring your delivery today.
          </h2>
          <p
            className="mb-8 text-base"
            style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
          >
            Free to use. No credit card required.
          </p>
          <Link href="/register" className="fm-btn-accent px-5 py-2.5 text-sm">
            <span>Continue with GitHub</span>
          </Link>
        </div>
      </section>

      {/* ── Footer: aligned on one baseline ──────────────────── */}
      <footer
        className="border-t border-[var(--fm-line)]"
        style={{
          paddingTop: '48px',
          paddingBottom: '48px',
        }}
      >
        <div className="mx-auto max-w-[1120px] px-6 flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
          {/* Wordmark */}
          <Link
            href="/"
            className="fm-wordmark-link font-mono text-sm font-semibold tracking-tight"
            style={{ color: 'var(--fm-text)' }}
          >
            <span>flowmetrics</span>
          </Link>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul
              className="flex flex-wrap items-baseline gap-x-8 gap-y-3"
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Accessibility', href: '/accessibility' },
                {
                  label: 'Source on GitHub',
                  href: 'https://github.com/adityasinghsss998-spec/flowmetrics-frontend',
                  rel: 'noopener noreferrer',
                },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    {...('rel' in item ? { rel: item.rel, target: '_blank' } : {})}
                    className="fm-inline-link font-mono text-xs"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p
            className="font-mono text-xs"
            style={{ color: 'var(--fm-text-muted)' }}
          >
            &copy; 2026 FlowMetrics
          </p>
        </div>
      </footer>
    </div>
  )
}