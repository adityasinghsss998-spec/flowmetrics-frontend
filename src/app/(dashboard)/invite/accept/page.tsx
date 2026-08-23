'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function InviteAcceptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const { isAuthenticated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orgData, setOrgData] = useState<{ orgName?: string; role?: string } | null>(null)

  useEffect(() => {
    const handleAccept = async () => {
      if (!token) {
        setError('Missing invitation token in URL')
        setLoading(false)
        return
      }

      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (!storedToken && !isAuthenticated) {
        sessionStorage.setItem('pending_invite_token', token)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const res = await api.post(`/invitations/${token}/accept`)
        setSuccess(true)
        setOrgData(res.data?.data || null)
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to accept invitation'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    handleAccept()
  }, [token, isAuthenticated])

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const isUserLoggedIn = isAuthenticated || !!storedToken

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 min-h-[70vh]">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Processing Invitation</h2>
              <p className="text-sm text-muted-foreground mt-1">Verifying your token and joining the team...</p>
            </div>
          </div>
        ) : !isUserLoggedIn ? (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <LogIn className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Please log in or sign up to accept this organization invitation.
              </p>
            </div>
            <div className="pt-4 w-full flex flex-col gap-2">
              <Link
                href={`/login?redirect=/invite/accept?token=${token || ''}`}
                className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm h-9 px-4 transition-colors"
              >
                Log In to Accept
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome Aboard!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                You have successfully joined{' '}
                <span className="font-semibold text-indigo-400">{orgData?.orgName || 'the organization'}</span>
                {orgData?.role ? ` as a ${orgData.role}` : ''}.
              </p>
            </div>
            <div className="pt-4 w-full">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="h-14 w-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Unable to Accept Invitation</h2>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                {error || 'This invitation token is invalid or has expired.'}
              </p>
            </div>
            <div className="pt-4 w-full flex gap-3">
              <Link
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground text-sm font-medium h-9 px-4 transition-colors"
              >
                Dashboard
              </Link>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  )
}
