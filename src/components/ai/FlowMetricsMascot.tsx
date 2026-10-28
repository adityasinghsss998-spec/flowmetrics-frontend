'use client'

/**
 * FlowMetricsMascot.tsx
 *
 * The "flowmetrics-ai" mascot – a hand-drawn flat SVG face.
 * Drawing rules from DESIGN-BRIEF.md:
 *   - Rounded-square head: filled surface-raised (#1E211C), 1px border text-muted (#A0A498)
 *   - Two round eyes: off-white text (#ECEEE6), dark pupils (#0B0C0A)
 *   - Flat mouth line (curves for ready/greeting, flat for thinking/unavailable)
 *   - Antenna with a single accent-coloured dot (#FF5C3A) — the ONLY accent on the mascot
 *   - NO gradients, glow, shadow, blur, or extra colours
 *
 * Motion (honoured unless prefers-reduced-motion):
 *   - Pupils follow the pointer (one RAF-throttled window listener, IntersectionObserver
 *     gates activation, cleaned up on unmount)
 *   - Random blink (120 ms, every 4-7 s) — never while thinking
 *   - Thinking state: slow left-right sinusoidal sweep (1.6 s / cycle)
 *   - Typing state: pupils look down toward question box
 *   - Touch devices: pupils rest downward, no pointer tracking
 *   - Greeting text types out next to the face (14 ms/char) via typing reveal
 *
 * Accessibility:
 *   - SVG is aria-hidden; name + live status sit beside it in real text
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react'

/* ─── Types ────────────────────────────────────────────────────── */

export type MascotState = 'greeting' | 'ready' | 'typing' | 'thinking' | 'unavailable'

export interface MascotProps {
  /** Pixel size – 56 for auth, 64 for landing, 72 for AI panel */
  size?: number
  state?: MascotState
  /**
   * Shown in the live status text next to the mascot.
   * Defaults per state: Ready | Reading repository data | Ready | Answer ready | Unavailable
   */
  statusText?: string
  /** Repo identifier displayed in the greeting ("Ask me anything about {repoName}") */
  repoName?: string
  /** Custom sentence for greeting line 2 (e.g. for auth page) */
  greetingSentence?: string
  /** Whether to show the typed greeting text beside the face */
  showGreeting?: boolean
  /** Omit the live status text line (e.g. on auth pages) */
  hideStatus?: boolean
  className?: string
}

/* ─── Constants ────────────────────────────────────────────────── */

// Pupil max travel as a fraction of the eye radius
const PUPIL_TRAVEL = 0.45
// Head corner radius at 72px — scales proportionally
const HEAD_RADIUS_BASE = 6
const BASE_SIZE = 72

const DEFAULT_STATUS: Record<MascotState, string> = {
  greeting:    'Ready',
  ready:       'Ready',
  typing:      'Ready',
  thinking:    'Reading repository data',
  unavailable: 'Unavailable',
}

/* ─── Typing-reveal hook ───────────────────────────────────────── */

function useTypingReveal(text: string, charMs: number, enabled: boolean) {
  const [visible, setVisible] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) { setVisible(text); return }
    setVisible('')
    let i = 0
    function step() {
      i++
      setVisible(text.slice(0, i))
      if (i < text.length) timerRef.current = setTimeout(step, charMs)
    }
    timerRef.current = setTimeout(step, charMs)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [text, charMs, enabled])

  return visible
}

/* ─── Component ────────────────────────────────────────────────── */

