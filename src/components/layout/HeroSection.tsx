'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ScrollProgressProvider, useScrollProgress } from '@/context/ScrollProgressContext'
import HeroCanvas from '@/components/three/HeroCanvas'
import FlowMetricsLogo from '@/components/ui/FlowMetricsLogo'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function ScrollDriver() {
  const pinRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress()

  useGSAP(() => {
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
    tl.to(proxy, { value: 1, ease: 'none', onUpdate() { progress.current = proxy.value } }, 0)
    if (leftRef.current) {
      tl.fromTo(leftRef.current.querySelectorAll('.spec-item'),
        { autoAlpha: 0, x: -28 },
        { autoAlpha: 1, x: 0, stagger: 0.14, ease: 'power2.out', duration: 0.45 }, 0.22)
    }
    if (rightRef.current) {
      tl.fromTo(rightRef.current.querySelectorAll('.spec-item'),
        { autoAlpha: 0, x: 28 },
        { autoAlpha: 1, x: 0, stagger: 0.14, ease: 'power2.out', duration: 0.45 }, 0.42)
    }
    if (ctaRef.current) {
      tl.fromTo(ctaRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.35 }, 0.72)
    }
    if (scrollHintRef.current) {
      tl.to(scrollHintRef.current, { autoAlpha: 0, duration: 0.2 }, 0.05)
    }
  }, { scope: pinRef })

  return (
    <div ref={pinRef} className="relative w-full h-screen overflow-hidden bg-[#050510]">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_55%_40%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

      {/* Macro background type */}
      <div className="absolute top-0 left-0 z-0 pointer-events-none select-none overflow-hidden">
        <p className="font-black leading-[0.82] tracking-tighter whitespace-nowrap"
          style={{ fontSize: 'clamp(10rem, 28vw, 30rem)', color: 'rgba(255,255,255,0.028)' }}>
          FLOW
        </p>
      </div>
      <div className="absolute bottom-0 right-0 z-0 pointer-events-none select-none overflow-hidden">
        <p className="font-black leading-[0.82] tracking-tighter whitespace-nowrap"
          style={{ fontSize: 'clamp(6rem, 15vw, 18rem)', color: 'rgba(255,255,255,0.022)' }}>
          METRICS
        </p>
      </div>

      {/* Nav — bigger, more visible */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5">
        <Link href="/">
          <FlowMetricsLogo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2.5">
          {['Features', 'How It Works', 'Pricing'].map(label => (
            <Link
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Login
          </Link>
        </div>
        <Link
          href="/register"
          className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-px"
        >
          Get Started
          <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
        </Link>
      </nav>

      {/* Metadata */}
      <div className="absolute top-20 left-8 z-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.28em] text-white/25">Engineering Platform</p>
        <p className="text-[9px] font-mono uppercase tracking-[0.28em] text-white/25 mt-0.5">Release 2026</p>
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <HeroCanvas />
      </div>

      {/* Left spec labels */}
      <div ref={leftRef} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 space-y-8">
        <div className="spec-item pl-3 border-l-2 border-indigo-400/70">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-indigo-400/80">01 / Layer</p>
          </div>
          <p className="text-base font-bold tracking-wide uppercase text-white">DORA</p>
          <p className="text-xs mt-1 leading-relaxed max-w-[150px] text-slate-400">Deploy Freq & MTTR</p>
        </div>
        <div className="spec-item pl-3 border-l-2 border-violet-400/70">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-violet-400/80">02 / Layer</p>
          </div>
          <p className="text-base font-bold tracking-wide uppercase text-white">Cycle Time</p>
          <p className="text-xs mt-1 leading-relaxed max-w-[150px] text-slate-400">Lead Time for Changes</p>
        </div>
      </div>

      {/* Right spec labels */}
      <div ref={rightRef} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 space-y-8 text-right">
        <div className="spec-item pr-3 border-r-2 border-cyan-400/70">
          <div className="flex items-center justify-end gap-2 mb-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-cyan-400/80">03 / Layer</p>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <p className="text-base font-bold tracking-wide uppercase text-white">Live Events</p>
          <p className="text-xs mt-1 leading-relaxed max-w-[150px] ml-auto text-slate-400">Real-Time WebSocket Feed</p>
        </div>
        <div className="spec-item pr-3 border-r-2 border-emerald-400/70">
          <div className="flex items-center justify-end gap-2 mb-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-emerald-400/80">04 / Layer</p>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          <p className="text-base font-bold tracking-wide uppercase text-white">Analytics</p>
          <p className="text-xs mt-1 leading-relaxed max-w-[150px] ml-auto text-slate-400">Contributor Intelligence</p>
        </div>
      </div>

      {/* Scroll hint — visible at load, fades away on first scroll */}
      <div ref={scrollHintRef} className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-2">
        <p className="text-xs text-white/40 tracking-widest uppercase font-mono">Scroll to explore</p>
        <div className="flex flex-col items-center gap-1 animate-bounce">
          <div className="h-6 w-4 rounded-full border border-white/20 flex items-start justify-center pt-1">
            <div className="h-1.5 w-0.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* End-of-scroll CTA */}
      <div ref={ctaRef} className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-4 opacity-0 invisible">
        <Link
          href="/register"
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5"
        >
          Start for Free
          <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
        </Link>
        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Free for teams under 10 · No card required</p>
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
