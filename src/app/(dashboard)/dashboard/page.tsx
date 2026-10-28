'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Plus,
  ChevronDown,
  Check,
  X,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react'
import api from '@/lib/axios'
import { Organization, Repository, RecentDeployment } from '@/types/api'
import { cn } from '@/lib/utils'
import { useGithubConnect } from '@/hooks/useGithubConnect'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useOrgRole } from '@/hooks/useOrgRole'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No deployments yet'
  const diff = Date.now() - new Date(dateStr).getTime()
  if (isNaN(diff) || diff < 0) return 'just now'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 365) return `${days} day${days === 1 ? '' : 's'} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

// ─── OrgSelect ────────────────────────────────────────────────────────────────

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
        className="fm-btn-quiet flex h-8 items-center gap-2 px-3 text-sm"
        style={{
          borderRadius: 4,
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <span className="max-w-40 truncate">
          {selected ? selected.name : 'Select organization'}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          style={{ color: 'var(--fm-text-muted)' }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-56 overflow-hidden"
          style={{
            background: 'var(--fm-surface-raised)',
            border: '1px solid var(--fm-line)',
            borderRadius: 4,
          }}
        >
          {orgs.length === 0 ? (
            <div className="p-3 text-center text-sm space-y-2" style={{ color: 'var(--fm-text-muted)' }}>
              <p>No organizations found.</p>
              <button
                type="button"
                onClick={() => { setOpen(false); onCreateOrg() }}
                className="fm-btn-accent w-full"
                style={{ fontSize: 12 }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create organization</span>
              </button>
            </div>
          ) : (
            <div className="py-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => { onChange(String(org.id)); setOpen(false) }}
                  className="fm-sidebar-link flex w-full items-center gap-2 px-3 py-2 text-sm"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ibm-plex-sans)',
                    fontSize: 13,
                  }}
                >
                  <span className="flex-1 text-left truncate">{org.name}</span>
                  {String(org.id) === value && (
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--fm-accent)' }} />
                  )}
                </button>
              ))}
              <div className="mt-1 pt-1 px-1" style={{ borderTop: '1px solid var(--fm-line)' }}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); onCreateOrg() }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--fm-accent)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    borderRadius: 4,
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create organization
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CreateOrgModal ────────────────────────────────────────────────────────────

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
    mutationFn: (payload: { name: string; github_org_name: string }) =>
      api.post('/orgs', payload).catch((err) => {
        if (err.response?.status === 404) return api.post('/organizations', payload)
        throw err
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['orgs'] })
      const newOrg = res.data?.data
      if (newOrg?.id) onCreated(String(newOrg.id))
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
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent
        className="max-w-md p-6"
        showCloseButton={false}
        style={{
          background: 'var(--fm-surface-raised)',
          border: '1px solid var(--fm-line)',
          borderRadius: 4,
        }}
      >
        <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid var(--fm-line)' }}>
          <span
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fm-text)',
            }}
          >
            Create organization
          </span>
          <button
            type="button"
            onClick={onClose}
            className="fm-btn-quiet flex h-7 w-7 items-center justify-center p-0"
            style={{ borderRadius: 4 }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block mb-1"
              style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11, color: 'var(--fm-text-muted)' }}
            >
              Organization name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
              className="input-underline"
            />
          </div>

          <div>
            <label
              className="block mb-1"
              style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 11, color: 'var(--fm-text-muted)' }}
            >
              GitHub org name (optional)
            </label>
            <input
              type="text"
              value={githubOrg}
              onChange={(e) => setGithubOrg(e.target.value)}
              placeholder="acme-inc"
              className="input-underline"
            />
          </div>

          {errorMsg && (
            <p style={{ fontSize: 12, color: 'var(--fm-status-poor)' }}>{errorMsg}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="fm-btn-quiet"
            >
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="fm-btn-accent"
            >
              <span>{mutation.isPending ? 'Creating...' : 'Create organization'}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── ConnectModal ─────────────────────────────────────────────────────────────

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
  isRepoError,
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
  isRepoError: boolean
  onConnectGithub: () => void
}) {
  const showGithubConnect = !isGithubConnected || isRepoError

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent
        className="flex flex-col w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl p-0 overflow-hidden"
        showCloseButton={false}
        style={{
          background: 'var(--fm-surface-raised)',
          border: '1px solid var(--fm-line)',
          borderRadius: 4,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--fm-line)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fm-text)',
            }}
          >
            Connect a repository
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--fm-text-muted)', cursor: 'pointer', borderRadius: 4 }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 w-full min-w-0">
          {showGithubConnect ? (
            <div
              className="p-6 text-center space-y-3"
              style={{ background: 'var(--fm-surface)', borderRadius: 4, border: '1px solid var(--fm-line)' }}
            >
              <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: 14, color: 'var(--fm-text)' }}>
                GitHub authorization required
              </p>
              <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
                To connect repositories, you must first link your GitHub account.
              </p>
              <button
                type="button"
                onClick={onConnectGithub}
                className="btn-accent mx-auto"
              >
                Connect GitHub account
              </button>
            </div>
          ) : !activeOrgId ? (
            <div
              className="p-4 space-y-3"
              style={{ background: 'var(--fm-surface)', borderRadius: 4, border: '1px solid var(--fm-line)' }}
            >
              <p style={{ fontSize: 13, color: 'var(--fm-text)', fontFamily: 'var(--font-ibm-plex-sans)', fontWeight: 500 }}>
                Select or create an organization first
              </p>
              <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
                You need an active organization to link repositories.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {orgs.length > 0 && (
                  <OrgSelect orgs={orgs} value={activeOrgId} onChange={onSelectOrg} onCreateOrg={onCreateOrg} />
                )}
                <button
                  type="button"
                  onClick={onCreateOrg}
                  className="btn-accent"
                  style={{ fontSize: 12 }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create organization
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 w-full min-w-0">
              {isLoadingRepos && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-14" />
                  ))}
                </div>
              )}
              {!isLoadingRepos && availableRepos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p style={{ fontSize: 14, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
                    No repositories found.
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', marginTop: 4, opacity: 0.7 }}>
                    Ensure your GitHub token has repository access.
                  </p>
                </div>
              )}
              {availableRepos.map((repo) => (
                <div
                  key={repo.github_repo_id}
                  className="flex items-center justify-between gap-3 p-3 w-full min-w-0"
                  style={{
                    background: 'var(--fm-surface)',
                    border: '1px solid var(--fm-line)',
                    borderRadius: 4,
                  }}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <div
                      className="font-medium text-sm truncate"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--fm-text)' }}
                      title={repo.full_name}
                    >
                      {repo.full_name}
                    </div>
                    {repo.description && (
                      <div
                        className="text-xs truncate block"
                        style={{ color: 'var(--fm-text-muted)', marginTop: 2 }}
                        title={repo.description}
                      >
                        {repo.description}
                      </div>
                    )}
                  </div>
                  <button
                    id={`connect-${repo.github_repo_id}`}
                    disabled={isPending && connectingRepo === repo.full_name}
                    onClick={() => onConnect(repo.full_name)}
                    className="fm-btn-accent shrink-0 whitespace-nowrap"
                    style={{ fontSize: 12, padding: '6px 14px' }}
                  >
                    <span>{isPending && connectingRepo === repo.full_name ? 'Connecting...' : 'Connect'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: 'var(--fm-status-poor)' }}>{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── DisconnectConfirmModal ────────────────────────────────────────────────────

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
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent
        className="max-w-md p-6 space-y-4"
        showCloseButton={false}
        style={{
          background: 'var(--fm-surface-raised)',
          border: '1px solid var(--fm-line)',
          borderRadius: 4,
        }}
      >
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--fm-line)' }}>
          <span
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fm-text)',
            }}
          >
            Disconnect repository
          </span>
          <button
            type="button"
            onClick={onClose}
            className="fm-btn-quiet flex h-7 w-7 items-center justify-center p-0"
            style={{ borderRadius: 4 }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)', lineHeight: 1.6 }}>
          Disconnect{' '}
          <strong style={{ color: 'var(--fm-text)', fontWeight: 600 }}>{repoName}</strong>?
          Webhook tracking will stop and the repository will be unlinked. Analytics data is preserved.
        </p>

        {error && <p style={{ fontSize: 12, color: 'var(--fm-status-poor)' }}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="fm-btn-quiet">
            <span>Cancel</span>
          </button>
          <button
            id="confirm-disconnect-btn"
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="fm-btn-destructive"
            style={{
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span>{isPending ? 'Disconnecting...' : 'Disconnect'}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Row menu ─────────────────────────────────────────────────────────────────

function RepoRowMenu({ onDisconnect }: { onDisconnect: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Row actions"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="fm-btn-quiet flex h-7 w-7 items-center justify-center p-0"
        style={{ borderRadius: 4 }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-40"
          style={{
            background: 'var(--fm-surface-raised)',
            border: '1px solid var(--fm-line)',
            borderRadius: 4,
          }}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onDisconnect() }}
            className="fm-btn-destructive flex w-full items-center px-3 py-2 text-sm justify-start"
            style={{ border: 'none' }}
          >
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Repo row with its own deployment query ────────────────────────────────────

function RepoRow({
  repo,
  onClick,
  onDisconnect,
  canDelete,
}: {
  repo: Repository
  onClick: () => void
  onDisconnect?: () => void
  canDelete: boolean
}) {
  const recentDeployQuery = useQuery({
    queryKey: ['recent-deployments', repo.id],
    queryFn: async () => {
      try {
        const res = await api.get(`/analytics/deployments/recent?repoId=${repo.id}&limit=1`)
        return (res.data?.data as RecentDeployment[]) ?? []
      } catch {
        return []
      }
    },
    enabled: Boolean(repo?.id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const lastDeploy = recentDeployQuery.data?.[0]

  const statusCell = () => {
    if (recentDeployQuery.isLoading) {
      return <span style={{ color: 'var(--fm-text-muted)', fontSize: 12 }}>-</span>
    }
    if (!lastDeploy) {
      return <span style={{ color: 'var(--fm-text-muted)', fontSize: 12 }}>-</span>
    }
    const color =
      lastDeploy.status === 'success'
        ? 'var(--fm-status-good)'
        : 'var(--fm-status-poor)'
    return (
      <span
        style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          fontSize: 12,
          color,
        }}
      >
        {lastDeploy.status === 'success' ? 'success' : 'failed'}
      </span>
    )
  }

  const lastDeployCell = () => {
    if (recentDeployQuery.isLoading) {
      return <div className="skeleton h-4 w-24" />
    }
    if (!lastDeploy || !lastDeploy.deployed_at) {
      return (
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: 13,
            color: 'var(--fm-text-muted)',
          }}
        >
          No deployments yet
        </span>
      )
    }
    return (
      <span
        style={{
          fontFamily: 'var(--font-ibm-plex-sans)',
          fontSize: 13,
          color: 'var(--fm-text-muted)',
        }}
        title={new Date(lastDeploy.deployed_at).toLocaleString()}
      >
        {relativeTime(lastDeploy.deployed_at)}
      </span>
    )
  }

  return (
    <tr
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--fm-line)' }}>
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 13,
            color: 'var(--fm-text)',
            fontWeight: 500,
          }}
        >
          {repo.name}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: 11,
            color: 'var(--fm-text-muted)',
            display: 'block',
          }}
        >
          {repo.full_name}
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--fm-line)' }}>
        <span
          style={{
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 12,
            color: 'var(--fm-text-muted)',
          }}
        >
          {repo.default_branch}
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--fm-line)' }}>
        {lastDeployCell()}
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--fm-line)' }}>
        {statusCell()}
      </td>
      <td
        style={{ padding: '12px 8px 12px 0', borderBottom: '1px solid var(--fm-line)', textAlign: 'right', width: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        {canDelete && onDisconnect && (
          <RepoRowMenu onDisconnect={onDisconnect} />
        )}
      </td>
    </tr>
  )
}

// ─── Table skeleton ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div style={{ border: '1px solid var(--fm-line)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ background: 'var(--fm-surface)', padding: '10px 16px', borderBottom: '1px solid var(--fm-line)' }}>
        <div className="flex gap-8">
          {['Repository', 'Branch', 'Last deploy', 'Status'].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: 'var(--font-ibm-plex-mono)',
                fontSize: 12,
                color: 'var(--fm-text-muted)',
              }}
            >
              {h}
            </span>
          ))}
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-8 px-4 py-3"
          style={{ borderBottom: '1px solid var(--fm-line)' }}
        >
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-4 w-14" />
        </div>
      ))}
    </div>
  )
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { isGithubConnected, connectGithub } = useGithubConnect()
  const {
    canConnectRepo,
    canDeleteRepo,
    activeOrgId: ctxOrgId,
    setActiveOrgId: setCtxOrgId,
    isLoading: isRoleLoading,
  } = useOrgRole()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)
  const [createOrgOpen, setCreateOrgOpen] = useState(false)
  const [connectingRepo, setConnectingRepo] = useState<string | null>(null)
  const [repoToDisconnect, setRepoToDisconnect] = useState<Repository | null>(null)

  useEffect(() => {
    if (ctxOrgId && !selectedOrgId) {
      setSelectedOrgId(String(ctxOrgId))
    }
  }, [ctxOrgId, selectedOrgId])

  const handleSelectOrg = (id: string) => {
    setSelectedOrgId(id)
    setCtxOrgId(id)
  }

  const orgsQuery = useQuery<OrgWithMembers[]>({
    queryKey: ['orgs'],
    queryFn: async () => {
      try {
        const res = await api.get('/orgs')
        return res.data.data
      } catch {
        const fallback = await api.get('/organizations')
        return fallback.data.data
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const orgs = orgsQuery.data ?? []
  const activeOrg = orgs.find((o) => String(o.id) === selectedOrgId) ?? orgs[0] ?? null
  const activeOrgId = activeOrg ? String(activeOrg.id) : null

  const reposQuery = useQuery<Repository[]>({
    queryKey: ['repos', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return []
      const res = await api.get(`/repos/org/${activeOrgId}`)
      return res.data.data
    },
    enabled: !!activeOrgId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const availableReposQuery = useQuery<AvailableRepo[]>({
    queryKey: ['available-repos'],
    queryFn: async () => {
      const res = await api.get('/repos/available')
      return res.data.data
    },
    enabled: connectOpen && !!activeOrgId && isGithubConnected,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const connectMutation = useMutation({
    mutationFn: async (payload: { orgId: number; fullName: string }) => {
      return await api.post('/repos/connect', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repos', activeOrgId] })
      setConnectOpen(false)
      setConnectingRepo(null)
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: async (repoId: number) => {
      return await api.delete(`/repos/${repoId}?orgId=${activeOrgId}`)
    },
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

  const isLoading = reposQuery.isLoading || isRoleLoading

  return (
    <div style={{ maxWidth: 1120, padding: '32px 24px' }}>
      {/* Modals */}
      <CreateOrgModal
        open={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
        onCreated={(newId) => handleSelectOrg(newId)}
      />
      <DisconnectConfirmModal
        open={!!repoToDisconnect}
        onClose={() => setRepoToDisconnect(null)}
        repoName={repoToDisconnect?.name ?? null}
        isPending={disconnectMutation.isPending}
        onConfirm={() => { if (repoToDisconnect) disconnectMutation.mutate(repoToDisconnect.id) }}
        error={disconnectError}
      />
      <ConnectModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        activeOrgId={activeOrgId}
        orgs={orgs}
        onSelectOrg={handleSelectOrg}
        onCreateOrg={() => { setConnectOpen(false); setCreateOrgOpen(true) }}
        availableRepos={availableRepos}
        isLoadingRepos={availableReposQuery.isLoading}
        isPending={connectMutation.isPending}
        connectingRepo={connectingRepo}
        onConnect={handleConnect}
        error={connectError}
        isGithubConnected={isGithubConnected}
        isRepoError={availableReposQuery.isError}
        onConnectGithub={connectGithub}
      />

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--fm-text)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', marginTop: 6, fontFamily: 'var(--font-ibm-plex-sans)' }}>
            DORA metrics across connected repositories.
          </p>
        </div>

        {!isLoading && canConnectRepo && (
          <button
            id="connect-repo-btn"
            type="button"
            onClick={() => setConnectOpen(true)}
            className="fm-btn-accent flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Connect repository</span>
          </button>
        )}
      </div>

      {/* Org selector */}
      <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
          Organization
        </span>
        {orgsQuery.isLoading ? (
          <div className="skeleton h-8 w-40" />
        ) : (
          <OrgSelect
            orgs={orgs}
            value={activeOrgId}
            onChange={handleSelectOrg}
            onCreateOrg={() => setCreateOrgOpen(true)}
          />
        )}
      </div>

      {/* Table skeleton while loading */}
      {isLoading && <TableSkeleton />}

      {/* No orgs state */}
      {!orgsQuery.isLoading && orgs.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ border: '1px solid var(--fm-line)', borderRadius: 4 }}
        >
          <Building2 className="h-6 w-6" style={{ color: 'var(--fm-text-muted)', marginBottom: 16, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--fm-text)', marginBottom: 8 }}>
            No organization found
          </p>
          <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)', marginBottom: 24 }}>
            Create an organization to manage repositories and track metrics.
          </p>
          <button
            type="button"
            onClick={() => setCreateOrgOpen(true)}
            className="fm-btn-accent flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create organization</span>
          </button>
        </div>
      )}

      {/* Empty repos state */}
      {!isLoading && repos.length === 0 && activeOrgId && (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ border: '1px solid var(--fm-line)', borderRadius: 4 }}
        >
          <p style={{ fontSize: 15, fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--fm-text)', marginBottom: 8 }}>
            No repositories connected
          </p>
          {canConnectRepo ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)', marginBottom: 24 }}>
                Connect a GitHub repository to start tracking DORA metrics.
              </p>
              <button
                id="empty-connect-repo-btn"
                type="button"
                onClick={() => setConnectOpen(true)}
                className="fm-btn-accent flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Connect repository</span>
              </button>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
              Ask your org owner to connect a GitHub repository.
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {reposQuery.isError && (
        <div
          className="flex items-center gap-3 p-4"
          style={{ border: '1px solid color-mix(in srgb, var(--fm-status-poor) 30%, transparent)', borderRadius: 4, background: 'color-mix(in srgb, var(--fm-status-poor) 8%, transparent)' }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--fm-status-poor)' }} />
          <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
            Failed to load repositories. Please refresh.
          </p>
        </div>
      )}

      {/* Repos table */}
      {!isLoading && repos.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 12, color: 'var(--fm-text-muted)' }}>
              {repos.length} {repos.length === 1 ? 'repository' : 'repositories'}
            </span>
          </div>

          <div style={{ border: '1px solid var(--fm-line)', borderRadius: 4, overflow: 'hidden' }}>
            <table className="fm-table" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '35%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Repository</th>
                  <th>Branch</th>
                  <th>Last deploy</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {repos.map((repo) => (
                  <RepoRow
                    key={repo.id}
                    repo={repo}
                    onClick={() => router.push(`/repos/${repo.id}`)}
                    onDisconnect={canDeleteRepo ? () => setRepoToDisconnect(repo) : undefined}
                    canDelete={canDeleteRepo}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}