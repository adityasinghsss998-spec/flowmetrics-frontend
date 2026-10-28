'use client'

/**
 * AskAiSection.tsx
 *
 * Landing page section: "Ask in plain language."
 * Placed between Product Panels and The Four Metrics.
 *
 * Contains:
 *   - 64px FlowMetricsMascot in 'ready' state
 *   - Section heading with typing reveal (16 ms/char, on 30% visibility)
 *   - Honest paragraph about what the AI can do
 *   - Real screenshot of the AI panel (if available)
 *
 * The section is only rendered if `screenshotSrc` is provided.
 * If no AI screenshot exists yet, omit the component from the page.
 */

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import FlowMetricsMascot from '@/components/ai/FlowMetricsMascot'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const HEADING_TEXT  = 'Ask in plain language.'
const CHAR_DELAY_MS = 16

interface AskAiSectionProps {
  /**
   * Absolute path to the real AI panel screenshot.
   * If this prop is absent or empty, the section renders
   * the mascot + paragraph but no image frame.
   */
  screenshotSrc?: string
}

export default function AskAiSection({ screenshotSrc }: AskAiSectionProps) {
  const sectionRef  = useRef<HTMLElement>(null)
  const headingRef  = useRef<HTMLHeadingElement>(null)
  const [visibleChars, setVisibleChars] = useState(0)
  const [triggered, setTriggered]       = useState(false)

  const words   = HEADING_TEXT.split(' ')
  const totalCh = HEADING_TEXT.length

  // ── Reduced motion: show everything immediately ───────────────
  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (reducedMotion) setVisibleChars(totalCh)
  }, [reducedMotion, totalCh])

  // ── Scroll trigger at 30% visibility ─────────────────────────
  useGSAP(
    () => {
      if (reducedMotion) return
      const el = sectionRef.current
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',   // fires when 30% of element is visible
        once: true,
        onEnter: () => setTriggered(true),
      })
    },
    { scope: sectionRef, dependencies: [] }
  )

  // ── Type out characters once triggered ───────────────────────
  useEffect(() => {
    if (!triggered || reducedMotion) return
    let i = 0
    const id = setInterval(() => {
      i++
      setVisibleChars(i)
      if (i >= totalCh) clearInterval(id)
    }, CHAR_DELAY_MS)
    return () => clearInterval(id)
  }, [triggered, reducedMotion, totalCh])

  // Track rendered characters per word for the animated heading
  function renderHeading() {
    let charsSoFar = 0
    return words.map((word, wi) => {
      const wordChars = word.split('')
      const el = (
        <span
          key={wi}
          className="inline-block whitespace-nowrap"
          style={{ whiteSpace: 'nowrap' }}
        >
          {wordChars.map((ch, ci) => {
            const idx = charsSoFar + ci
            const visible = idx < visibleChars
            return (
              <span
                key={ci}
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  opacity: visible || reducedMotion ? 1 : 0,
                }}
              >
                {ch}
              </span>
            )
          })}
          {/* space between words */}
          {wi < words.length - 1 && (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                opacity: charsSoFar + wordChars.length < visibleChars || reducedMotion ? 1 : 0,
              }}
            >
              {' '}
            </span>
          )}
        </span>
      )
      charsSoFar += wordChars.length + 1  // +1 for the space
      return el
    })
  }

  return (
    <section
      ref={sectionRef}
      id="ask-ai"
      aria-labelledby="ask-ai-heading"
      className="border-t border-[var(--fm-line)]"
      style={{ paddingTop: '120px', paddingBottom: '120px' }}
    >
      <div className="mx-auto max-w-[1120px] px-6">
        {/* Mascot + heading row */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10 mb-10">
          <div className="shrink-0">
            <FlowMetricsMascot size={64} state="ready" />
          </div>

          <div>
            <h2
              id="ask-ai-heading"
              ref={headingRef}
              aria-label={HEADING_TEXT}
              className="font-mono font-bold"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                lineHeight: 1.1,
                color: 'var(--fm-text)',
                marginBottom: '16px',
              }}
            >
              {renderHeading()}
            </h2>

            <p
              className="text-base leading-relaxed"
              style={{
                color: 'var(--fm-text-muted)',
                fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", -apple-system, sans-serif',
                maxWidth: '56ch',
              }}
            >
              Ask flowmetrics-ai about a repository. It reads your DORA metrics, cycle time,
              open pull requests and more, and tells you which data it used.
            </p>
          </div>
        </div>

        {/* AI panel screenshot — only if a real one is available */}
        {screenshotSrc && (
          <div
            className="w-full"
            style={{ maxWidth: '860px' }}
          >
            <Image
              src={screenshotSrc}
              alt="flowmetrics-ai answering a question about a repository's cycle time trend"
              width={1440}
              height={900}
              loading="lazy"
              className="w-full rounded-[4px]"
              style={{ border: '1px solid var(--fm-line)' }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
