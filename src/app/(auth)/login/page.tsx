'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import AuthRightPanel from '@/components/auth/AuthRightPanel'

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'GitHub sign-in was cancelled or failed. Please try again.',
  cancelled: 'GitHub sign-in was cancelled or failed. Please try again.',
  invalid_token: 'Invalid authentication token received.',
  session_expired: 'Your session expired. Sign in again.',
  unauthorized: 'Invalid email or password.',
}

function getErrorMessage(code: string | null): string | null {
  if (!code) return null
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

function getSafeRedirect(rawRedirect: string | null): string {
  if (!rawRedirect) return '/dashboard'
  // Only accept same-site relative paths, prevent open redirect
  if (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')) {
    return rawRedirect
  }
  return '/dashboard'
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
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Field validation states
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailInvalid = emailTouched && (!email || !emailRegex.test(email))
  const passwordInvalid = passwordTouched && (!password || password.length < 6)

  const activeError = urlError ?? formError
  const isSubmitting = isLoading || isGitHubLoading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailTouched(true)
    setPasswordTouched(true)

    if (!email || !emailRegex.test(email) || !password || password.length < 6) {
      return
    }

    setFormError(null)
    setIsLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setTokens({ accessToken, refreshToken, user })

      const destination = getSafeRedirect(searchParams.get('redirect'))
      router.replace(destination)
    } catch {
      // Plain message that does not reveal if the email exists
      setFormError('Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubClick = () => {
    if (isSubmitting) return
    setIsGitHubLoading(true)
    const redirectParam = searchParams.get('redirect')
    const finalUrl = redirectParam
      ? `${GITHUB_OAUTH_URL}?redirect=${encodeURIComponent(getSafeRedirect(redirectParam))}`
      : GITHUB_OAUTH_URL
    window.location.href = finalUrl
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--fm-bg)' }}
    >
      {/* ── Left column: wordmark + form ──────────────────────── */}
      <div className="flex flex-1 flex-col px-6 py-8 lg:px-16">
        {/* Wordmark at top-left */}
        <Link
          href="/"
          className="fm-wordmark-link inline-block font-mono text-base font-semibold tracking-tight self-start"
          style={{ color: 'var(--fm-text)' }}
          aria-label="FlowMetrics home"
        >
          <span>flowmetrics</span>
        </Link>

        {/* Form: vertically centered in the column */}
        <div className="flex flex-1 items-center">
          <div className="w-full" style={{ maxWidth: 420 }}>
            <h1
              className="font-mono font-bold mb-2"
              style={{ fontSize: 22, color: 'var(--fm-text)', lineHeight: 1.2 }}
            >
              Sign in
            </h1>
            <p
              className="text-sm mb-8"
              style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)', lineHeight: 1.6 }}
            >
              Track DORA metrics, cycle time and pull requests across your GitHub repositories.
            </p>

            {/* Live region for errors */}
            {activeError && (
              <div
                role="alert"
                aria-live="polite"
                id="login-error-alert"
                className="mb-6 rounded-[4px] p-3 text-xs leading-normal"
                style={{
                  background: 'color-mix(in srgb, var(--fm-status-poor) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--fm-status-poor) 30%, transparent)',
                  color: 'var(--fm-status-poor)',
                  fontFamily: 'var(--font-ibm-plex-sans)',
                }}
              >
                {activeError}
              </div>
            )}

            {/* Primary: Continue with GitHub */}
            <button
              id="github-oauth-button"
              type="button"
              onClick={handleGitHubClick}
              disabled={isSubmitting}
              aria-busy={isGitHubLoading}
              className="fm-btn-accent w-full h-11 gap-3 mb-6 font-mono text-sm"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>{isGitHubLoading ? 'Connecting...' : 'Continue with GitHub'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'var(--fm-line)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--fm-text-muted)' }}>
                or sign in with email
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--fm-line)' }} />
            </div>

            {/* Email form */}
            <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label
                  htmlFor="login-email"
                  className="block font-mono text-xs mb-1.5"
                  style={{ color: 'var(--fm-text-muted)' }}
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  disabled={isSubmitting}
                  className="input-underline"
                  aria-invalid={emailInvalid}
                  aria-describedby={emailInvalid ? 'email-error' : undefined}
                />
                {emailInvalid && (
                  <p id="email-error" className="font-mono text-[11px] mt-1.5 text-[var(--fm-status-poor)]">
                    Enter a valid email address
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="font-mono text-xs"
                    style={{ color: 'var(--fm-text-muted)' }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="font-mono text-xs bg-transparent border-0 cursor-pointer"
                    style={{ color: 'var(--fm-text-muted)' }}
                  >
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  disabled={isSubmitting}
                  className="input-underline"
                  aria-invalid={passwordInvalid}
                  aria-describedby={passwordInvalid ? 'password-error' : undefined}
                />
                {passwordInvalid && (
                  <p id="password-error" className="font-mono text-[11px] mt-1.5 text-[var(--fm-status-poor)]">
                    Use at least 6 characters
                  </p>
                )}
              </div>

              <button
                id="login-submit-button"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isLoading}
                className="fm-btn-quiet w-full h-11 font-mono text-sm font-medium"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </form>

            <p
              className="text-xs mt-6"
              style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
            >
              No account?{' '}
              <Link
                href={
                  searchParams.get('redirect')
                    ? `/register?redirect=${encodeURIComponent(getSafeRedirect(searchParams.get('redirect')))}`
                    : '/register'
                }
                className="fm-inline-link font-mono text-xs"
                style={{ color: 'var(--fm-accent)' }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Legal links pinned to bottom of left column */}
        <div className="flex gap-5 mt-auto pt-8">
          <Link href="/terms" className="fm-inline-link font-mono text-xs" style={{ color: 'var(--fm-text-muted)' }}>
            Terms of Service
          </Link>
          <Link href="/privacy" className="fm-inline-link font-mono text-xs" style={{ color: 'var(--fm-text-muted)' }}>
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* ── Right column: surface panel with mascot (shared) ── */}
      <AuthRightPanel />
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
