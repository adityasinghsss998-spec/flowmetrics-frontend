'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ─── Panel data (real screenshots of populated delivery metrics) ─── */

const PANELS = [
  {
    src: '/screenshot-dora.png',
    alt: 'DORA metrics overview: deployment frequency, lead time, change failure rate and MTTR',
    caption: 'DORA metrics overview',
    startRotate: -6,
    startY: 0,
  },
  {
    src: '/screenshot-cycle-time.png',
    alt: 'Cycle time trend and PR size distribution',
    caption: 'Cycle time & PR size distribution',
    startRotate: 5,
    startY: 64,
  },
  {
    src: '/screenshot-contributors.png',
    alt: 'Contributor activity and review heatmap',
    caption: 'Contributor activity & review heatmap',
    startRotate: 7,
    startY: -32,
  },
  {
    src: '/screenshot-prs.png',
    alt: 'Open pull requests ranked by wait time',
    caption: 'Open pull requests',
    startRotate: -5,
    startY: 96,
  },
]

export default function PanelScene() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const slabRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[]
      const slab = slabRef.current
      if (!slab || panels.length < 4) return

      const isMobile = window.innerWidth < 768

      // Set panels to start positions (smaller rotation on mobile)
      panels.forEach((panel, i) => {
        gsap.set(panel, {
          rotate: isMobile ? (PANELS[i].startRotate > 0 ? 2 : -2) : PANELS[i].startRotate,
          y: isMobile ? PANELS[i].startY * 0.3 : PANELS[i].startY,
        })
      })

      // Background slab starts offset and rises by ~25%
      const sectionH = sectionRef.current?.offsetHeight ?? 800
      const slabTravel = sectionH * 0.25
      gsap.set(slab, { y: slabTravel })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'center center',
          scrub: 0.8,
        },
      })

      // All panels straighten to 0 degrees and align perfectly
      panels.forEach((panel) => {
        tl.to(
          panel,
          {
            rotate: 0,
            y: 0,
            ease: 'none',
            duration: 1,
          },
          0
        )
      })

      // Slab rises smoothly with the panels
      tl.to(slab, { y: 0, ease: 'none', duration: 1 }, 0)
    },
    { scope: wrapRef, dependencies: [] }
  )

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-label="Product screenshots"
      className="relative"
      style={{
        background: 'var(--fm-bg)',
        paddingTop: '120px',
        paddingBottom: '120px',
        overflow: 'hidden',
      }}
    >
      <div className="mx-auto max-w-[1120px] px-6">
        {/* Section label & heading */}
        <p
          className="font-mono text-xs mb-4"
          style={{ color: 'var(--fm-text-muted)' }}
        >
          The product
        </p>
        <h2
          className="font-mono font-bold mb-16"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            color: 'var(--fm-text)',
            lineHeight: 1.1,
          }}
        >
          Four views into your delivery pipeline.
        </h2>

        {/* Scene container: fills the exact 1120px content column */}
        <div ref={wrapRef} className="relative w-full">
          {/* Background slab: constrained strictly to the content column */}
          <div
            ref={slabRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-[4px]"
            style={{
              background: 'var(--fm-surface)',
              top: '-24px',
              bottom: '-24px',
              left: '-12px',
              right: '-12px',
              zIndex: 0,
              willChange: 'transform',
            }}
          />

          {/* Panel grid: 2 columns on desktop, 1 on mobile, filling content column */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {PANELS.map((panel, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  ref={(el) => {
                    panelRefs.current[i] = el
                  }}
                  style={{
                    willChange: 'transform',
                    transformOrigin: 'center center',
                  }}
                >
                  <Image
                    src={panel.src}
                    alt={panel.alt}
                    width={728}
                    height={409}
                    loading="lazy"
                    className="w-full rounded-[4px] block"
                    style={{ border: '1px solid var(--fm-line)' }}
                  />
                </div>
                <p
                  className="font-mono text-xs"
                  style={{ color: 'var(--fm-text-muted)' }}
                >
                  {panel.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
