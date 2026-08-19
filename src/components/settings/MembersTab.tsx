'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Mail,
  Shield,
  Trash2,
  MoreVertical,
  Clock,
  GitBranch,
  Send,
  UserPlus,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      setInviteFeedback({ type: 'success', message: 'Invitation sent successfully.' })
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
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base font-semibold">Invite Team Member</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Invite developers or team administrators to join {activeOrg?.name || 'your organization'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    disabled={inviteMutation.isPending}
                    className="pl-9 bg-background/50 border-border/50 text-sm"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Select
                    value={inviteRole}
                    onValueChange={(val) => setInviteRole(val as 'member' | 'admin')}
                    disabled={inviteMutation.isPending}
                  >
                    <SelectTrigger className="w-full bg-background/50 border-border/50 text-sm">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-sm font-medium px-5"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Invite
                </Button>
              </div>

              {inviteFeedback && (
                <div
                  className={`flex items-center gap-2 text-xs p-2.5 rounded-lg border ${
                    inviteFeedback.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}
                >
                  {inviteFeedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{inviteFeedback.message}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base font-semibold">Active Members</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              People who have access to this organization and its analytics.
            </CardDescription>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {membersQuery.isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Loading members…</span>
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No members found in this organization.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-6">Member</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">GitHub</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Joined</TableHead>
                  {isOwner && <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-6">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrent = currentUser?.id === member.id
                  const isOrgOwner = member.role === 'owner'

                  return (
                    <TableRow key={member.id} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="pl-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {member.name ? member.name.charAt(0) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
                                {member.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/20">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {member.github_username ? (
                          <a
                            href={`https://github.com/${member.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-indigo-400 transition-colors"
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            <span>{member.github_username}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                      {isOwner && (
                        <TableCell className="py-3 text-right pr-6">
                          {!isOrgOwner && !isCurrent ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-card border-border/60">
                                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  Change Role
                                </div>
                                <DropdownMenuItem
                                  onClick={() =>
                                    changeRoleMutation.mutate({
                                      targetUserId: member.id,
                                      newRole: 'admin',
                                    })
                                  }
                                  disabled={member.role === 'admin' || changeRoleMutation.isPending}
                                  className="cursor-pointer gap-2 text-xs"
                                >
                                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                                  <span>Make Admin</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    changeRoleMutation.mutate({
                                      targetUserId: member.id,
                                      newRole: 'member',
                                    })
                                  }
                                  disabled={member.role === 'member' || changeRoleMutation.isPending}
                                  className="cursor-pointer gap-2 text-xs"
                                >
                                  <Users className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Make Member</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                  disabled={removeMemberMutation.isPending}
                                  className="cursor-pointer gap-2 text-xs text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Remove from Org</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground/30">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base font-semibold">Pending Invitations</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Invitations that have been sent but not yet accepted.
            </CardDescription>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
            {invitations.length} {invitations.length === 1 ? 'pending' : 'pending'}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {invitationsQuery.isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Loading invitations…</span>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No pending invitations for this organization.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-6">Recipient Email</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Assigned Role</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Sent Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Expires</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="pl-6 py-3 text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>{inv.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <RoleBadge role={inv.role} />
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {inv.created_at
                        ? new Date(inv.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {inv.expires_at
                        ? new Date(inv.expires_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/invitations/${inv.token}`
                          navigator.clipboard.writeText(url)
                          setCopiedId(inv.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                      >
                        {copiedId === inv.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
