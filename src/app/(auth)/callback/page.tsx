'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=oauth_failed')
      return
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    // Decode JWT payload (base64, not encrypted — safe to decode client-side)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setTokens({ accessToken, refreshToken, user: payload })
      router.replace('/dashboard')
    } catch {
      router.replace('/login?error=invalid_token')
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium text-foreground">Completing login...</div>
        <div className="text-sm text-muted-foreground">Please wait while we verify your credentials.</div>
      </div>
    </div>
  )
}

export default function CallbackHandler() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 text-lg font-medium text-foreground">Completing login...</div>
            <div className="text-sm text-muted-foreground">Please wait while we verify your credentials.</div>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}


