'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Building2,
  GitBranch,
  Plus,
  Lock,
  Globe,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ChevronRight,
  X,
  ChevronDown,
  Check,
  Trash2,
} from 'lucide-react'
import api from '@/lib/axios'
import { Organization, Repository } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGithubConnect } from '@/hooks/useGithubConnect'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface AvailableRepo {
  github_repo_id: number
  name: string
  full_name: string
  is_private: boolean
  default_branch: string
  description: string | null
}

interface OrgWithMembers extends Organization {
  members?: { id: number; name: string; OrgMember: { role: string } }[]
}

function OrgSelect({
  orgs,
  value,
  onChange,
  onCreateOrg,
}: {
  orgs: OrgWithMembers[]
  value: string | null
  onChange: (v: string) => void
  onCreateOrg: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = orgs.find((o) => String(o.id) === value)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        id="org-selector"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-semibold text-foreground hover:bg-white/[0.06] transition-colors"
      >
        <span className="max-w-40 truncate">
          {selected ? selected.name : 'Select organization'}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground/60 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-56 rounded-xl border border-white/[0.08] bg-card shadow-2xl overflow-hidden">
          {orgs.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground space-y-2">
              <p>No organizations found.</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onCreateOrg()
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Organization
              </button>
            </div>
          ) : (
            <div className="py-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    onChange(String(org.id))
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-white/[0.05] transition-colors"
                >
                  <span className="flex-1 text-left truncate">{org.name}</span>
                  {String(org.id) === value && <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-white/[0.06] mt-1 pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onCreateOrg()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Organization
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CreateOrgModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [githubOrg, setGithubOrg] = useState('')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: { name: string; github_org_name: string }) => {
      try {
        return await api.post('/orgs', payload)
      } catch (err: any) {
        // Only fallback to /organizations if the /orgs endpoint doesn't exist (404)
        if (err?.response?.status === 404) {
          return await api.post('/organizations', payload)
        }
        throw err
      }
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['orgs'] })
      const newOrg = res.data?.data
      if (newOrg?.id) {
        onCreated(String(newOrg.id))
      }
      setName('')
      setGithubOrg('')
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate({ name: name.trim(), github_org_name: githubOrg.trim() })
  }

  const errorMsg = mutation.isError
    ? ((mutation.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to create organization.')
    : null

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent showCloseButton={false} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-card shadow-2xl p-6">
        <DialogHeader className="border-b border-white/[0.06] pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <DialogTitle className="text-sm font-semibold text-foreground">Create Organization</DialogTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              GitHub Org Name (Optional)
            </label>
            <input
              type="text"
              value={githubOrg}
              onChange={(e) => setGithubOrg(e.target.value)}
              placeholder="e.g. acme-inc"
              className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>

          {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-white/[0.08] text-xs font-semibold text-muted-foreground hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="h-9 px-4 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Creating…' : 'Create Organization'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConnectModal({
  open,
  onClose,
  activeOrgId,
  orgs,
  onSelectOrg,
  onCreateOrg,
  availableRepos,
  isLoadingRepos,
  isPending,
  connectingRepo,
  onConnect,
  error,
  isGithubConnected,
  onConnectGithub,
}: {
  open: boolean
  onClose: () => void
  activeOrgId: string | null
  orgs: OrgWithMembers[]
  onSelectOrg: (v: string) => void
  onCreateOrg: () => void
  availableRepos: AvailableRepo[]
  isLoadingRepos: boolean
  isPending: boolean
  connectingRepo: string | null
  onConnect: (fullName: string) => void
  error: string | null
  isGithubConnected: boolean
  onConnectGithub: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent showCloseButton={false} className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-card shadow-2xl p-0">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
              <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <DialogTitle className="text-sm font-semibold text-foreground">Connect a Repository</DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!isGithubConnected ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-6 text-center space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/20 text-indigo-400">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">GitHub Authorization Required</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                To connect repositories, you must first link your GitHub account to FlowMetrics.
              </p>
              <Button
                type="button"
                onClick={onConnectGithub}
                className="bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Connect GitHub Account
              </Button>
            </div>
          ) : !activeOrgId ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Building2 className="h-4 w-4" />
                Select or Create an Organization First
              </div>
              <p className="text-xs text-muted-foreground">
                You need an active organization to link repositories. Choose an existing organization or create a new one.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {orgs.length > 0 && (
                  <OrgSelect
                    orgs={orgs}
                    value={activeOrgId}
                    onChange={onSelectOrg}
                    onCreateOrg={onCreateOrg}
                  />
                )}
                <button
                  type="button"
                  onClick={onCreateOrg}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Organization
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
              {isLoadingRepos && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              )}

              {!isLoadingRepos && availableRepos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <GitBranch className="h-8 w-8 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">No repositories found.</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Ensure your GitHub token is configured.</p>
                </div>
              )}

              {availableRepos.map((repo) => (
                <div
                  key={repo.github_repo_id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:border-indigo-500/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                      repo.is_private ? 'border-amber-500/20 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/10'
                    )}>
                      {repo.is_private
                        ? <Lock className="h-3 w-3 text-amber-400" />
                        : <Globe className="h-3 w-3 text-emerald-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{repo.full_name}</p>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground/50 truncate">{repo.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    id={`connect-${repo.github_repo_id}`}
                    type="button"
                    disabled={isPending && connectingRepo === repo.full_name}
                    onClick={() => onConnect(repo.full_name)}
                    className="ml-3 shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending && connectingRepo === repo.full_name ? 'Connecting…' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DisconnectConfirmModal({
  open,
  onClose,
  repoName,
  isPending,
  onConfirm,
  error,
}: {
  open: boolean
  onClose: () => void
  repoName: string | null
  isPending: boolean
  onConfirm: () => void
  error: string | null
}) {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent showCloseButton={false} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-card shadow-2xl p-6 space-y-4">
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </div>
              <DialogTitle className="text-sm font-semibold text-foreground">Disconnect Repository</DialogTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <DialogDescription className="text-xs text-muted-foreground">
          Are you sure you want to disconnect <strong className="text-foreground font-semibold">{repoName}</strong>? Webhook tracking will stop and the repository will be unlinked.
        </DialogDescription>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-white/[0.08] text-xs font-semibold text-muted-foreground hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-disconnect-btn"
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="h-9 px-4 rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Disconnecting…' : 'Disconnect Repository'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RepoCard({
  repo,
  onClick,
  onDisconnect,
}: {
  repo: Repository
  onClick: () => void
  onDisconnect?: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5',
        'backdrop-blur-xl transition-all duration-300',
        'hover:border-indigo-500/30 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/10',
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
              repo.is_private ? 'border-amber-500/20 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/10'
            )}>
              {repo.is_private
                ? <Lock className="h-3.5 w-3.5 text-amber-400" />
                : <Globe className="h-3.5 w-3.5 text-emerald-400" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">{repo.name}</p>
              <p className="text-[11px] text-muted-foreground/60 truncate">{repo.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              id={`disconnect-repo-${repo.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDisconnect?.()
              }}
              title="Disconnect repository"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:text-indigo-400" />
          </div>
        </div>

        <div className="space-y-2.5 mt-4 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <GitBranch className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            <span className="text-[11px] text-muted-foreground/60 font-mono">{repo.default_branch}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full',
                repo.webhook_id ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
              )} />
              <span className={cn('text-[11px] font-medium', repo.webhook_id ? 'text-emerald-500/80' : 'text-muted-foreground/40')}>
                {repo.webhook_id ? 'Live' : 'No webhook'}
              </span>
            </div>
            {repo.last_synced_at && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/40">
                <RefreshCw className="h-2.5 w-2.5" />
                {new Date(repo.last_synced_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { isGithubConnected, connectGithub } = useGithubConnect()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)
  const [createOrgOpen, setCreateOrgOpen] = useState(false)
  const [connectingRepo, setConnectingRepo] = useState<string | null>(null)
  const [repoToDisconnect, setRepoToDisconnect] = useState<Repository | null>(null)

  const orgsQuery = useQuery<OrgWithMembers[]>({
    queryKey: ['orgs'],
    queryFn: async () => {
      try {
        const res = await api.get('/orgs')
        return res.data.data
      } catch (err: any) {
        // Only fallback to /organizations if the /orgs endpoint doesn't exist (404)
        if (err?.response?.status === 404) {
          const res = await api.get('/organizations')
          return res.data.data
        }
        throw err
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const orgs = orgsQuery.data ?? []
  const activeOrgId = selectedOrgId ?? (orgs[0]?.id ? String(orgs[0].id) : null)
  const activeOrg = orgs.find((o) => String(o.id) === activeOrgId)

  const reposQuery = useQuery<Repository[]>({
    queryKey: ['repos', activeOrgId],
    queryFn: () => api.get(`/repos/org/${activeOrgId}`).then((r) => r.data.data),
    enabled: !!activeOrgId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const availableReposQuery = useQuery<AvailableRepo[]>({
    queryKey: ['available-repos'],
    queryFn: () => api.get('/repos/available').then((r) => r.data.data),
    enabled: connectOpen && !!activeOrgId && isGithubConnected,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const connectMutation = useMutation({
    mutationFn: (payload: { orgId: number; fullName: string }) =>
      api.post('/repos/connect', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repos', activeOrgId] })
      setConnectOpen(false)
      setConnectingRepo(null)
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (repoId: number) =>
      api.delete(`/repos/${repoId}?orgId=${activeOrgId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repos', activeOrgId] })
      qc.invalidateQueries({ queryKey: ['available-repos'] })
      setRepoToDisconnect(null)
    },
  })

  const handleConnect = (fullName: string) => {
    if (!activeOrgId) return
    setConnectingRepo(fullName)
    connectMutation.mutate({ orgId: Number(activeOrgId), fullName })
  }

  const repos = reposQuery.data ?? []
  const availableRepos = availableReposQuery.data ?? []

  const connectError = connectMutation.isError
    ? ((connectMutation.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to connect repository.')
    : null

  const disconnectError = disconnectMutation.isError
    ? ((disconnectMutation.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to disconnect repository.')
    : null

  return (
    <div className="space-y-8">
      <CreateOrgModal
        open={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
        onCreated={(newId) => setSelectedOrgId(newId)}
      />

      <DisconnectConfirmModal
        open={!!repoToDisconnect}
        onClose={() => setRepoToDisconnect(null)}
        repoName={repoToDisconnect?.name ?? null}
        isPending={disconnectMutation.isPending}
        onConfirm={() => {
          if (repoToDisconnect) {
            disconnectMutation.mutate(repoToDisconnect.id)
          }
        }}
        error={disconnectError}
      />

      <ConnectModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        activeOrgId={activeOrgId}
        orgs={orgs}
        onSelectOrg={(v) => setSelectedOrgId(v)}
        onCreateOrg={() => {
          setConnectOpen(false)
          setCreateOrgOpen(true)
        }}
        availableRepos={availableRepos}
        isLoadingRepos={availableReposQuery.isLoading}
        isPending={connectMutation.isPending}
        connectingRepo={connectingRepo}
        onConnect={handleConnect}
        error={connectError}
        isGithubConnected={isGithubConnected}
        onConnectGithub={connectGithub}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Monitor DORA metrics across your connected repositories.
          </p>
        </div>

        <Button
          id="connect-repo-btn"
          type="button"
          onClick={() => setConnectOpen(true)}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4',
            'bg-indigo-600 text-white hover:bg-indigo-500',
            'shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30',
            'transition-all duration-200',
          )}
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 w-fit">
        <Building2 className="h-4 w-4 text-muted-foreground/60 shrink-0" />
        <span className="text-xs font-medium text-muted-foreground/60 shrink-0">Organization</span>
        <div className="w-px h-4 bg-white/10" />
        {orgsQuery.isLoading ? (
          <div className="h-6 w-40 rounded-md bg-white/10 animate-pulse" />
        ) : (
          <OrgSelect
            orgs={orgs}
            value={activeOrgId}
            onChange={setSelectedOrgId}
            onCreateOrg={() => setCreateOrgOpen(true)}
          />
        )}
        {activeOrg && (
          <Badge variant="outline" className="text-[10px] h-5 border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
            {activeOrg.slug}
          </Badge>
        )}
      </div>

      {reposQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          ))}
        </div>
      )}

      {!reposQuery.isLoading && repos.length === 0 && activeOrgId && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] mb-4">
            <GitBranch className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-base font-semibold text-muted-foreground">No repositories connected</p>
          <p className="text-sm text-muted-foreground/50 mt-1 mb-5">
            Connect a GitHub repository to start tracking DORA metrics.
          </p>
          <Button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect Repository
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {!orgsQuery.isLoading && orgs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-base font-semibold text-muted-foreground">No organization found</p>
          <p className="text-sm text-muted-foreground/50 mt-1 mb-5">
            Create an organization to manage your repositories and track metrics.
          </p>
          <Button
            type="button"
            onClick={() => setCreateOrgOpen(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {repos.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">
              {repos.length} {repos.length === 1 ? 'Repository' : 'Repositories'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                onClick={() => router.push(`/repos/${repo.id}`)}
                onDisconnect={() => setRepoToDisconnect(repo)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