export default function FlowMetricsMascot({
  size = 72,
  state = 'ready',
  statusText,
  repoName,
  greetingSentence,
  showGreeting = false,
  hideStatus = false,
  className,
}: MascotProps) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const faceRef  = useRef<SVGElement | null>(null)

  // Pupil offset state [x, y] in SVG-viewBox units (0..100 scale)
  const [pupilOffset, setPupilOffset] = useState<[number, number]>([0, 0])
  // Blink state
  const [blinking, setBlinking] = useState(false)
  // Visible (IntersectionObserver)
  const [onScreen, setOnScreen] = useState(false)

  const reducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  const isTouchDevice = typeof window !== 'undefined'
    ? !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false

  // ── IntersectionObserver ──────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Pointer tracking ──────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || isTouchDevice || !onScreen || state === 'thinking') return

    let rafId = 0
    let latestX = 0
    let latestY = 0

    function onPointerMove(e: PointerEvent) {
      latestX = e.clientX
      latestY = e.clientY
    }

    function update() {
      const el = svgRef.current
      if (!el) { rafId = requestAnimationFrame(update); return }
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      // Vector from face centre to pointer, normalised to ±1
      const dx = (latestX - cx) / Math.max(rect.width, 1)
      const dy = (latestY - cy) / Math.max(rect.height, 1)
      // Clamp to unit circle
      const len = Math.sqrt(dx * dx + dy * dy)
      const scale = Math.min(1, 1 / (len || 1))
      setPupilOffset([dx * scale * PUPIL_TRAVEL * 14, dy * scale * PUPIL_TRAVEL * 14])
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    rafId = requestAnimationFrame(update)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(rafId)
    }
  }, [reducedMotion, isTouchDevice, onScreen, state])

  // ── Typing-state pupils look down ────────────────────────────
  useEffect(() => {
    if (reducedMotion || isTouchDevice || state === 'typing') {
      setPupilOffset([0, 6])
    }
    if (!reducedMotion && !isTouchDevice && state !== 'typing' && state !== 'thinking') {
      setPupilOffset([0, 0])
    }
  }, [state, reducedMotion, isTouchDevice])

  // ── Thinking sweep ────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || state !== 'thinking') return
    const SWEEP_HALF_MS = 800
    let start = performance.now()
    let rafId = 0
    function frame(now: number) {
      const t = ((now - start) % (SWEEP_HALF_MS * 2)) / SWEEP_HALF_MS - 1  // -1 → +1
      setPupilOffset([t * 6, 0])
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafId)
  }, [state, reducedMotion])

  // ── Blink ─────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || state === 'thinking') return
    let timeoutId: ReturnType<typeof setTimeout>
    function scheduleBlink() {
      const delay = 4000 + Math.random() * 3000
      timeoutId = setTimeout(() => {
        setBlinking(true)
        setTimeout(() => { setBlinking(false); scheduleBlink() }, 120)
      }, delay)
    }
    scheduleBlink()
    return () => clearTimeout(timeoutId)
  }, [state, reducedMotion])

  // ── Greeting text ─────────────────────────────────────────────
  const greetingLine1 = 'Hi, I am flowmetrics-ai.'
  const greetingLine2 = greetingSentence ?? (repoName ? `Ask me anything about ${repoName}.` : '')
  const hasGreeting = showGreeting || Boolean(greetingSentence)
  const showReveal = hasGreeting && !reducedMotion
  const g1 = useTypingReveal(greetingLine1, 14, showReveal)
  const g2 = useTypingReveal(greetingLine2, 14, showReveal && g1.length === greetingLine1.length)

  // ── Derived face geometry (all in a 100×100 viewBox) ─────────
  // Head: rounded square
  const headR  = HEAD_RADIUS_BASE * (100 / BASE_SIZE)  // scaled corner radius
  // Eyes
  const eyeY   = 42
  const eyeR   = 10    // eye outer radius
  const pupilR = 5.5   // pupil radius
  const leftEyeX  = 33
  const rightEyeX = 67
  // Eyelids (for unavailable)
  const lidClose = state === 'unavailable'
  const lidY = eyeY - eyeR * (lidClose ? 0.1 : 1.05)
  // Mouth
  const mouthY = 68
  const smiling = state === 'greeting' || state === 'ready'
  const mouthPath = smiling
    ? `M 35 ${mouthY} Q 50 ${mouthY + 7} 65 ${mouthY}`
    : `M 35 ${mouthY} L 65 ${mouthY}`
  // Antenna
  const antennaX = 64
  const antennaTopY = 4
  const antennaMidY = 14
  // Pupil offsets (clamp inside eye)
  const maxPupilTravel = eyeR - pupilR - 1
  const clamp = (v: number) => Math.max(-maxPupilTravel, Math.min(maxPupilTravel, v))
  const px = clamp(pupilOffset[0])
  const py = clamp(pupilOffset[1])

  // ── Status label ─────────────────────────────────────────────
  const status = statusText ?? DEFAULT_STATUS[state]

  const roundedRect = `
    M ${headR},0
    H ${100 - headR}
    Q 100,0 100,${headR}
    V ${100 - headR}
    Q 100,100 ${100 - headR},100
    H ${headR}
    Q 0,100 0,${100 - headR}
    V ${headR}
    Q 0,0 ${headR},0 Z
  `

  return (
    <div className={`inline-flex items-start gap-3 ${className ?? ''}`}>
      {/* Face: aria-hidden — all real info is in the sibling text */}
      <svg
        ref={svgRef}
        aria-hidden="true"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Head */}
        <path
          d={roundedRect}
          fill="#1E211C"
          stroke="#A0A498"
          strokeWidth={100 / size * 1.2}
        />

        {/* Antenna stem */}
        <line
          x1={antennaX} y1={antennaMidY}
          x2={antennaX} y2={antennaTopY + 3}
          stroke="#A0A498"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Antenna dot — the ONLY accent on the mascot */}
        <circle cx={antennaX} cy={antennaTopY} r={3.5} fill="#FF5C3A" />

        {/* Left eye */}
        <circle cx={leftEyeX} cy={eyeY} r={eyeR} fill="#ECEEE6" />
        {/* Left eyelid (unavailable: half-closed rect over top half) */}
        {lidClose && (
          <rect
            x={leftEyeX - eyeR}
            y={lidY - eyeR}
            width={eyeR * 2}
            height={eyeR}
            fill="#1E211C"
          />
        )}
        {/* Left pupil */}
        {!blinking ? (
          <circle
            cx={leftEyeX + px}
            cy={eyeY + py}
            r={pupilR}
            fill="#0B0C0A"
          />
        ) : (
          /* Blink: replace pupils with a thin line */
          <line
            x1={leftEyeX - eyeR + 1} y1={eyeY}
            x2={leftEyeX + eyeR - 1} y2={eyeY}
            stroke="#0B0C0A"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {/* Right eye */}
        <circle cx={rightEyeX} cy={eyeY} r={eyeR} fill="#ECEEE6" />
        {lidClose && (
          <rect
            x={rightEyeX - eyeR}
            y={lidY - eyeR}
            width={eyeR * 2}
            height={eyeR}
            fill="#1E211C"
          />
        )}
        {/* Right pupil */}
        {!blinking ? (
          <circle
            cx={rightEyeX + px}
            cy={eyeY + py}
            r={pupilR}
            fill="#0B0C0A"
          />
        ) : (
          <line
            x1={rightEyeX - eyeR + 1} y1={eyeY}
            x2={rightEyeX + eyeR - 1} y2={eyeY}
            stroke="#0B0C0A"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {/* Mouth */}
        <path
          d={mouthPath}
          fill="none"
          stroke="#A0A498"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* Real accessible text (not aria-hidden) */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
            fontSize: Math.round(size * 0.195),
            fontWeight: 600,
            color: 'var(--fm-text)',
            lineHeight: 1.2,
          }}
        >
          flowmetrics-ai
        </span>
        {!hideStatus && (
          <span
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
              fontSize: Math.round(size * 0.155),
              color: 'var(--fm-text-muted)',
              lineHeight: 1.3,
            }}
          >
            {status}
          </span>
        )}

        {/* Greeting typed text */}
        {hasGreeting && (
          <div
            style={{
              marginTop: 4,
              fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", -apple-system, sans-serif',
              fontSize: Math.round(size * 0.22),
              color: 'var(--fm-text-muted)',
              lineHeight: 1.5,
              maxWidth: '36ch',
            }}
            aria-live="polite"
          >
            {reducedMotion ? (
              <>
                <p style={{ margin: 0 }}>{greetingLine1}</p>
                {greetingLine2 && <p style={{ margin: 0 }}>{greetingLine2}</p>}
              </>
            ) : (
              <>
                {g1 && <p style={{ margin: 0 }}>{g1}</p>}
                {g2 && <p style={{ margin: 0 }}>{g2}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
