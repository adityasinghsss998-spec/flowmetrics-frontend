'use client'

import { Code } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GithubActionsSetupProps {
  onManualRecord: () => void
  repoId: number
}

export default function GithubActionsSetup({ onManualRecord, repoId }: GithubActionsSetupProps) {
  const codeSnippet = `- name: Record deployment in FlowMetrics
  if: always()
  uses: actions/github-script@v7
  with:
    script: |
      const status = '\${{ job.status }}' === 'success' ? 'success' : 'failure'
      await fetch('http://your-github-service-url/api/v1/webhooks/github-actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_run'
        },
        body: JSON.stringify({
          workflow_run: {
            head_sha: '\${{ github.sha }}',
            head_branch: '\${{ github.ref_name }}',
            run_started_at: '\${{ github.event.workflow_run.run_started_at }}',
            updated_at: new Date().toISOString(),
            conclusion: status,
            triggering_actor: { login: '\${{ github.actor }}' }
          },
          repository: { id: ${repoId} }
        })
      })`

  return (
    <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-6 sm:p-8 text-left mt-6">
      <h3 className="font-mono text-base font-semibold text-[var(--fm-text)]">
        No deployments recorded yet
      </h3>
      <p className="text-sm text-[var(--fm-text-muted)] mt-1.5 max-w-2xl mb-6">
        Automate deployment tracking by adding this step to the end of your GitHub Actions deployment workflow.
      </p>

      <div className="w-full bg-[var(--fm-surface)] border border-[var(--fm-line)] rounded-[4px] overflow-hidden">
        <div className="flex items-center px-4 py-2 border-b border-[var(--fm-line)] font-mono text-xs text-[var(--fm-text-muted)]">
          <Code className="h-3.5 w-3.5 mr-2" />
          <span>.github/workflows/deploy.yml</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs text-[var(--fm-text)] leading-relaxed">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <span className="text-xs text-[var(--fm-text-muted)]">Or record a single event manually:</span>
        <Button onClick={onManualRecord} variant="outline" size="sm">
          Record Deployment
        </Button>
      </div>
    </div>
  )
}
