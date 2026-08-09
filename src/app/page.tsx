'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Zap,
  GitMerge,
  Users,
  ChevronRight,
  ArrowRight,
  GitBranch,
  Activity,
  TrendingUp,
  Shield,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

// ─── Feature cards data (adapted from 21st.dev FeaturesSection pattern) ─────
const features = [
  {
    id: 'analytics',
    icon: BarChart3,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    title: 'DORA Metrics at a Glance',
    description:
      'Track Deployment Frequency, Lead Time, Change Failure Rate, and MTTR with elite-level benchmarking across all your repositories.',
    badge: 'Analytics',
    badgeColor: 'bg-indigo-500/15 text-indigo-400',
    visual: (
      <div className="flex items-end gap-1.5 h-20">
        {[40, 65, 55, 80, 70, 95, 85].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-indigo-500/30"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          />
        ))}
      </div>
    ),
  },
  {
    id: 'realtime',
    icon: Zap,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    title: 'Real-Time Event Feed',
    description:
      'Get instant WebSocket notifications for PR merges, deployments, and anomalies. React Query cache invalidates automatically.',
    badge: 'Live',
    badgeColor: 'bg-emerald-500/15 text-emerald-400',
    visual: (
      <div className="space-y-2">
        {[
          { label: 'pr:merged', color: 'bg-blue-500', delay: 0 },
          { label: 'deployment:completed', color: 'bg-emerald-500', delay: 0.1 },
          { label: 'anomaly:detected', color: 'bg-amber-500', delay: 0.2 },
        ].map((ev) => (
          <motion.div
            key={ev.label}
            className="flex items-center gap-2 rounded-md bg-background/60 px-3 py-1.5 border border-border/40"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: ev.delay, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ev.color}`} />
            <span className="font-mono text-[10px] text-muted-foreground">{ev.label}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'ai',
    icon: Activity,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    title: 'Contributor Intelligence',
    description:
      'Review heatmaps, per-author PR velocity, reviewer leaderboards, and cycle-time drill-downs give your team actionable insight.',
    badge: 'Insights',
    badgeColor: 'bg-violet-500/15 text-violet-400',
    visual: (
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 28 }, (_, i) => {
          // Use a deterministic pattern to avoid SSR Hydration mismatches
          const pattern = ['opacity-90', 'opacity-15', 'opacity-50', 'opacity-15', 'opacity-90', 'opacity-15', 'opacity-50']
          const opacity = pattern[i % pattern.length]
          return (
            <div
              key={i}
              className={`h-5 w-full rounded-sm bg-violet-500 ${opacity}`}
            />
          )
        })}
      </div>
    ),
  },
]

// ─── Stats bar ───────────────────────────────────────────────────────────────
const stats = [
  { label: 'Deployments Tracked', value: '2.4M+' },
  { label: 'PRs Analyzed', value: '18M+' },
  { label: 'Avg Cycle Time Saved', value: '34%' },
  { label: 'Engineering Teams', value: '1,200+' },
]

// ─── How it works steps ──────────────────────────────────────────────────────
const steps = [
  {
    step: '01',
    icon: GitBranch,
    title: 'Connect Your Repo',
    desc: 'OAuth with GitHub in one click. We install a webhook and begin historical sync immediately.',
  },
  {
    step: '02',
    icon: TrendingUp,
    title: 'See Your Metrics',
    desc: 'DORA scores, cycle time trends, and contributor leaderboards populate within minutes.',
  },
  {
    step: '03',
    icon: Shield,
    title: 'Ship Faster & Safer',
    desc: 'Anomaly alerts and live event feeds keep your team informed before incidents escalate.',
  },
]

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar variant="landing" />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-20 text-center lg:pt-28"
      >
        {/* Gradient background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute right-1/4 top-32 h-64 w-64 rounded-full bg-cyan-600/8 blur-3xl" />
        </div>

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now in Beta — Free for Teams Under 10
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Engineering Metrics{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            that Actually Matter
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          FlowMetrics connects to your GitHub repositories and delivers DORA metrics,
          cycle time analysis, contributor insights, and real-time deployment events — all in
          one beautiful dashboard.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-px"
          >
            Start for Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-all hover:bg-accent/60 hover:border-border"
          >
            <GitBranch className="h-4 w-4" />
            Continue with GitHub
          </Link>
        </motion.div>

        {/* ── 3D HERO CANVAS PLACEHOLDER ────────────────────────────────────
             Phase 5 will replace this container with:
             dynamic(() => import('@/components/three/HeroCanvas'), { ssr: false })
             DO NOT add Three.js/WebGL code here — this is Phase 2 only.
        ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-16 w-full max-w-5xl"
        >
          <div
            id="hero-canvas-container"
            aria-label="3D hero visualization — loads in Phase 5"
            className="relative flex h-[340px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 shadow-2xl shadow-indigo-500/10 lg:h-[420px]"
          >
            {/* Grid lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] bg-[size:40px_40px]"
            />
            {/* Glow center */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-48 w-48 rounded-full bg-indigo-600/20 blur-3xl"
            />

            {/* Floating metric cards (purely decorative) */}
            <div className="relative z-10 grid grid-cols-2 gap-3 px-6 sm:grid-cols-4 sm:gap-4">
              {[
                { label: 'Deploy Freq', value: '5.8/wk', color: 'indigo', icon: Zap },
                { label: 'Lead Time', value: '18.5h', color: 'blue', icon: TrendingUp },
                { label: 'CFR', value: '8%', color: 'amber', icon: Shield },
                { label: 'MTTR', value: '2.5h', color: 'emerald', icon: Activity },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background/70 p-3 backdrop-blur-sm"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {card.label}
                  </span>
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Phase label overlay */}
            <div className="absolute bottom-3 right-3 rounded-md bg-background/60 px-2 py-1 text-[10px] text-muted-foreground/60 backdrop-blur border border-border/30">
              3D Globe renders in Phase 5
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section
        id="stats"
        className="border-y border-border/40 bg-background/60 py-8 backdrop-blur"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURE CARDS (21st.dev FeaturesSection pattern) ─────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.p
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Features
          </motion.p>
          <motion.h2
            className="mb-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
          >
            Everything your team needs to ship with confidence
          </motion.h2>
          <motion.p
            className="mb-12 max-w-2xl text-base text-muted-foreground"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
          >
            From DORA benchmarks to live deployment events, FlowMetrics gives engineers
            and engineering managers the full picture.
          </motion.p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.id}
                  id={`feature-card-${f.id}`}
                  className="group flex flex-col rounded-2xl border border-border/40 bg-secondary/50 p-6 backdrop-blur-sm transition-all duration-200 hover:border-indigo-500/30 hover:bg-secondary/80"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ scale: 0.985, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Visual preview */}
                  <div className="mb-5 flex h-[100px] items-center">
                    {f.visual}
                  </div>

                  {/* Badge + Icon */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${f.iconBg}`}>
                      <Icon className={`h-4 w-4 ${f.iconColor}`} />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="mb-2 text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>

                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                      Learn more <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="border-t border-border/40 bg-background/60 px-6 py-24 backdrop-blur"
      >
        <div className="mx-auto max-w-5xl">
          <motion.p
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            How It Works
          </motion.p>
          <motion.h2
            className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
          >
            Up and running in minutes
          </motion.h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.step}
                  className="flex flex-col gap-4"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/15 border border-indigo-500/20">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="font-mono text-4xl font-bold text-border/60">{s.step}</span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-24">
        <motion.div
          className="mx-auto max-w-2xl rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-background p-10 text-center shadow-xl shadow-indigo-500/5"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Get Started
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Ready to level up your engineering?
          </h2>
          <p className="mb-8 text-base text-muted-foreground">
            Free for teams under 10. No credit card required. Connect your GitHub repo in 60 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:-translate-y-px"
            >
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-border/60 px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-border"
            >
              Already have an account?
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-foreground">
              Flow<span className="text-indigo-400">Metrics</span>
            </span>
          </div>
          <p>Built with Next.js 14 · TypeScript · shadcn/ui · React Query · Socket.io · Three.js</p>
          <p>© 2026 FlowMetrics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}