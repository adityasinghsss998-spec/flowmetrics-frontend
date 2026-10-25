'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ─── Typing reveal helpers ─────────────────────────────────── */

/**
 * Splits text into words wrapped in whitespace-nowrap spans,
 * with character spans inside, so lines can only break between words.
 */
function TypingHeadline({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span aria-hidden="true">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" style={{ whiteSpace: 'nowrap' }}>
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              data-char
              style={{ opacity: 0 }}
              className="inline-block"
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && (
            <span
              data-char
              style={{ opacity: 0 }}
              className="inline-block whitespace-pre"
            >
              {' '}
            </span>
          )}
        </span>
      ))}
    </span>
  )
}

/* ─── Nav pill (fixed, small corner radius) ─────────────────── */

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const target = document.getElementById(id)
    if (!target) return
    const offset = 80
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top,
      behavior: reduced ? 'instant' : 'smooth',
    })
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-4"
      aria-label="Site navigation"
    >
      {/* The pill: 4px corner radius matching reference */}
      <div
        className="relative flex items-center rounded-[4px] border border-[var(--fm-line)]"
        style={{ background: 'var(--fm-surface)' }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="fm-wordmark-link px-4 py-2 font-mono text-sm font-semibold tracking-tight"
          aria-label="FlowMetrics home"
        >
          <span>flowmetrics</span>
        </Link>

        {/* Separator */}
        <span
          className="h-4 w-px bg-[var(--fm-line)]"
          aria-hidden="true"
        />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center">
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, 'features')}
            className="fm-nav-link px-3.5 py-2 font-mono text-sm text-[var(--fm-text-muted)]"
          >
            <span>Features</span>
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
            className="fm-nav-link px-3.5 py-2 font-mono text-sm text-[var(--fm-text-muted)]"
          >
            <span>How it works</span>
          </a>
          <Link
            href="/login"
            className="fm-nav-link px-3.5 py-2 font-mono text-sm text-[var(--fm-text-muted)]"
          >
            <span>Sign in</span>
          </Link>
        </div>

        {/* Mobile menu toggle text button (no hamburger icon) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fm-btn-quiet px-3 py-2 font-mono text-xs text-[var(--fm-text-muted)] border-0"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
        </button>

        {/* Primary button — attached flush to right end with matching corner radius */}
        <Link
          href="/register"
          className="fm-btn-accent rounded-l-none rounded-r-[3px] px-4 py-2 text-xs md:text-sm whitespace-nowrap"
        >
          <span>Continue with GitHub</span>
        </Link>
      </div>

      {/* Mobile dropdown panel */}
      {mobileMenuOpen && (
        <div
          className="absolute top-16 inset-x-4 md:hidden rounded-[4px] border border-[var(--fm-line)] p-4 flex flex-col gap-2 z-50"
          style={{ background: 'var(--fm-surface-raised)' }}
        >
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, 'features')}
            className="fm-nav-link px-3 py-2 font-mono text-sm justify-start text-[var(--fm-text)]"
          >
            <span>Features</span>
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
            className="fm-nav-link px-3 py-2 font-mono text-sm justify-start text-[var(--fm-text)]"
          >
            <span>How it works</span>
          </a>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="fm-nav-link px-3 py-2 font-mono text-sm justify-start text-[var(--fm-text)]"
          >
            <span>Sign in</span>
          </Link>
        </div>
      )}
    </nav>
  )
}

/* ─── Hero section ──────────────────────────────────────────── */

const HEADLINE_TEXT = 'SEE HOW FAST YOUR TEAM SHIPS.'
const HEADLINE_DELAY_MS = 24 // ms between characters

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const afterRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = headlineRef.current
    const afterEl = afterRef.current
    const imgEl = imageRef.current
    if (!el || !afterEl || !imgEl) return

    // Respect reduced motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.querySelectorAll<HTMLElement>('[data-char]').forEach((s) => {
        s.style.opacity = '1'
      })
      afterEl.style.opacity = '1'
      imgEl.style.opacity = '1'
      imgEl.style.transform = 'translateY(0)'
      return
    }

    const chars = Array.from(el.querySelectorAll<HTMLElement>('[data-char]'))
    const totalMs = chars.length * HEADLINE_DELAY_MS

    const runReveal = () => {
      chars.forEach((span, i) => {
        gsap.to(span, {
          opacity: 1,
          duration: 0.01,
          delay: (i * HEADLINE_DELAY_MS) / 1000,
          ease: 'none',
        })
      })

      // After headline: fade in subtitle/buttons + image rises 8px
      gsap.fromTo(
        afterEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out', delay: totalMs / 1000 }
      )
      gsap.fromTo(
        imgEl,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: totalMs / 1000 + 0.1 }
      )
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runReveal)
    } else {
      runReveal()
    }
  }, [])

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    const offset = 80
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top,
      behavior: reduced ? 'instant' : 'smooth',
    })
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-start justify-center"
      style={{
        background: 'var(--fm-bg)',
        paddingTop: '120px',
        paddingLeft: 'max(24px, calc((100vw - 1120px) / 2))',
        paddingRight: 'max(24px, calc((100vw - 1120px) / 2))',
        paddingBottom: '80px',
      }}
    >
      {/* Headline: words never break mid-word, lines break only between words */}
      <h1
        ref={headlineRef}
        aria-label={HEADLINE_TEXT}
        className="font-mono font-bold leading-[1.05] uppercase tracking-tight"
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
          color: 'var(--fm-text)',
          maxWidth: '850px',
        }}
      >
        <TypingHeadline text={HEADLINE_TEXT} />
      </h1>

      {/* Subtitle, buttons, free label: no em dash in copy */}
      <div ref={afterRef} style={{ opacity: 0 }}>
        <p
          className="mt-6 max-w-[56ch] text-base leading-relaxed"
          style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
        >
          FlowMetrics measures deployment frequency, lead time for changes,
          change failure rate and time to restore, the four DORA metrics
          engineering teams use to understand delivery health.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/register" className="fm-btn-accent px-5 py-2.5 text-sm">
            <span>Continue with GitHub</span>
          </Link>
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, 'features')}
            className="fm-inline-link font-mono text-sm underline-offset-4"
          >
            See what it tracks
          </a>
        </div>

        <p
          className="mt-4 font-mono text-xs"
          style={{ color: 'var(--fm-text-muted)' }}
        >
          Free to use.
        </p>
      </div>

      {/* Hero dashboard image: 1px line border, no glow, no shadow */}
      <div
        ref={imageRef}
        className="mt-16 w-full"
        style={{ opacity: 0, maxWidth: '1120px' }}
      >
        <Image
          src="/screenshot-dashboard.png"
          alt="FlowMetrics dashboard showing connected repositories and deployment status"
          width={1456}
          height={816}
          priority
          className="w-full rounded-[4px]"
          style={{ border: '1px solid var(--fm-line)' }}
        />
      </div>
    </section>
  )
}
