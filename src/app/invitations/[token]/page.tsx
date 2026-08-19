'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  LogIn,
  UserPlus,
  Building2,
} from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvitationAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  const { user, isAuthenticated, logout } = useAuthStore()

  const [mounted, setMounted] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [acceptedOrgId, setAcceptedOrgId] = React.useState<number | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const hasAccessToken = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('accessToken')
  }, [mounted])

  const isLoggedIn = isAuthenticated || hasAccessToken

  React.useEffect(() => {
    if (!mounted || !token) return

    if (isLoggedIn && status === 'idle') {
      acceptInvitation()
    }
  }, [mounted, token, isLoggedIn, status])

  const acceptInvitation = async () => {
    setStatus('loading')
    setErrorMessage(null)

    try {
      const response = await api.post(`/invitations/${token}/accept`)
      const payload = response.data.data
      setAcceptedOrgId(payload?.orgId ?? null)
      setStatus('success')

      setTimeout(() => {
        router.replace('/dashboard')
      }, 2500)
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String((err.response.data as { message: string }).message)
          : 'Failed to accept invitation. The invitation may be invalid, expired, or intended for a different email address.'
      setErrorMessage(msg)
      setStatus('error')
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-background to-background pointer-events-none" />

      <Link href="/" className="mb-8 flex items-center gap-2.5 group relative z-20">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          Flow<span className="text-indigo-400">Metrics</span>
        </span>
      </Link>

      <Card className="relative z-20 w-full max-w-md border border-border/50 bg-card/60 shadow-2xl backdrop-blur-xl">
        {!isLoggedIn ? (
          <>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Organization Invitation
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                You have been invited to join a workspace on FlowMetrics. Please sign in or create an account to accept.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <Link
                href={`/login?redirect=/invitations/${token}`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 py-3 text-sm transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In to Accept
              </Link>
              <Link
                href={`/register?redirect=/invitations/${token}`}
                className="inline-flex w-full items-center justify-center rounded-lg border border-border/60 hover:bg-white/5 font-medium gap-2 py-3 text-sm transition-colors text-foreground"
              >
                <UserPlus className="h-4 w-4" />
                Create an Account
              </Link>
            </CardContent>
          </>
        ) : status === 'loading' ? (
          <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Accepting Invitation…</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Adding your account ({user?.email}) to the organization.
              </p>
            </div>
          </CardContent>
        ) : status === 'success' ? (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Welcome to the Team!
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                You have successfully joined the organization. Redirecting to your dashboard…
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 py-5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                <AlertCircle className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Unable to Accept Invitation
              </CardTitle>
              <CardDescription className="text-xs text-red-400 mt-2 px-2">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button
                onClick={acceptInvitation}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5"
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  logout()
                  router.replace(`/login?redirect=/invitations/${token}`)
                }}
                variant="outline"
                className="w-full border-border/60 hover:bg-white/5 font-medium py-5 text-xs"
              >
                Sign in with a different account
              </Button>
            </CardContent>
            <CardFooter className="justify-center border-t border-border/40 pt-4">
              <Link
                href="/dashboard"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Return to Dashboard
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
