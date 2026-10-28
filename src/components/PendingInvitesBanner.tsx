'use client'

import React, { useEffect, useState, useCallback } from 'react'
import api from '@/lib/axios'
import { Invitation, ApiResponse } from '@/types/api'
import { useAuthStore } from '@/store/authStore'
import { Mail, Check, AlertCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PendingInvitesBanner() {
  const { isAuthenticated } = useAuthStore()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [actionError, setActionError] = useState<Record<string, string>>({})
  const [actionSuccess, setActionSuccess] = useState<Record<string, string>>({})
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})

  const fetchPendingInvitations = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token && !isAuthenticated) return

    try {
      setLoading(true)
      const res = await api.get<ApiResponse<Invitation[]>>('/invitations/pending')
      if (res.data?.data) {
        setInvitations(res.data.data)
      }
    } catch (err: any) {
      console.log('Pending invitations check:', err?.response?.data?.message || err?.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchPendingInvitations()
    const handleFocus = () => fetchPendingInvitations()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchPendingInvitations])

  const handleAccept = async (invitation: Invitation) => {
    setActionLoading((prev) => ({ ...prev, [invitation.token]: true }))
    setActionError((prev) => ({ ...prev, [invitation.token]: '' }))

    try {
      await api.post(`/invitations/${invitation.token}/accept`)
      setActionSuccess((prev) => ({
        ...prev,
        [invitation.token]: `Joined ${invitation.org_name || 'organization'} successfully!`,
      }))

      setTimeout(() => {
        setInvitations((prev) => prev.filter((i) => i.token !== invitation.token))
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('flowmetrics:org-joined', { detail: invitation }))
        }
      }, 1500)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to accept invitation'
      setActionError((prev) => ({ ...prev, [invitation.token]: msg }))
    } finally {
      setActionLoading((prev) => ({ ...prev, [invitation.token]: false }))
    }
  }

  const handleDismiss = (token: string) => {
    setDismissed((prev) => ({ ...prev, [token]: true }))
  }

  const visibleInvitations = invitations.filter((inv) => !dismissed[inv.token])

  if (visibleInvitations.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-[var(--fm-surface)] border-b border-[var(--fm-line)] px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-2">
        {visibleInvitations.map((inv) => {
          const isPendingAction = actionLoading[inv.token]
          const isSuccess = actionSuccess[inv.token]
          const errorMsg = actionError[inv.token]

          return (
            <div
              key={inv.token}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--fm-surface-raised)] border border-[var(--fm-line)] rounded-[4px] p-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-[4px] bg-[var(--fm-surface)] border border-[var(--fm-line)] flex items-center justify-center shrink-0 text-[var(--fm-text-muted)] mt-0.5 sm:mt-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-[var(--fm-text)]">
                      Pending Invitation
                    </span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--fm-line)] bg-[var(--fm-surface)] text-[var(--fm-text-muted)]">
                      {inv.role}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">
                    <span className="font-mono text-[var(--fm-text)] font-medium">{inv.invited_by_name || 'A team member'}</span> has
                    invited you to join{' '}
                    <span className="font-mono text-[var(--fm-text)] font-semibold">{inv.org_name}</span>.
                  </p>
                  {errorMsg && (
                    <p className="font-mono text-xs text-[var(--fm-status-poor)] flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errorMsg}
                    </p>
                  )}
                  {isSuccess && (
                    <p className="font-mono text-xs text-[var(--fm-status-good)] flex items-center gap-1 mt-1">
                      <Check className="h-3 w-3" />
                      {isSuccess}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(inv.token)}
                  disabled={isPendingAction || !!isSuccess}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Dismiss
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAccept(inv)}
                  disabled={isPendingAction || !!isSuccess}
                >
                  {isPendingAction ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Accepting…
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Accepted
                    </>
                  ) : (
                    'Accept Invitation'
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
