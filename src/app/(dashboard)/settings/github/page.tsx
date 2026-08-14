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
    let timer: NodeJS.Timeout | null = null
    let cancelled = false

    async function init() {
      await fetchMe()
      timer = setTimeout(() => {
        if (!cancelled) {
          router.replace('/dashboard')
        }
      }, 1500)
    }

    init()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [fetchMe, router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 mb-4">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-foreground">GitHub Account Connected!</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Your GitHub account has been successfully linked. Redirecting to dashboard…
      </p>
      <div className="flex items-center gap-2 text-xs text-indigo-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Updating profile…</span>
      </div>
    </div>
  )
}

export default function GitHubSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Connecting GitHub account…</p>
        </div>
      }
    >
      <GitHubSettingsContent />
    </Suspense>
  )
}
