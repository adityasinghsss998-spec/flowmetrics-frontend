'use client'

import { Info, Code } from 'lucide-react'
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
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center mt-6 shadow-sm flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
        <Info className="h-6 w-6 text-indigo-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground">No deployments recorded yet</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-lg mb-6">
        Automate deployment tracking by adding this step to the end of your GitHub Actions deployment workflow.
      </p>

      <div className="w-full max-w-2xl bg-[#0d1117] border border-white/[0.08] rounded-xl overflow-hidden text-left shadow-inner">
        <div className="flex items-center px-4 py-2 bg-white/[0.02] border-b border-white/[0.05]">
          <Code className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-xs font-mono text-muted-foreground/80">.github/workflows/deploy.yml</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-slate-300">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 text-sm">
        <span className="text-muted-foreground">Or, you can record one manually:</span>
        <Button onClick={onManualRecord} variant="outline" className="h-9 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06]">
          Record Deployment
        </Button>
      </div>
    </div>
  )
}
