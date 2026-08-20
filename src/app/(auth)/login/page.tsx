'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GitBranch, Eye, EyeOff, AlertCircle, TrendingUp, Zap, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import KineticGrid from '@/components/ui/kinetic-grid'
import FlowMetricsLogo from '@/components/ui/FlowMetricsLogo'
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

const stats = [
  { icon: TrendingUp, label: '2.4M+ Deployments Tracked', color: 'text-indigo-400' },
  { icon: Zap, label: 'Real-time WebSocket Events', color: 'text-cyan-400' },
  { icon: Shield, label: 'DORA Elite Benchmarking', color: 'text-violet-400' },
]

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
      router.replace(searchParams.get('redirect') || '/dashboard')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' && 'message' in err.response.data
          ? String((err.response.data as { message: string }).message)
          : 'Invalid email or password.'
      setFormError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#050510]">
      {/* ── Left panel: KineticGrid branding ───────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ minHeight: '100vh' }}>
        <KineticGrid className="absolute inset-0 w-full h-full" globalColor="indigo" />
        <div className="relative z-20 flex flex-col justify-between p-12 w-full">
          <Link href="/">
            <FlowMetricsLogo size="lg" />
          </Link>

          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-widest text-indigo-400/70">
                Engineering Intelligence Platform
              </p>
              <h2 className="text-5xl font-black tracking-tighter text-white leading-[1.05]">
                Ship faster.<br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Break less.
                </span>
              </h2>
              <p className="text-base text-slate-400 max-w-sm leading-relaxed">
                DORA metrics, real-time events, and contributor intelligence — all in one place for modern engineering teams.
              </p>
            </div>

            <div className="space-y-3">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                      <Icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <span className="text-sm text-slate-300">{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="text-xs text-slate-600">© 2026 FlowMetrics · Built for elite engineering teams</p>
        </div>
      </div>

      {/* ── Right panel: Form ───────────────────────────────── */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Link href="/">
              <FlowMetricsLogo size="md" />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-slate-400">Sign in to your FlowMetrics account</p>
          </div>

          {activeError && (
            <Alert id="login-error-alert" variant="destructive" className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-red-300">{activeError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              id="github-oauth-button"
              type="button"
              className="w-full gap-2.5 bg-[#24292f] hover:bg-[#2f363d] text-white border border-white/10 font-medium h-11"
              onClick={() => { window.location.href = GITHUB_OAUTH_URL }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[11px] font-medium text-slate-500">or sign in with email</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-medium text-slate-300">Email address</label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-medium text-slate-300">Password</label>
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
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 pr-10 focus:border-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                id="login-submit-button"
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href={searchParams.get('redirect')
                ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
                : '/register'}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#050510]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
