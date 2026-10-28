'use client'

/**
 * AuthRightPanel.tsx
 *
 * Full-height right panel for the 50/50 split layout on auth pages (>=1024px).
 * Shared between /login and /register per DESIGN-BRIEF.md.
 *
 * Contents:
 *   - 56px FlowMetricsMascot with typed greeting:
 *     "Hi, I am flowmetrics-ai."
 *     "Connect a repository and ask me about its delivery metrics."
 *   - Cropped preview frame for the AI panel screenshot (1px border line).
 */

import FlowMetricsMascot from '@/components/ai/FlowMetricsMascot'

export default function AuthRightPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col p-12 lg:p-16"
      style={{
        background: 'var(--fm-surface)',
        borderLeft: '1px solid var(--fm-line)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mascot + greeting */}
      <div style={{ marginBottom: 32 }}>
        <FlowMetricsMascot
          size={56}
          state="greeting"
          greetingSentence="Connect a repository and ask me about its delivery metrics."
          showGreeting
          hideStatus
        />
      </div>

      {/* Real AI panel screenshot preview frame (cropped by right/bottom edges) */}
      <div
        style={{
          border: '1px solid var(--fm-line)',
          borderRadius: 4,
          overflow: 'hidden',
          flex: 1,
          background: 'var(--fm-surface-raised)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: 12,
            color: 'var(--fm-text-muted)',
            textAlign: 'center',
            padding: 24,
          }}
        >
          AI panel screenshot pending
        </p>
      </div>
    </div>
  )
}
