'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart3, GitBranch, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import api from '@/lib/axios'

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`

// ─── Error message map ────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'GitHub OAuth failed. Please try again.',
  email_taken: 'This email is already registered.',
  invalid_token: 'Invalid authentication token received.',
}

function getErrorMessage(code: string | null): string | null {
  if (!code) return null
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

// ─── Inner component ──────────────────────────────────────────────────────────
function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = getErrorMessage(searchParams.get('error'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const activeError = urlError ?? formError

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setIsLoading(true)

    try {
      await api.post('/auth/register', { name, email, password })
      setSuccess(true)
      // Auto-redirect to login after short delay
      setTimeout(() => router.replace('/login'), 2000)
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
          : 'Registration failed. Please try again.'
      setFormError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute right-1/2 top-1/4 translate-x-1/2 h-[400px] w-[700px] rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute left-1/4 bottom-1/4 h-48 w-48 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      {/* Brand */}
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          Flow<span className="text-indigo-400">Metrics</span>
        </span>
      </Link>

      {/* Card */}
      <Card
        id="register-card"
        className="w-full max-w-sm border-border/50 bg-card/80 shadow-xl shadow-black/20 backdrop-blur-sm"
      >
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">Create your account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Start tracking your engineering metrics today
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error alert */}
          {activeError && !success && (
            <Alert
              id="register-error-alert"
              variant="destructive"
              className="border-destructive/50 bg-destructive/10"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{activeError}</AlertDescription>
            </Alert>
          )}

          {/* Success alert */}
          {success && (
            <Alert
              id="register-success-alert"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm text-emerald-400">
                Account created! Redirecting to login…
              </AlertDescription>
            </Alert>
          )}

          {/* GitHub OAuth button */}
          <Button
            id="github-oauth-register-button"
            type="button"
            variant="outline"
            className="w-full gap-2 border-border/60 font-medium hover:bg-accent/60"
            onClick={() => {
              window.location.href = GITHUB_OAUTH_URL
            }}
            disabled={isLoading || success}
          >
            <GitBranch className="h-4 w-4" />
            Sign up with GitHub
          </Button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] font-medium text-muted-foreground/60">or register with email</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Registration form */}
          <form id="register-form" onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-xs font-medium text-muted-foreground">
                Full name
              </label>
              <Input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Aditya Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading || success}
                className="border-border/60 bg-background/50 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-xs font-medium text-muted-foreground">
                Email address
              </label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || success}
                className="border-border/60 bg-background/50 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading || success}
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
              <p className="text-[10px] text-muted-foreground/60">Minimum 6 characters</p>
            </div>

            <Button
              id="register-submit-button"
              type="submit"
              className="w-full bg-indigo-600 font-semibold hover:bg-indigo-500"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : success ? (
                'Account Created!'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="text-muted-foreground">Terms of Service</span> and{' '}
            <span className="text-muted-foreground">Privacy Policy</span>.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center pt-0">
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

// ─── Page export with Suspense boundary ───────────────────────────────────────
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
