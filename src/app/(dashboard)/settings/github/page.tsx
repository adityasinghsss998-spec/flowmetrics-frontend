'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { CheckCircle2, Loader2 } from 'lucide-react'

function GitHubSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchMe } = useAuthStore()

  useEffect(() => {
    async function init() {
      await fetchMe()
      const timer = setTimeout(() => {
        router.replace('/dashboard')
      }, 1500)
      return () => clearTimeout(timer)
    }

    init()
  }, [fetchMe, router, searchParams])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-6">
      <div className="w-full max-w-md rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-8 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-8 w-8 text-[var(--fm-status-good)]" />
        </div>
        <h2 className="font-mono text-lg font-semibold text-[var(--fm-text)]">GitHub Connected</h2>
        <p className="text-xs text-[var(--fm-text-muted)]">
          Your GitHub account has been linked. Redirecting to dashboard…
        </p>
        <div className="flex items-center justify-center gap-2 font-mono text-xs text-[var(--fm-text-muted)] pt-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--fm-accent)]" />
          <span>Updating profile…</span>
        </div>
      </div>
    </div>
  )
}

export default function GitHubSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <Loader2 className="h-6 w-6 text-[var(--fm-accent)] animate-spin mb-3" />
          <p className="font-mono text-xs text-[var(--fm-text-muted)]">Connecting GitHub account…</p>
        </div>
      }
    >
      <GitHubSettingsContent />
    </Suspense>
  )
}
