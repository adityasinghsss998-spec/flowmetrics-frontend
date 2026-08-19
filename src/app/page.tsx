'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Zap,
  Activity,
  TrendingUp,
  Shield,
  GitBranch,
  ArrowRight,
  ChevronRight,
  Users,
  Rocket,
  Eye,
  Clock,
} from 'lucide-react'
import HeroSection from '@/components/layout/HeroSection'

const features = [
  {
    id: 'dora',
    icon: BarChart3,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    title: 'DORA Metrics Engine',
    description:
      'Track Deployment Frequency, Lead Time, Change Failure Rate, and MTTR with elite-level benchmarking.',
    badge: 'Analytics',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    span: 'md:col-span-2',
    visual: (
      <div className="flex items-end gap-1 h-16 px-2">
        {[40, 65, 55, 80, 70, 95, 85, 72, 88, 60].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600/40 to-indigo-400/20"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
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
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Real-Time Events',
    description: 'Instant WebSocket notifications for PR merges, deployments, and anomalies.',
    badge: 'Live',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    span: 'md:col-span-1',
    visual: (
      <div className="space-y-1.5">
        {[
          { label: 'pr:merged', dot: 'bg-blue-500', delay: 0 },
          { label: 'deployment:completed', dot: 'bg-emerald-500', delay: 0.08 },
          { label: 'anomaly:detected', dot: 'bg-amber-500', delay: 0.16 },
        ].map((ev) => (
          <motion.div
            key={ev.label}
            className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-2.5 py-1"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: ev.delay, duration: 0.35 }}
            viewport={{ once: true }}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ev.dot}`} />
            <span className="font-mono text-[10px] text-slate-300">{ev.label}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'contributors',
    icon: Users,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    title: 'Contributor Intelligence',
    description: 'Review heatmaps, PR velocity, reviewer leaderboards, and cycle-time drill-downs.',
    badge: 'Insights',
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    span: 'md:col-span-1',
    visual: (
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 28 }, (_, i) => {
          const pattern = [0.9, 0.15, 0.5, 0.15, 0.9, 0.15, 0.5]
          const opacity = pattern[i % pattern.length]
          return (
            <div
              key={i}
              className="h-4 w-full rounded-sm bg-violet-500"
              style={{ opacity }}
            />
          )
        })}
      </div>
    ),
  },
  {
    id: 'deployments',
    icon: Rocket,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Deployment Analytics',
    description: 'Build duration trends, failure rates, and frequency analysis across environments.',
    badge: 'DevOps',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    span: 'md:col-span-2',
    visual: (
      <div className="flex items-end gap-2 h-14 px-2">
        {[
          { h: 60, s: true },
          { h: 80, s: true },
          { h: 45, s: false },
          { h: 90, s: true },
          { h: 70, s: true },
          { h: 85, s: true },
          { h: 55, s: true },
        ].map((bar, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-sm ${bar.s ? 'bg-gradient-to-t from-cyan-600/40 to-cyan-400/20' : 'bg-gradient-to-t from-red-600/40 to-red-400/20'}`}
            initial={{ height: 0 }}
            whileInView={{ height: `${bar.h}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            viewport={{ once: true }}
          />
        ))}
      </div>
    ),
  },
]

const stats = [
  { label: 'Deployments Tracked', value: '2.4M+', icon: Rocket },
  { label: 'PRs Analyzed', value: '18M+', icon: GitBranch },
  { label: 'Avg Cycle Time Saved', value: '34%', icon: Clock },
  { label: 'Engineering Teams', value: '1,200+', icon: Users },
]

const steps = [
  {
    step: '01',
    icon: GitBranch,
    title: 'Connect Your Repo',
    desc: 'OAuth with GitHub in one click. We install a webhook and begin historical sync immediately.',
    color: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
  },
  {
    step: '02',
    icon: TrendingUp,
    title: 'See Your Metrics',
    desc: 'DORA scores, cycle time trends, and contributor leaderboards populate within minutes.',
    color: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
  },
  {
    step: '03',
    icon: Shield,
    title: 'Ship Faster & Safer',
    desc: 'Anomaly alerts and live event feeds keep your team informed before incidents escalate.',
    color: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  },
]

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
    <div className="relative flex-col text-white bg-[#050510]">
      <HeroSection />

      <div className="relative z-20 flex flex-col">
        <section
          id="stats"
          className="border-y border-white/10 bg-black/40 py-10 backdrop-blur-md"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  className="flex flex-col items-center text-center gap-2"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <Icon className="h-5 w-5 text-slate-400" />
                  <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section id="features" className="px-6 py-24 lg:px-12 bg-black/60 backdrop-blur-sm">
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
              className="mb-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl text-white"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
            >
              Everything your team needs to ship with confidence
            </motion.h2>
            <motion.p
              className="mb-12 max-w-2xl text-base text-slate-400"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
            >
              From DORA benchmarks to live deployment events, FlowMetrics gives engineers
              and engineering managers the full picture.
            </motion.p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={f.id}
                    id={`feature-card-${f.id}`}
                    className={`group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10 ${f.span}`}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    whileHover={{ y: -3 }}
                  >
                    <div className="mb-5 flex h-[80px] items-end overflow-hidden rounded-lg bg-black/50 border border-white/10 px-2 py-2">
                      {f.visual}
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${f.iconBg}`}>
                        <Icon className={`h-4 w-4 ${f.iconColor}`} />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${f.badgeColor}`}>
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>

                    <div className="mt-auto pt-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Learn more <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-white/10 bg-black/60 px-6 py-24 lg:px-12 backdrop-blur-sm"
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
              className="mb-14 text-3xl font-bold tracking-tight sm:text-4xl text-white"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
            >
              Up and running in minutes
            </motion.h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {steps.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.step}
                    className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${s.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-4xl font-bold text-white/10">{s.step}</span>
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-base font-semibold text-white">{s.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-24 lg:px-12 bg-black/60 backdrop-blur-sm">
          <motion.div
            className="mx-auto max-w-2xl rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent p-10 text-center shadow-2xl shadow-indigo-500/10 backdrop-blur-md"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Get Started
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
              Ready to level up your engineering?
            </h2>
            <p className="mb-8 text-base text-slate-300">
              Free for teams under 10. No credit card required. Connect your GitHub repo in 60 seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:-translate-y-px"
              >
                Start for Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition-all hover:text-white hover:border-white/30"
              >
                Already have an account?
              </Link>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-white/10 bg-black/80 px-6 py-8 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
                <BarChart3 className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold text-white">
                Flow<span className="text-indigo-400">Metrics</span>
              </span>
            </div>
            <p>Built with Next.js · TypeScript · shadcn/ui · React Query · Socket.io</p>
            <p>© 2026 FlowMetrics. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}