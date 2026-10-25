'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/axios'

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'GitHub sign-in was cancelled or failed. Please try again.',
  cancelled: 'GitHub sign-in was cancelled or failed. Please try again.',
  email_taken: 'This email is already registered.',
  invalid_token: 'Invalid authentication token received.',
}

function getErrorMessage(code: string | null): string | null {
  if (!code) return null
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

function getSafeRedirect(rawRedirect: string | null): string {
  if (!rawRedirect) return '/dashboard'
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

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = getErrorMessage(searchParams.get('error'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Field validation states
  const [nameTouched, setNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nameInvalid = nameTouched && !name.trim()
  const emailInvalid = emailTouched && (!email || !emailRegex.test(email))
  const passwordInvalid = passwordTouched && (!password || password.length < 6)

  const activeError = urlError ?? formError
  const isSubmitting = isLoading || isGitHubLoading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameTouched(true)
    setEmailTouched(true)
    setPasswordTouched(true)

    if (!name.trim() || !email || !emailRegex.test(email) || !password || password.length < 6) {
      return
    }

    setFormError(null)
    setIsLoading(true)

    try {
      await api.post('/auth/register', { name, email, password })
      setSuccess(true)
      const redirectTarget = searchParams.get('redirect')
      setTimeout(() => {
        router.replace(
          redirectTarget
            ? `/login?redirect=${encodeURIComponent(getSafeRedirect(redirectTarget))}`
            : '/login'
        )
      }, 1200)
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
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: 'var(--fm-bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Wordmark: links to landing page */}
        <Link
          href="/"
          className="fm-wordmark-link inline-block font-mono text-base font-semibold tracking-tight mb-8"
          style={{ color: 'var(--fm-text)' }}
          aria-label="FlowMetrics home"
        >
          <span>flowmetrics</span>
        </Link>

        {/* Product sentence */}
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
        >
          FlowMetrics connects to your GitHub repositories and reports DORA metrics, cycle time, open pull requests and contributor activity.
        </p>

        {/* Live region for errors */}
        {activeError && (
          <div
            role="alert"
            aria-live="polite"
            id="register-error-alert"
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

        {/* Success alert */}
        {success && (
          <div
            role="status"
            id="register-success-alert"
            className="mb-6 rounded-[4px] p-3 text-xs leading-normal"
            style={{
              background: 'color-mix(in srgb, var(--fm-status-good) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--fm-status-good) 30%, transparent)',
              color: 'var(--fm-status-good)',
              fontFamily: 'var(--font-ibm-plex-sans)',
            }}
          >
            Account created. Redirecting to sign in...
          </div>
        )}

        {/* The ONE accent button: Continue with GitHub */}
        <button
          id="github-oauth-button"
          type="button"
          onClick={handleGitHubClick}
          disabled={isSubmitting || success}
          aria-busy={isGitHubLoading}
          className="fm-btn-accent w-full h-11 gap-3 mb-6 font-mono text-sm"
        >
          <GitHubIcon className="h-4 w-4" />
          <span>{isGitHubLoading ? 'Connecting...' : 'Continue with GitHub'}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[var(--fm-line)]" />
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--fm-text-muted)' }}
          >
            or create an account with email
          </span>
          <div className="flex-1 h-px bg-[var(--fm-line)]" />
        </div>

        {/* Email form */}
        <form id="register-form" onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label
              htmlFor="register-name"
              className="block font-mono text-xs mb-1.5"
              style={{ color: 'var(--fm-text-muted)' }}
            >
              Name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoFocus
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              disabled={isSubmitting || success}
              className="input-underline"
              aria-invalid={nameInvalid}
              aria-describedby={nameInvalid ? 'name-error' : undefined}
            />
            {nameInvalid && (
              <p id="name-error" className="font-mono text-[11px] mt-1.5 text-[var(--fm-status-poor)]">
                Enter your name
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block font-mono text-xs mb-1.5"
              style={{ color: 'var(--fm-text-muted)' }}
            >
              Email address
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              disabled={isSubmitting || success}
              className="input-underline"
              aria-invalid={emailInvalid}
              aria-describedby={emailInvalid ? 'register-email-error' : undefined}
            />
            {emailInvalid && (
              <p id="register-email-error" className="font-mono text-[11px] mt-1.5 text-[var(--fm-status-poor)]">
                Enter a valid email address
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="register-password"
                className="font-mono text-xs"
                style={{ color: 'var(--fm-text-muted)' }}
              >
                Password
              </label>
              {/* Text toggle: Show / Hide with accessible name */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="font-mono text-xs text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] bg-transparent border-0 cursor-pointer"
              >
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              disabled={isSubmitting || success}
              className="input-underline"
              aria-invalid={passwordInvalid}
              aria-describedby={passwordInvalid ? 'register-password-error' : undefined}
            />
            {passwordInvalid && (
              <p id="register-password-error" className="font-mono text-[11px] mt-1.5 text-[var(--fm-status-poor)]">
                Use at least 6 characters
              </p>
            )}
          </div>

          {/* Quiet bordered submit button with hover wipe */}
          <button
            id="register-submit-button"
            type="submit"
            disabled={isSubmitting || success}
            aria-busy={isLoading}
            className="fm-btn-quiet w-full h-11 font-mono text-sm font-medium"
          >
            <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
          </button>
        </form>

        {/* Sign in link */}
        <p
          className="text-xs mt-6"
          style={{ color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}
        >
          Have an account?{' '}
          <Link
            href={
              searchParams.get('redirect')
                ? `/login?redirect=${encodeURIComponent(getSafeRedirect(searchParams.get('redirect')))}`
                : '/login'
            }
            className="fm-inline-link font-mono text-xs text-[var(--fm-accent)]"
          >
            Sign in
          </Link>
        </p>

        {/* Legal links: visible near create account */}
        <div className="mt-12 flex gap-5">
          <Link href="/terms" className="fm-inline-link font-mono text-xs text-[var(--fm-text-muted)]">
            Terms of Service
          </Link>
          <Link href="/privacy" className="fm-inline-link font-mono text-xs text-[var(--fm-text-muted)]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  )
}
