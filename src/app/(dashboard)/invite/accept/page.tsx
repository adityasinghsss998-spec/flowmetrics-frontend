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
    <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
      <div className="w-full max-w-md rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-6 sm:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--fm-accent)]" />
            <div>
              <h2 className="font-mono text-base font-semibold text-[var(--fm-text)]">Processing Invitation</h2>
              <p className="text-xs text-[var(--fm-text-muted)] mt-1">Verifying your token and joining team…</p>
            </div>
          </div>
        ) : !isUserLoggedIn ? (
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)]">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-bold text-[var(--fm-text)]">Sign In Required</h2>
              <p className="text-xs text-[var(--fm-text-muted)] mt-1">
                Please log in to accept this organization invitation.
              </p>
            </div>
            <div className="pt-2 w-full">
              <Link
                href={`/login?redirect=/invite/accept?token=${token || ''}`}
                className="fm-btn-accent w-full justify-center"
              >
                <span>Log In to Accept</span>
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <CheckCircle2 className="h-10 w-10 text-[var(--fm-status-good)]" />
            <div>
              <h2 className="font-mono text-lg font-bold text-[var(--fm-text)]">Invitation Accepted</h2>
              <p className="text-xs text-[var(--fm-text-muted)] mt-1">
                You joined{' '}
                <span className="font-mono text-[var(--fm-text)] font-semibold">{orgData?.orgName || 'the organization'}</span>
                {orgData?.role ? ` as a ${orgData.role}` : ''}.
              </p>
            </div>
            <div className="pt-2 w-full">
              <button
                onClick={() => router.push('/dashboard')}
                className="fm-btn-accent w-full justify-center flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <AlertCircle className="h-10 w-10 text-[var(--fm-status-poor)]" />
            <div>
              <h2 className="font-mono text-lg font-bold text-[var(--fm-text)]">Unable to Accept</h2>
              <p className="text-xs text-[var(--fm-text-muted)] mt-1">
                {error || 'This invitation token is invalid or has expired.'}
              </p>
            </div>
            <div className="pt-2 w-full flex gap-3">
              <Link
                href="/dashboard"
                className="fm-btn-quiet flex-1 inline-flex items-center justify-center text-xs h-8 px-4"
              >
                <span>Dashboard</span>
              </Link>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                className="flex-1"
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--fm-accent)]" />
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  )
}
