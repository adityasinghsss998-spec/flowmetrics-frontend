'use client'

/**
 * AiChatPanel.tsx
 *
 * "Ask about this repository" panel - sits below the metric summary on the
 * repository detail page and is backed by the ai-service through the API
 * gateway. The component is purely additive: if the ai-service is down the
 * rest of the dashboard keeps working.
 *
 * Design: plain transcript layout (no chat bubbles). Follows the tokens and
 * hover-wipe rules in DESIGN-BRIEF.md.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import {
  startAiChat,
  pollAiRun,
  fetchHitlPending,
  submitHitlDecision,
} from '@/lib/ai-api'
import type {
  AiTranscriptEntry,
  AiHitlPendingItem,
} from '@/types/api'

// ---------------------------------------------------------------------------
// Tool name -> friendly label map
// ---------------------------------------------------------------------------

const TOOL_FRIENDLY: Record<string, string> = {
  get_dora_metrics: 'DORA metrics',
  get_cycle_time_trend: 'Cycle time trend',
  get_contributor_stats: 'Contributors',
  get_review_heatmap: 'Review activity',
  get_open_prs: 'Open pull requests',
  get_deployment_history: 'Deployment history',
  get_pr_size_analysis: 'Pull request sizes',
  get_contributor_trend: 'Contributor trend',
  search_context: 'Pull request and commit search',
}

function friendlyTool(name: string): string {
  return TOOL_FRIENDLY[name] ?? name
}

// ---------------------------------------------------------------------------
// Suggested questions
// ---------------------------------------------------------------------------

const SUGGESTED = [
  'How is our cycle time trending?',
  'Which pull requests have been waiting the longest?',
  'Which metric needs the most attention?',
]

// ---------------------------------------------------------------------------
// Polling config
// ---------------------------------------------------------------------------

const POLL_FAST_MS = 2_000
const POLL_SLOW_MS = 4_000
const POLL_FAST_DURATION_MS = 20_000
const POLL_MAX_MS = 3 * 60 * 1_000

// ---------------------------------------------------------------------------
// Markdown renderer -- no raw HTML, styled with design tokens
// ---------------------------------------------------------------------------

const mdComponents: Components = {
  h1: ({ children }) => (
    <h3 style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 15, fontWeight: 600, color: 'var(--fm-text)', marginBottom: 8, marginTop: 16 }}>{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 14, fontWeight: 600, color: 'var(--fm-text)', marginBottom: 6, marginTop: 14 }}>{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, fontWeight: 600, color: 'var(--fm-text)', marginBottom: 4, marginTop: 12 }}>{children}</h5>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, lineHeight: 1.65, color: 'var(--fm-text)', marginBottom: 8 }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 20, marginBottom: 8, fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, color: 'var(--fm-text)', lineHeight: 1.65 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: 20, marginBottom: 8, fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, color: 'var(--fm-text)', lineHeight: 1.65 }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: 'var(--fm-text)' }}>{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  code: ({ className, children, ...rest }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <pre style={{ background: 'var(--fm-surface)', borderRadius: 4, padding: '10px 14px', overflowX: 'auto', marginBottom: 8 }}>
          <code style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text)' }} {...rest}>{children}</code>
        </pre>
      )
    }
    return (
      <code style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, background: 'var(--fm-surface)', borderRadius: 2, padding: '1px 5px', color: 'var(--fm-text)' }} {...rest}>{children}</code>
    )
  },
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fm-accent)', textDecoration: 'underline' }}>{children}</a>
  ),
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AnswerSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '95%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '65%' }} />
    </div>
  )
}

function DataUsedToggle({ tools }: { tools: string[] }) {
  const [open, setOpen] = useState(false)
  const unique = Array.from(new Set(tools))
  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11,
          color: 'var(--fm-text-muted)', textDecoration: 'underline', textUnderlineOffset: 3,
        }}
        aria-expanded={open}
      >
        Data used ({unique.length})
      </button>
      {open && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
          {unique.map((t) => (
            <li key={t} style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
              {friendlyTool(t)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface HitlBlockProps {
  runId: string
  proposedAction: { type: string; reasoning: string }
  finalAnswer?: string
  resolved?: boolean
  onDecision: (runId: string, approved: boolean, reason: string) => void
  deciding: boolean
  decisionError?: string
}

function HitlBlock({ runId, proposedAction, finalAnswer, resolved, onDecision, deciding, decisionError }: HitlBlockProps) {
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [reason, setReason] = useState('')

  if (resolved && finalAnswer) {
    return (
      <div>
        <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 13, color: 'var(--fm-text-muted)', marginBottom: 6 }}>
          Decision recorded. Result:
        </p>
        <ReactMarkdown components={mdComponents}>{finalAnswer}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--fm-line)', borderRadius: 4, padding: '14px 16px', background: 'var(--fm-surface)' }}>
      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)', marginBottom: 4 }}>Proposed action</p>
      <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, color: 'var(--fm-text)', marginBottom: 8 }}>{proposedAction.type}</p>
      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)', marginBottom: 4 }}>Reasoning</p>
      <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, color: 'var(--fm-text)', marginBottom: 12 }}>{proposedAction.reasoning}</p>

      {showRejectReason && (
        <div style={{ marginBottom: 10 }}>
          <label htmlFor={`reject-reason-${runId}`} style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11, color: 'var(--fm-text-muted)', display: 'block', marginBottom: 4 }}>
            Reason (optional)
          </label>
          <textarea
            id={`reject-reason-${runId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            style={{ width: '100%', background: 'var(--fm-bg)', border: '1px solid var(--fm-line)', borderRadius: 4, padding: '6px 10px', color: 'var(--fm-text)', fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 13, resize: 'vertical', outline: 'none' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" id={`hitl-approve-${runId}`} className="fm-btn-accent" style={{ fontSize: 13, padding: '5px 14px' }} disabled={deciding} onClick={() => onDecision(runId, true, '')}>
          <span>Approve</span>
        </button>
        <button type="button" id={`hitl-reject-${runId}`} className="fm-btn-quiet" style={{ fontSize: 13, padding: '5px 14px' }} disabled={deciding}
          onClick={() => { if (!showRejectReason) { setShowRejectReason(true) } else { onDecision(runId, false, reason) } }}>
          <span>{showRejectReason ? 'Confirm reject' : 'Reject'}</span>
        </button>
        {deciding && <span style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)' }}>Recording decision...</span>}
      </div>

      {decisionError && (
        <p style={{ marginTop: 8, fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 13, color: 'var(--fm-status-poor)' }}>{decisionError}</p>
      )}

      <p style={{ marginTop: 12, fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
        Approving records your decision. Automatic actions are not enabled yet.
      </p>
    </div>
  )
}

interface TranscriptItemProps {
  entry: AiTranscriptEntry
  onDecision: (runId: string, approved: boolean, reason: string) => void
  decidingRunId: string | null
  decisionErrors: Record<string, string>
}

function TranscriptItem({ entry, onDecision, decidingRunId, decisionErrors }: TranscriptItemProps) {
  const hrStyle: React.CSSProperties = { border: 'none', borderTop: '1px solid var(--fm-line)', margin: '0 0 16px' }

  if (entry.kind === 'qa') {
    return (
      <div style={{ marginBottom: 24 }}>
        <hr style={hrStyle} />
        <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, color: 'var(--fm-text-muted)', marginBottom: 10 }}>{entry.question}</p>
        <div><ReactMarkdown components={mdComponents}>{entry.answer}</ReactMarkdown></div>
        {entry.toolsCalled.length > 0 && <DataUsedToggle tools={entry.toolsCalled} />}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <hr style={hrStyle} />
      <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, color: 'var(--fm-text-muted)', marginBottom: 10 }}>Approval request</p>
      <HitlBlock
        runId={entry.runId}
        proposedAction={entry.proposedAction}
        finalAnswer={entry.finalAnswer}
        resolved={entry.resolved}
        onDecision={onDecision}
        deciding={decidingRunId === entry.runId}
        decisionError={decisionErrors[entry.runId]}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

type PanelStatus =
  | { kind: 'idle' }
  | { kind: 'waiting'; runId: string; elapsed: number; slow: boolean }
  | { kind: 'error'; message: string; question: string }
  | { kind: 'unavailable' }

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AiChatPanelProps {
  repoId: number
  orgId: number
}

export default function AiChatPanel({ repoId, orgId }: AiChatPanelProps) {
  const [question, setQuestion] = useState('')
  const [transcript, setTranscript] = useState<AiTranscriptEntry[]>([])
  const [panelStatus, setPanelStatus] = useState<PanelStatus>({ kind: 'idle' })
  const [charCount, setCharCount] = useState(0)

  const [pendingHitl, setPendingHitl] = useState<AiHitlPendingItem[]>([])
  const [pendingExpanded, setPendingExpanded] = useState(false)
  const [decidingRunId, setDecidingRunId] = useState<string | null>(null)
  const [decisionErrors, setDecisionErrors] = useState<Record<string, string>>({})

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)
  const pollStartRef = useRef<number>(0)
  const hitlIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef<HTMLSpanElement | null>(null)
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)
  // Hold latest question in a ref so the schedulePoll closure is stable
  const questionRef = useRef(question)
  useEffect(() => { questionRef.current = question }, [question])

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null }
  }, [])

  const stopElapsedCounter = useCallback(() => {
    if (elapsedIntervalRef.current !== null) { clearInterval(elapsedIntervalRef.current); elapsedIntervalRef.current = null }
  }, [])

  const startElapsedCounter = useCallback(() => {
    stopElapsedCounter()
    let secs = 0
    elapsedIntervalRef.current = setInterval(() => {
      secs++
      if (secondsRef.current) secondsRef.current.textContent = String(secs)
    }, 1_000)
  }, [stopElapsedCounter])

  const loadPending = useCallback(async () => {
    if (unmountedRef.current) return
    try {
      const res = await fetchHitlPending(repoId)
      if (!unmountedRef.current) setPendingHitl(res.pending)
    } catch { /* silent */ }
  }, [repoId])

  useEffect(() => {
    unmountedRef.current = false
    loadPending()
    hitlIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') loadPending()
    }, 30_000)
    return () => {
      unmountedRef.current = true
      clearPollTimer()
      stopElapsedCounter()
      if (hitlIntervalRef.current !== null) clearInterval(hitlIntervalRef.current)
    }
  }, [repoId, loadPending, clearPollTimer, stopElapsedCounter])

  const prevRepoRef = useRef(repoId)
  useEffect(() => {
    if (prevRepoRef.current !== repoId) {
      prevRepoRef.current = repoId
      setTranscript([])
      setPanelStatus({ kind: 'idle' })
      setQuestion('')
      setCharCount(0)
    }
  }, [repoId])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [transcript])

  // Stable poll scheduler - reads question via ref
  const schedulePoll = useCallback(
    (runId: string) => {
      const elapsed = Date.now() - pollStartRef.current
      if (elapsed >= POLL_MAX_MS) {
        if (!unmountedRef.current) {
          stopElapsedCounter()
          setPanelStatus({ kind: 'error', message: 'This is taking longer than expected. You can ask again.', question: questionRef.current })
        }
        return
      }
      const delay = elapsed < POLL_FAST_DURATION_MS ? POLL_FAST_MS : POLL_SLOW_MS
      pollTimerRef.current = setTimeout(async () => {
        if (unmountedRef.current) return
        let res
        try {
          res = await pollAiRun(runId)
        } catch (err: unknown) {
          if (unmountedRef.current) return
          const axiosErr = err as { response?: { status?: number; data?: { fallback?: boolean } } }
          if (!axiosErr.response || (axiosErr.response.status === 503 && axiosErr.response.data?.fallback)) {
            setPanelStatus({ kind: 'unavailable' })
          } else {
            setPanelStatus({ kind: 'error', message: 'Failed to check the status of your question. Please try again.', question: questionRef.current })
          }
          stopElapsedCounter()
          return
        }
        if (unmountedRef.current) return
        if (res.status === 'running') {
          const el2 = Date.now() - pollStartRef.current
          setPanelStatus({ kind: 'waiting', runId, elapsed: el2, slow: el2 >= 30_000 })
          schedulePoll(runId)
        } else if (res.status === 'complete') {
          stopElapsedCounter()
          const q = questionRef.current
          setTranscript((prev) => [...prev, { kind: 'qa', question: q, answer: res.answer, toolsCalled: res.toolsCalled }])
          setPanelStatus({ kind: 'idle' })
          setQuestion('')
          setCharCount(0)
        } else if (res.status === 'pending_approval') {
          stopElapsedCounter()
          setTranscript((prev) => [...prev, { kind: 'hitl', runId: res.runId, proposedAction: res.proposedAction }])
          setPanelStatus({ kind: 'idle' })
          setQuestion('')
          setCharCount(0)
          loadPending()
        } else if (res.status === 'failed') {
          stopElapsedCounter()
          setPanelStatus({ kind: 'error', message: res.message, question: questionRef.current })
        } else {
          stopElapsedCounter()
          setPanelStatus({ kind: 'error', message: 'The run could not be found. Please try again.', question: questionRef.current })
        }
      }, delay)
    },
    [loadPending, stopElapsedCounter]
  )

  const submitQuestion = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed || panelStatus.kind === 'waiting') return
    clearPollTimer()
    pollStartRef.current = Date.now()
    setPanelStatus({ kind: 'waiting', runId: '', elapsed: 0, slow: false })
    startElapsedCounter()

    try {
      const res = await startAiChat({ repoId, orgId, question: trimmed })
      if (res.answer) {
        stopElapsedCounter()
        setTranscript((prev) => [...prev, { kind: 'qa', question: trimmed, answer: res.answer!, toolsCalled: res.toolsCalled ?? [] }])
        setPanelStatus({ kind: 'idle' })
        setQuestion('')
        setCharCount(0)
        return
      }
      if (res.status === 'pending_approval' && res.proposedAction) {
        stopElapsedCounter()
        setTranscript((prev) => [...prev, { kind: 'hitl', runId: res.runId, proposedAction: res.proposedAction! }])
        setPanelStatus({ kind: 'idle' })
        setQuestion('')
        setCharCount(0)
        loadPending()
        return
      }
      const runId = res.runId
      const elapsed = Date.now() - pollStartRef.current
      setPanelStatus({ kind: 'waiting', runId, elapsed, slow: elapsed >= 30_000 })
      schedulePoll(runId)
    } catch (err: unknown) {
      stopElapsedCounter()
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string; fallback?: boolean } } }
      const st = axiosErr.response?.status
      const d = axiosErr.response?.data
      if (!axiosErr.response || (st === 503 && d?.fallback)) { setPanelStatus({ kind: 'unavailable' }); return }
      if (st === 429) { setPanelStatus({ kind: 'error', message: d?.detail ?? 'Too many requests. Please wait.', question: trimmed }); return }
      if (st === 403 || st === 404) { setPanelStatus({ kind: 'error', message: 'You do not have access to this repository.', question: trimmed }); return }
      setPanelStatus({ kind: 'error', message: 'Failed to start the question. Please try again.', question: trimmed })
    }
  }, [panelStatus.kind, repoId, orgId, clearPollTimer, startElapsedCounter, stopElapsedCounter, schedulePoll, loadPending])

  const cancel = useCallback(() => {
    // Stops polling and clears the waiting state.
    // This does NOT stop work on the server -- the run continues server-side.
    clearPollTimer()
    stopElapsedCounter()
    setPanelStatus({ kind: 'idle' })
  }, [clearPollTimer, stopElapsedCounter])

  const handleDecision = useCallback(async (runId: string, approved: boolean, reason: string) => {
    setDecidingRunId(runId)
    setDecisionErrors((e) => ({ ...e, [runId]: '' }))
    try {
      const res = await submitHitlDecision({ runId, approved, reason })
      setTranscript((prev) => prev.map((e) =>
        e.kind === 'hitl' && e.runId === runId ? { ...e, finalAnswer: res.finalAnswer, resolved: true } : e
      ))
      loadPending()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      const st = axiosErr.response?.status
      if (st === 403) {
        setDecisionErrors((e) => ({ ...e, [runId]: 'Only an owner or admin of this organization can decide this request.' }))
      } else if (st === 409) {
        setDecisionErrors((e) => ({ ...e, [runId]: 'Someone already decided this request.' }))
        loadPending()
      } else {
        setDecisionErrors((e) => ({ ...e, [runId]: 'Failed to record the decision. Please try again.' }))
      }
    } finally {
      setDecidingRunId(null)
    }
  }, [loadPending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuestion(question) }
  }, [question, submitQuestion])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 1000)
    setQuestion(val)
    setCharCount(val.length)
  }, [])

  const isWaiting = panelStatus.kind === 'waiting'
  const isUnavailable = panelStatus.kind === 'unavailable'

  // --------------------------------------------------------------------------
  // Render -- unavailable state
  // --------------------------------------------------------------------------
  if (isUnavailable) {
    return (
      <section aria-labelledby="ai-panel-heading" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--fm-line)' }}>
        <h2 id="ai-panel-heading" style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 15, fontWeight: 600, color: 'var(--fm-text)', marginBottom: 16 }}>
          Ask about this repository
        </h2>
        <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, color: 'var(--fm-text-muted)' }}>
          The AI analyst is unavailable right now. The rest of the dashboard still works.
        </p>
      </section>
    )
  }

  // --------------------------------------------------------------------------
  // Render -- normal
  // --------------------------------------------------------------------------
  return (
    <section aria-labelledby="ai-panel-heading" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--fm-line)' }}>
      <h2 id="ai-panel-heading" style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 15, fontWeight: 600, color: 'var(--fm-text)', marginBottom: 20 }}>
        Ask about this repository
      </h2>

      {/* Pending HITL requests banner */}
      {pendingHitl.length > 0 && (
        <div style={{ border: '1px solid var(--fm-line)', borderRadius: 4, padding: '10px 14px', marginBottom: 20, background: 'var(--fm-surface)' }}>
          <button type="button" onClick={() => setPendingExpanded((o) => !o)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)' }}
            aria-expanded={pendingExpanded} id="pending-hitl-toggle">
            {pendingHitl.length} {pendingHitl.length === 1 ? 'request' : 'requests'} waiting for approval
          </button>
          {pendingExpanded && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingHitl.map((item) => {
                const inTranscript = transcript.some((e) => e.kind === 'hitl' && e.runId === item.runId)
                if (inTranscript) return null
                return (
                  <HitlBlock key={item.runId} runId={item.runId} proposedAction={item.proposedAction}
                    onDecision={handleDecision} deciding={decidingRunId === item.runId} decisionError={decisionErrors[item.runId]} />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Transcript */}
      <div id="ai-panel-transcript" aria-live="polite" aria-label="Conversation" style={{ marginBottom: transcript.length > 0 ? 24 : 0 }}>
        {transcript.map((entry, i) => (
          <TranscriptItem key={i} entry={entry} onDecision={handleDecision} decidingRunId={decidingRunId} decisionErrors={decisionErrors} />
        ))}

        {/* Waiting state */}
        {isWaiting && (
          <div style={{ marginBottom: 24 }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--fm-line)', margin: '0 0 16px' }} />
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, color: 'var(--fm-text-muted)', marginBottom: 12 }}>{question}</p>
            <AnswerSkeleton />
            <div style={{ marginTop: 12 }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 13, color: 'var(--fm-text-muted)' }}>Analyzing repository data </span>
              <span ref={secondsRef} style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, color: 'var(--fm-text-muted)' }}>0</span>
              <span style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 13, color: 'var(--fm-text-muted)' }}>s</span>
              {panelStatus.kind === 'waiting' && panelStatus.slow && (
                <p style={{ marginTop: 6, fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
                  This can take a minute when the AI service is busy.
                </p>
              )}
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={cancel}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Error */}
      {panelStatus.kind === 'error' && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 13, color: 'var(--fm-status-poor)', marginBottom: 4 }}>{panelStatus.message}</p>
          <button type="button" onClick={() => submitQuestion(panelStatus.question)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Try again
          </button>
        </div>
      )}

      {/* Input */}
      <div>
        <label htmlFor="ai-question-input" style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11, color: 'var(--fm-text-muted)', display: 'block', marginBottom: 6 }}>
          Your question
        </label>
        <textarea id="ai-question-input" value={question} onChange={handleChange} onKeyDown={handleKeyDown}
          disabled={isWaiting} rows={3} maxLength={1000} placeholder="Ask anything about this repository..."
          style={{ width: '100%', background: 'var(--fm-surface)', border: '1px solid var(--fm-line)', borderRadius: 4, padding: '10px 12px', color: isWaiting ? 'var(--fm-text-muted)' : 'var(--fm-text)', fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.5, transition: 'border-color 150ms ease-out' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fm-accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--fm-line)' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11, color: charCount >= 900 ? 'var(--fm-status-poor)' : 'var(--fm-text-muted)' }} aria-live="polite">
            {charCount}/1000
          </span>
          <button type="button" id="ai-ask-button" className="fm-btn-accent" style={{ fontSize: 13, padding: '5px 18px' }}
            disabled={isWaiting || charCount === 0} onClick={() => submitQuestion(question)}>
            <span>Ask</span>
          </button>
        </div>
        <p style={{ marginTop: 8, fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
          Each question is answered on its own. It does not remember earlier questions.
        </p>
      </div>

      {/* Suggested questions */}
      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SUGGESTED.map((s) => (
          <button key={s} type="button" disabled={isWaiting}
            onClick={() => { setQuestion(s); setCharCount(s.length); submitQuestion(s) }}
            style={{ background: 'none', border: '1px solid var(--fm-line)', borderRadius: 4, padding: '5px 10px', cursor: isWaiting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)', opacity: isWaiting ? 0.5 : 1 }}>
            {s}
          </button>
        ))}
      </div>
    </section>
  )
}
