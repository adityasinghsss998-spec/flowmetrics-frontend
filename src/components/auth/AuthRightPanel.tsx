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

import Image from 'next/image'
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

      {/* Real AI panel screenshot neatly framed with 1px border and contained alignment */}
      <div
        className="w-full"
        style={{
          border: '1px solid var(--fm-line)',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'var(--fm-surface-raised)',
        }}
      >
        <Image
          src="/screenshot-ai-panel.png"
          alt="flowmetrics-ai answering a question about repository cycle time trend"
          width={1024}
          height={510}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="w-full h-auto object-contain"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  )
}
