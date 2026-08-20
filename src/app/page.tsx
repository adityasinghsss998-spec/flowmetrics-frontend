'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3, Zap, TrendingUp, Shield, GitBranch,
  ArrowRight, ChevronRight, Users, Rocket, Clock,
} from 'lucide-react'
import HeroSection from '@/components/layout/HeroSection'
import KineticGrid from '@/components/ui/kinetic-grid'
import TextBlockAnimation from '@/components/ui/text-block-animation'
import FlowMetricsLogo from '@/components/ui/FlowMetricsLogo'

/* ─── Data ──────────────────────────────────────────────────── */

const features = [
  {
    id: 'dora',
    icon: BarChart3,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    title: 'DORA Metrics Engine',
    description: 'Track Deployment Frequency, Lead Time, Change Failure Rate, and MTTR with elite-level benchmarking.',
    badge: 'Analytics',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    accentColor: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    span: 'md:col-span-2',
    visual: (
      <div className="w-full h-full flex flex-col gap-3 p-1">
        {/* Mini metric row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Deploy Freq', val: '5.8/wk', color: 'text-indigo-400' },
            { label: 'Lead Time',   val: '18.5h',  color: 'text-violet-400' },
            { label: 'CFR',         val: '8.2%',   color: 'text-red-400' },
            { label: 'MTTR',        val: '2.5h',   color: 'text-emerald-400' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg bg-white/5 border border-white/8 px-2 py-2 text-center">
              <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
              <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{m.label}</p>
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="flex items-end gap-1 flex-1 px-1">
          {[40, 65, 55, 80, 70, 95, 85, 72, 88, 60].map((h, i) => (
            <motion.div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600 to-indigo-400/30"
              initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }} viewport={{ once: true }} />
          ))}
        </div>
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
    accentColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    span: 'md:col-span-1',
    visual: (
      <div className="w-full h-full flex flex-col gap-1.5 p-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400/70 tracking-wide">LIVE FEED</span>
        </div>
        {[
          { label: 'pr:merged', dot: 'bg-blue-400', ago: '2m', desc: 'feat/auth-refresh' },
          { label: 'deploy:done', dot: 'bg-emerald-400', ago: '5m', desc: 'prod · v2.4.1' },
          { label: 'anomaly:alert', dot: 'bg-amber-400', ago: '12m', desc: 'CFR spike' },
        ].map((ev) => (
          <motion.div key={ev.label}
            className="flex items-center gap-2 rounded-md bg-white/5 border border-white/8 px-2 py-1.5"
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }} viewport={{ once: true }}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ev.dot}`} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] text-slate-200 truncate">{ev.label}</p>
              <p className="text-[9px] text-slate-500 truncate">{ev.desc}</p>
            </div>
            <span className="text-[9px] text-slate-600 shrink-0">{ev.ago}</span>
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
    accentColor: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
    span: 'md:col-span-1',
    visual: (
      <div className="w-full h-full flex flex-col gap-2 p-1">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-[10px] text-slate-500">Contribution heatmap</p>
          <p className="text-[10px] text-violet-400">last 4 wks</p>
        </div>
        <div className="grid grid-cols-7 gap-0.5 flex-1">
          {Array.from({ length: 28 }, (_, i) => {
            const pattern = [0.9, 0.15, 0.55, 0.15, 0.9, 0.2, 0.55]
            const opacity = pattern[i % pattern.length]
            return <div key={i} className="rounded-sm bg-violet-500" style={{ opacity }} />
          })}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {[{ name: 'Aditya K.', commits: '42', color: 'text-violet-400' }, { name: 'Sarah M.', commits: '38', color: 'text-indigo-400' }].map(u => (
            <div key={u.name} className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-[7px] text-white">{u.name[0]}</span>
              </div>
              <span className={`text-[9px] font-mono ${u.color}`}>{u.commits}</span>
            </div>
          ))}
        </div>
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
    accentColor: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
    span: 'md:col-span-2',
    visual: (
      <div className="w-full h-full flex flex-col gap-2 p-1">
        <div className="grid grid-cols-3 gap-2 mb-1">
          {[
            { label: 'Success Rate', val: '94.2%', color: 'text-emerald-400' },
            { label: 'Avg Duration', val: '4m 12s', color: 'text-cyan-400' },
            { label: 'Deployments', val: '142', color: 'text-indigo-400' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg bg-white/5 border border-white/8 px-2 py-1.5 text-center">
              <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 flex-1 px-1">
          {[{ h: 60, s: true }, { h: 80, s: true }, { h: 45, s: false }, { h: 90, s: true }, { h: 70, s: true }, { h: 85, s: true }, { h: 55, s: true }].map((bar, i) => (
            <motion.div key={i}
              className={`flex-1 rounded-sm ${bar.s ? 'bg-gradient-to-t from-cyan-600 to-cyan-400/30' : 'bg-gradient-to-t from-red-600 to-red-400/30'}`}
              initial={{ height: 0 }} whileInView={{ height: `${bar.h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }} viewport={{ once: true }} />
          ))}
        </div>
      </div>
    ),
  },
]

const stats = [
  { label: 'Deployments Tracked', value: '2.4M+', icon: Rocket, color: 'text-indigo-400' },
  { label: 'PRs Analyzed', value: '18M+', icon: GitBranch, color: 'text-violet-400' },
  { label: 'Avg Cycle Time Saved', value: '34%', icon: Clock, color: 'text-cyan-400' },
  { label: 'Engineering Teams', value: '1,200+', icon: Users, color: 'text-emerald-400' },
]

const steps = [
  {
    step: '01', icon: GitBranch,
    title: 'Connect Your Repo',
    desc: 'OAuth with GitHub in one click. We install a webhook and begin historical sync immediately.',
    accent: 'from-indigo-500 to-violet-500', border: 'border-indigo-500/30 hover:border-indigo-500/60',
    iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    step: '02', icon: TrendingUp,
    title: 'See Your Metrics',
    desc: 'DORA scores, cycle time trends, and contributor leaderboards populate within minutes.',
    accent: 'from-violet-500 to-purple-500', border: 'border-violet-500/30 hover:border-violet-500/60',
    iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    step: '03', icon: Shield,
    title: 'Ship Faster & Safer',
    desc: 'Anomaly alerts and live event feeds keep your team informed before incidents escalate.',
    accent: 'from-emerald-500 to-cyan-500', border: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="relative flex-col bg-[#050510] text-white">
      <HeroSection />

      <div className="relative z-20 flex flex-col">

        {/* Stats bar */}
        <section id="stats" className="border-y border-white/8 bg-white/[0.02] py-12 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 sm:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div key={s.label} className="flex flex-col items-center text-center gap-3"
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-28 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <motion.div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-6"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
            </motion.div>

            <TextBlockAnimation blockColor="#6366f1" animateOnScroll delay={0.1} duration={0.7} stagger={0.08}>
              <h2 className="mb-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl text-white leading-[1.1]">
                Everything your team needs to ship faster
              </h2>
            </TextBlockAnimation>

            <motion.p className="mb-14 max-w-2xl text-base text-slate-400 leading-relaxed"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
              From DORA benchmarks to live deployment events, FlowMetrics gives engineers
              and engineering managers the full picture.
            </motion.p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div key={f.id} id={`feature-card-${f.id}`}
                    className={`group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 shadow-xl ${f.accentColor} ${f.span}`}
                    variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                    whileHover={{ y: -4 }}>
                    {/* Visual area — now tall and rich */}
                    <div className="mb-4 h-[130px] overflow-hidden rounded-xl bg-black/40 border border-white/8">
                      {f.visual}
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${f.iconBg}`}>
                        <Icon className={`h-4 w-4 ${f.iconColor}`} />
                      </div>
                      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-semibold tracking-wide ${f.badgeColor}`}>{f.badge}</span>
                    </div>
                    <h3 className="mb-1.5 text-base font-semibold text-white">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.description}</p>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-200">
                        Learn more <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* KineticGrid interactive section */}
        <section className="relative border-t border-white/5">
          <KineticGrid className="min-h-[380px]" globalColor="indigo">
            <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center py-20">
              <TextBlockAnimation blockColor="#6366f1" animateOnScroll delay={0} duration={0.75} stagger={0.1}>
                <h2 className="text-4xl font-black tracking-tighter text-white sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
                  Move your cursor.<br />Click anywhere.
                </h2>
              </TextBlockAnimation>
              <motion.p className="max-w-md text-base text-white/50 mb-8"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }} viewport={{ once: true }}>
                FlowMetrics is built for teams who care about craft. Just like this interaction — every detail matters.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }} viewport={{ once: true }}>
                <Link href="/register"
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5">
                  Get started free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>
          </KineticGrid>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-white/5 px-6 py-28 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <motion.div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 mb-6"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">How It Works</p>
            </motion.div>

            <TextBlockAnimation blockColor="#7c3aed" animateOnScroll delay={0.1} duration={0.7} stagger={0.08}>
              <h2 className="mb-16 text-4xl font-bold tracking-tight sm:text-5xl text-white leading-[1.1]">
                Up and running in minutes
              </h2>
            </TextBlockAnimation>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {steps.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div key={s.step}
                    className={`group relative flex flex-col gap-5 rounded-2xl border bg-white/[0.04] p-7 backdrop-blur-md transition-all shadow-xl ${s.border}`}
                    variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                    whileHover={{ y: -4 }}>
                    <div className="absolute top-5 right-5 font-mono text-5xl font-black text-white/[0.06] leading-none select-none">{s.step}</div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${s.iconBg}`}>
                      <Icon className={`h-5 w-5 ${s.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-white">{s.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                    <div className={`h-0.5 w-12 rounded-full bg-gradient-to-r ${s.accent} opacity-60`} />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="px-6 py-28 lg:px-12 border-t border-white/5">
          <motion.div className="mx-auto max-w-2xl relative"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-purple-600/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl border border-indigo-500/25 bg-white/[0.04] p-12 text-center backdrop-blur-md shadow-2xl shadow-indigo-500/10">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Free Plan</p>
              </div>
              <TextBlockAnimation blockColor="#6366f1" animateOnScroll delay={0} duration={0.75} stagger={0.1}>
                <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl text-white leading-[1.1]">
                  Ready to level up your engineering?
                </h2>
              </TextBlockAnimation>
              <p className="mb-10 text-base text-slate-400 leading-relaxed mt-4">
                Free for teams under 10. No credit card required.<br />Connect your GitHub repo in 60 seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/register"
                  className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5">
                  Start for Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/login" className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-medium text-slate-300 hover:text-white hover:border-white/30 transition-all">
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/8 bg-black/60 px-6 py-10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
            <FlowMetricsLogo size="sm" />
            <p className="text-xs text-slate-500">Built with Next.js · TypeScript · React Three Fiber · Socket.io</p>
            <p className="text-xs text-slate-600">© 2026 FlowMetrics</p>
          </div>
        </footer>
      </div>
    </div>
  )
}