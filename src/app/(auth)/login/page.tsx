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

// ─── Error message map ────────────────────────────────────────────────────────
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

// ─── Inner component (needs useSearchParams, must be inside Suspense) ─────────
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

      router.replace('/dashboard')
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-indigo-600/8 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      {/* Brand */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          Flow<span className="text-indigo-400">Metrics</span>
        </span>
      </Link>

      {/* Card */}
      <Card
        id="login-card"
        className="w-full max-w-sm border-border/50 bg-card/80 shadow-xl shadow-black/20 backdrop-blur-sm"
      >
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to your FlowMetrics account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error alert — reads from URL param or form error */}
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

          {/* GitHub OAuth button */}
          <Button
            id="github-oauth-button"
            type="button"
            variant="outline"
            className="w-full gap-2 border-border/60 font-medium hover:bg-accent/60"
            onClick={() => {
              window.location.href = GITHUB_OAUTH_URL
            }}
          >
            <GitBranch className="h-4 w-4" />
            Continue with GitHub
          </Button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] font-medium text-muted-foreground/60">or sign in with email</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Email/password form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-muted-foreground">
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
                className="border-border/60 bg-background/50 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">
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
                  className="border-border/60 bg-background/50 pr-9 text-sm"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit-button"
              type="submit"
              className="w-full bg-indigo-600 font-semibold hover:bg-indigo-500"
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
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
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

// ─── Page export with Suspense boundary (required for useSearchParams) ────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
