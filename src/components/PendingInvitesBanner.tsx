'use client'

import React, { useEffect, useState, useCallback } from 'react'
import api from '@/lib/axios'
import { Invitation, ApiResponse } from '@/types/api'
import { useAuthStore } from '@/store/authStore'
import { Mail, Check, AlertCircle, Loader2, Sparkles, X } from 'lucide-react'
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
      // If 401/404 or backend unavailable, silently don't break layout
      console.log('Pending invitations check:', err?.response?.data?.message || err?.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchPendingInvitations()
    // Poll or check on window focus
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

      // Remove from list after brief moment and refresh
      setTimeout(() => {
        setInvitations((prev) => prev.filter((i) => i.token !== invitation.token))
        // Dispatch custom event so sidebar/org switchers can refresh org list
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
    <div className="w-full bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-900/90 border-b border-indigo-500/30 px-4 py-3 shadow-lg shadow-indigo-950/20 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-2">
        {visibleInvitations.map((inv) => {
          const isPendingAction = actionLoading[inv.token]
          const isSuccess = actionSuccess[inv.token]
          const errorMsg = actionError[inv.token]

          return (
            <div
              key={inv.token}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-900/30 hover:bg-indigo-900/40 border border-indigo-500/20 rounded-xl p-3.5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5 sm:mt-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      Pending Invitation
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {inv.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground">{inv.invited_by_name || 'A team member'}</span> has
                    invited you to join{' '}
                    <span className="font-semibold text-indigo-300">{inv.org_name}</span>.
                  </p>
                  {errorMsg && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errorMsg}
                    </p>
                  )}
                  {isSuccess && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <Check className="h-3.5 w-3.5" />
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
                  className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
                  disabled={isPendingAction || !!isSuccess}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Dismiss
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAccept(inv)}
                  disabled={isPendingAction || !!isSuccess}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-8 px-4 shadow-sm shadow-indigo-500/30 transition-all cursor-pointer"
                >
                  {isPendingAction ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Accepting...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Accepted!
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
