'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  User,
  Shield,
  Trash2,
  MoreVertical,
  GitBranch,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react'
import api from '@/lib/axios'
import { useOrgRole } from '@/hooks/useOrgRole'
import { useAuthStore } from '@/store/authStore'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Member {
  id: number
  name: string
  email: string
  github_username: string | null
  role: string
  created_at: string
}

interface Invitation {
  id: number
  org_id: number
  email: string
  role: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  created_at: string
  inviter?: {
    id: number
    name: string
    email: string
  }
}

export function MembersTab() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const { activeOrg, isOwner, canInvite } = useOrgRole()
  const orgId = activeOrg?.id

  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState<'member' | 'admin'>('member')
  const [inviteFeedback, setInviteFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  const membersQuery = useQuery<Member[]>({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      if (!orgId) return []
      const res = await api.get(`/orgs/${orgId}/members`)
      return res.data.data
    },
    enabled: !!orgId,
    staleTime: 1000 * 60,
  })

  const invitationsQuery = useQuery<Invitation[]>({
    queryKey: ['org-invitations', orgId],
    queryFn: async () => {
      if (!orgId) return []
      const res = await api.get(`/orgs/${orgId}/invitations`)
      return res.data.data
    },
    enabled: !!orgId,
    staleTime: 1000 * 60,
  })

  const inviteMutation = useMutation({
    mutationFn: async (payload: { email: string; role: string }) => {
      const res = await api.post(`/orgs/${orgId}/invitations`, payload)
      return res.data
    },
    onSuccess: () => {
      setInviteEmail('')
      setInviteRole('member')
      setInviteFeedback({ type: 'success', message: 'Invitation sent.' })
      queryClient.invalidateQueries({ queryKey: ['org-invitations', orgId] })
      setTimeout(() => setInviteFeedback(null), 4000)
    },
    onError: (err: unknown) => {
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
          : 'Failed to send invitation.'
      setInviteFeedback({ type: 'error', message: msg })
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (targetUserId: number) => {
      return await api.delete(`/orgs/${orgId}/members/${targetUserId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
    },
  })

  const changeRoleMutation = useMutation({
    mutationFn: async ({ targetUserId, newRole }: { targetUserId: number; newRole: string }) => {
      return await api.patch(`/orgs/${orgId}/members/${targetUserId}/role`, { role: newRole })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', orgId] })
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
    },
  })

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInviteFeedback(null)
    if (!inviteEmail.trim() || !orgId) return
    inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })
  }

  const members = membersQuery.data ?? []
  const invitations = (invitationsQuery.data ?? []).filter((inv) => inv.status === 'pending')

  return (
    <div className="space-y-8">
      {canInvite && (
        <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-5">
          <div className="mb-4 pb-3 border-b border-[var(--fm-line)]/50">
            <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Invite Team Member</h3>
            <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">
              Add collaborators to {activeOrg?.name || 'this organization'}.
            </p>
          </div>

          <form onSubmit={handleInviteSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="collaborator@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteMutation.isPending}
                  className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs"
                />
              </div>
              <div className="w-full sm:w-36">
                <Select
                  value={inviteRole}
                  onValueChange={(val) => setInviteRole(val as 'member' | 'admin')}
                  disabled={inviteMutation.isPending}
                >
                  <SelectTrigger className="h-8 w-full border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || !inviteEmail.trim()}
                size="sm"
                className="gap-2 shrink-0"
              >
                {inviteMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send Invite
              </Button>
            </div>

            {inviteFeedback && (
              <div
                className={`flex items-center gap-2 font-mono text-xs p-2 rounded-[2px] border ${
                  inviteFeedback.type === 'success'
                    ? 'border-[var(--fm-status-good)]/30 text-[var(--fm-status-good)] bg-[var(--fm-status-good)]/5'
                    : 'border-[var(--fm-status-poor)]/30 text-[var(--fm-status-poor)] bg-[var(--fm-status-poor)]/5'
                }`}
              >
                {inviteFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{inviteFeedback.message}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Active Members */}
      <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[var(--fm-line)]/50">
          <div>
            <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Active Members</h3>
            <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">
              People who have access to this organization and its analytics.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--fm-text-muted)] px-2 py-0.5 rounded-[2px] border border-[var(--fm-line)] bg-[var(--fm-surface)]">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <div>
          {membersQuery.isLoading ? (
            <div className="p-5 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--fm-text-muted)]">
              No members found in this organization.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="fm-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>GitHub</th>
                    <th>Role</th>
                    <th>Joined</th>
                    {isOwner && <th className="text-right pr-5">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const isCurrent = currentUser?.id === member.id
                    const isOrgOwner = member.role === 'owner'

                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="font-mono text-xs bg-[var(--fm-surface)] text-[var(--fm-text)] border border-[var(--fm-line)]">
                                {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[var(--fm-text)] truncate">
                                  {member.name}
                                </span>
                                {isCurrent && (
                                  <span className="font-mono text-[10px] text-[var(--fm-accent)] px-1 py-0.2 rounded-[2px] border border-[var(--fm-accent)]/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-xs text-[var(--fm-text-muted)] truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {member.github_username ? (
                            <a
                              href={`https://github.com/${member.github_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--fm-text-muted)] hover:text-[var(--fm-accent)] transition-colors"
                            >
                              <GitBranch className="h-3 w-3" />
                              <span>{member.github_username}</span>
                            </a>
                          ) : (
                            <span className="font-mono text-xs text-[var(--fm-text-muted)]">-</span>
                          )}
                        </td>
                        <td>
                          <RoleBadge role={member.role} />
                        </td>
                        <td className="font-mono text-xs text-[var(--fm-text-muted)]">
                          {member.created_at
                            ? new Date(member.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                        {isOwner && (
                          <td className="text-right pr-5">
                            {!isOrgOwner && !isCurrent ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-[2px] fm-btn-quiet cursor-pointer">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-[var(--fm-surface-raised)] border border-[var(--fm-line)] rounded-[4px] p-1">
                                  <div className="px-2 py-1 font-mono text-xs font-medium text-[var(--fm-text-muted)]">
                                    Change role
                                  </div>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      changeRoleMutation.mutate({
                                        targetUserId: member.id,
                                        newRole: 'admin',
                                      })
                                    }
                                    disabled={member.role === 'admin' || changeRoleMutation.isPending}
                                    className="cursor-pointer gap-2 font-mono text-xs rounded-[2px] fm-sidebar-link px-2 py-1.5"
                                  >
                                    <Shield className="h-3 w-3" />
                                    <span>Make admin</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      changeRoleMutation.mutate({
                                        targetUserId: member.id,
                                        newRole: 'member',
                                      })
                                    }
                                    disabled={member.role === 'member' || changeRoleMutation.isPending}
                                    className="cursor-pointer gap-2 font-mono text-xs rounded-[2px] fm-sidebar-link px-2 py-1.5"
                                  >
                                    <User className="h-3 w-3" />
                                    <span>Make member</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[var(--fm-line)]" />
                                  <DropdownMenuItem
                                    onClick={() => removeMemberMutation.mutate(member.id)}
                                    disabled={removeMemberMutation.isPending}
                                    className="cursor-pointer gap-2 font-mono text-xs rounded-[2px] fm-btn-destructive px-2 py-1.5"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Remove from Org</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="font-mono text-xs text-[var(--fm-text-muted)]/40">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="rounded-[4px] border border-[var(--fm-line)] bg-[var(--fm-surface-raised)] overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[var(--fm-line)]/50">
          <div>
            <h3 className="font-mono text-sm font-medium text-[var(--fm-text)]">Pending Invitations</h3>
            <p className="text-xs text-[var(--fm-text-muted)] mt-0.5">
              Invitations sent but not yet accepted.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--fm-text-muted)] px-2 py-0.5 rounded-[2px] border border-[var(--fm-line)] bg-[var(--fm-surface)]">
            {invitations.length} pending
          </span>
        </div>

        <div>
          {invitationsQuery.isLoading ? (
            <div className="p-5 space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 rounded-[4px] bg-[var(--fm-surface)] animate-pulse" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--fm-text-muted)]">
              No pending invitations for this organization.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="fm-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Role</th>
                    <th>Sent</th>
                    <th>Expires</th>
                    <th className="text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs text-[var(--fm-text)]">
                        {inv.email}
                      </td>
                      <td>
                        <RoleBadge role={inv.role} />
                      </td>
                      <td className="font-mono text-xs text-[var(--fm-text-muted)]">
                        {inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="font-mono text-xs text-[var(--fm-text-muted)]">
                        {inv.expires_at
                          ? new Date(inv.expires_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="text-right pr-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/accept?token=${inv.token}`
                            navigator.clipboard.writeText(url)
                            setCopiedId(inv.id)
                            setTimeout(() => setCopiedId(null), 2000)
                          }}
                          className="h-7 px-2.5 text-xs text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] border border-[var(--fm-line)]"
                        >
                          {copiedId === inv.id ? (
                            <>
                              <Check className="h-3 w-3 text-[var(--fm-status-good)] mr-1" />
                              <span className="text-[var(--fm-status-good)]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
