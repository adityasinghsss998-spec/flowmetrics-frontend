'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  GitBranch,
  BarChart3,
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ScrollProgressProvider, useScrollProgress } from '@/context/ScrollProgressContext'
import HeroCanvas from '@/components/three/HeroCanvas'
import Navbar from '@/components/layout/Navbar'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const AVATAR_COLORS = ['bg-indigo-600', 'bg-violet-600', 'bg-cyan-600', 'bg-emerald-600']

function ScrollDriver() {
  const pinRef = useRef<HTMLDivElement>(null)
  const ctaOverlayRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress()

  useGSAP(
    () => {
      const el = pinRef.current
      if (!el) return

      const proxy = { value: 0 }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=200vh',
          scrub: 1.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      })

      tl.to(
        proxy,
        {
          value: 1,
          ease: 'none',
          onUpdate() {
            progress.current = proxy.value
          },
        },
        0
      )

      if (ctaOverlayRef.current) {
        tl.fromTo(
          ctaOverlayRef.current,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.3 },
          0.7
        )
      }
    },
    { scope: pinRef }
  )

  return (
    <div ref={pinRef} className="relative w-full h-screen overflow-hidden bg-[#050510]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />

      <div className="relative z-20 flex flex-col h-full">
        <Navbar variant="landing" />

        <div className="flex-1 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-12">
          <div className="flex flex-col">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Now in Beta — Free for Teams Under 10
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl text-white"
            >
              Engineering
              <br />
              Metrics{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                that Actually Matter
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-6 max-w-lg text-base text-slate-300 sm:text-lg leading-relaxed"
            >
              FlowMetrics connects to your GitHub repositories and delivers DORA metrics,
              cycle time analysis, contributor insights, and real-time deployment events — all in
              one beautiful dashboard.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-px"
              >
                Start for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10 hover:border-white/20"
              >
                <GitBranch className="h-4 w-4" />
                Continue with GitHub
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((bg, i) => (
                  <div
                    key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050510] ${bg}`}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">1,200+ teams</p>
                <p className="text-xs text-slate-400">already shipping faster</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="relative hidden lg:flex items-center justify-center"
            style={{ height: '480px' }}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <HeroCanvas />
            </div>

            <div
              ref={ctaOverlayRef}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0 invisible"
            >
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-600/80 backdrop-blur px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
              >
                Enter Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-slate-500 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <ScrollProgressProvider>
      <ScrollDriver />
    </ScrollProgressProvider>
  )
}
