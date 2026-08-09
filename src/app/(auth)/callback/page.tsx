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

    try {
    
      const base64Url = accessToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      setTokens({ accessToken, refreshToken, user: payload })
      router.replace('/dashboard')
    } catch {
    
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.replace('/login?error=invalid_token')
    }


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