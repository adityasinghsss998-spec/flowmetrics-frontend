'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'GitHub sign-in failed. Please try again.',
  invalid_token: 'Invalid authentication token received.',
  session_expired: 'Your session has expired. Please sign in again.',
  unauthorized: 'Invalid email or password.',
}

function getErrorMessage(code: string | null): string | null {
  if (!code) return null
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
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
    <div
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: 'var(--fm-bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontWeight: 600,
            fontSize: 17,
            color: 'var(--fm-text)',
            letterSpacing: '-0.01em',
            display: 'block',
            marginBottom: 40,
          }}
        >
          flowmetrics
        </Link>

        {/* Product sentence */}
        <p
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: 14,
            color: 'var(--fm-text-muted)',
            lineHeight: 1.6,
            marginBottom: 32,
            maxWidth: 320,
          }}
        >
          FlowMetrics connects to your GitHub repositories and reports DORA metrics, cycle time, open pull requests and contributor activity.
        </p>

        {/* Error */}
        {activeError && (
          <div
            role="alert"
            id="login-error-alert"
            style={{
              background: 'color-mix(in srgb, var(--fm-status-poor) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--fm-status-poor) 30%, transparent)',
              borderRadius: 4,
              padding: '10px 14px',
              marginBottom: 24,
              fontSize: 13,
              color: 'var(--fm-status-poor)',
              fontFamily: 'var(--font-ibm-plex-sans)',
            }}
          >
            {activeError}
          </div>
        )}

        {/* GitHub button */}
        <button
          id="github-oauth-button"
          type="button"
          onClick={() => { window.location.href = GITHUB_OAUTH_URL }}
          className="btn-accent w-full h-11 flex items-center justify-center gap-3"
          style={{ marginBottom: 28 }}
        >
          <GitHubIcon className="h-4 w-4" />
          Continue with GitHub
        </button>

        {/* Divider */}
        <div
          className="flex items-center gap-3"
          style={{ marginBottom: 28 }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--fm-line)' }} />
          <span style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
            or sign in with email
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--fm-line)' }} />
        </div>

        {/* Email form */}
        <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="login-email"
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 12,
                color: 'var(--fm-text-muted)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="input-underline"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 12,
                color: 'var(--fm-text-muted)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="input-underline"
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--fm-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            className="btn-accent w-full h-10 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2"
                  style={{
                    borderColor: 'var(--fm-on-accent)',
                    borderTopColor: 'transparent',
                  }}
                />
                Signing in
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Register link */}
        <p
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: 13,
            color: 'var(--fm-text-muted)',
            marginTop: 24,
          }}
        >
          No account?{' '}
          <Link
            href={
              searchParams.get('redirect')
                ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
                : '/register'
            }
            style={{ color: 'var(--fm-accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Create one free
          </Link>
        </p>

        {/* Legal links */}
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            gap: 20,
          }}
        >
          <Link
            href="/terms"
            style={{
              fontFamily: 'var(--font-ibm-plex-sans)',
              fontSize: 12,
              color: 'var(--fm-text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              opacity: 0.7,
            }}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            style={{
              fontFamily: 'var(--font-ibm-plex-sans)',
              fontSize: 12,
              color: 'var(--fm-text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              opacity: 0.7,
            }}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--fm-bg)' }}
        >
          <div
            className="h-5 w-5 animate-spin rounded-full border-2"
            style={{ borderColor: 'var(--fm-line)', borderTopColor: 'var(--fm-accent)' }}
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
