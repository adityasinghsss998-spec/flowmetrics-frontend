'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart3, GitBranch, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'GitHub OAuth failed. Please try again.',
  invalid_token: 'Invalid authentication token received.',
  session_expired: 'Your session has expired. Please log in again.',
  unauthorized: 'Invalid email or password.',
}

function getErrorMessage(code: string | null): string | null {
  if (!code) return null
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens } = useAuthStore()

  const urlError = getErrorMessage(searchParams.get('error'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const activeError = urlError ?? formError

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setIsLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setTokens({ accessToken, refreshToken, user })

      const redirectTarget = searchParams.get('redirect') || '/dashboard'
      router.replace(redirectTarget)
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
          : 'Invalid email or password.'
      setFormError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="https://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-10 bg-black/80 pointer-events-none" />

      <Link href="/" className="mb-8 flex items-center gap-2.5 group relative z-20">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">
          Flow<span className="text-indigo-400">Metrics</span>
        </span>
      </Link>

      <Card
        id="login-card"
        className="relative z-20 w-full max-w-sm border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-white">Welcome back</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Sign in to your FlowMetrics account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {activeError && (
            <Alert
              id="login-error-alert"
              variant="destructive"
              className="border-destructive/50 bg-destructive/10"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{activeError}</AlertDescription>
            </Alert>
          )}

          <Button
            id="github-oauth-button"
            type="button"
            variant="outline"
            className="w-full gap-2 border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white font-medium"
            onClick={() => {
              window.location.href = GITHUB_OAUTH_URL
            }}
          >
            <GitBranch className="h-4 w-4" />
            Continue with GitHub
          </Button>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] font-medium text-slate-400">or sign in with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form id="login-form" onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-slate-300">
                Email address
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 pr-9 text-sm"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit-button"
              type="submit"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-0">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href={
                searchParams.get('redirect')
                  ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
                  : '/register'
              }
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
