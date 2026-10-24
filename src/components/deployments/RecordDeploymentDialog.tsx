'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import api from '@/lib/axios'

interface RecordDeploymentDialogProps {
  repoId: number
  orgId: number
  onSuccess: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RecordDeploymentDialog({
  repoId,
  orgId,
  onSuccess,
  open,
  onOpenChange
}: RecordDeploymentDialogProps) {
  const toLocalISOString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const YYYY = date.getFullYear()
    const MM = pad(date.getMonth() + 1)
    const DD = pad(date.getDate())
    const hh = pad(date.getHours())
    const mm = pad(date.getMinutes())
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`
  }

  const getDefaultCompletedAt = () => {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 10)
    return toLocalISOString(d)
  }

  const [environment, setEnvironment] = useState('production')
  const [status, setStatus] = useState('success')
  const [sha, setSha] = useState('')
  const [deployedByUsername, setDeployedByUsername] = useState('')
  const [deployedAt, setDeployedAt] = useState(toLocalISOString(new Date()))
  const [completedAt, setCompletedAt] = useState(getDefaultCompletedAt())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const getBuildDuration = () => {
    if (!deployedAt) return 0
    const start = new Date(deployedAt)
    const end = completedAt ? new Date(completedAt) : new Date()
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diff = (end.getTime() - start.getTime()) / (1000 * 60)
    return Math.max(0, Math.round(diff))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const depDate = new Date(deployedAt)
    if (isNaN(depDate.getTime())) {
      setErrorMsg('Please provide a valid started at date/time')
      return
    }

    let compIso: string | undefined = undefined
    if (completedAt) {
      const compDate = new Date(completedAt)
      if (isNaN(compDate.getTime())) {
        setErrorMsg('Please provide a valid completed at date/time')
        return
      }
      compIso = compDate.toISOString()
    }

    setIsSubmitting(true)

    try {
      await api.post(`/repos/${repoId}/deployments?orgId=${orgId}`, {
        environment,
        status,
        sha: sha.trim() || undefined,
        deployedByUsername: deployedByUsername.trim() || undefined,
        deployedAt: depDate.toISOString(),
        completedAt: compIso
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record deployment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-[var(--fm-line)] bg-[var(--fm-surface-raised)] p-6">
        <DialogHeader>
          <DialogTitle className="font-mono text-base font-semibold text-[var(--fm-text)]">Record Deployment</DialogTitle>
          <DialogDescription className="text-xs text-[var(--fm-text-muted)]">
            Manually log a deployment event for this repository.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="environment" className="font-mono text-xs text-[var(--fm-text-muted)]">Environment</Label>
              <Select value={environment} onValueChange={(val) => { if (val) setEnvironment(val) }}>
                <SelectTrigger id="environment" className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent className="border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="font-mono text-xs text-[var(--fm-text-muted)]">Status</Label>
              <Select value={status} onValueChange={(val) => { if (val) setStatus(val) }}>
                <SelectTrigger id="status" className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs">
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sha" className="font-mono text-xs text-[var(--fm-text-muted)]">Commit SHA (Optional)</Label>
            <Input
              id="sha"
              maxLength={40}
              placeholder="e.g. 7b3d1f8"
              value={sha}
              onChange={(e) => setSha(e.target.value)}
              className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deployedBy" className="font-mono text-xs text-[var(--fm-text-muted)]">Deployed By (Optional)</Label>
            <Input
              id="deployedBy"
              placeholder="GitHub username"
              value={deployedByUsername}
              onChange={(e) => setDeployedByUsername(e.target.value)}
              className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deployedAt" className="font-mono text-xs text-[var(--fm-text-muted)]">Started At *</Label>
              <Input
                id="deployedAt"
                type="datetime-local"
                required
                value={deployedAt}
                onChange={(e) => setDeployedAt(e.target.value)}
                className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="completedAt" className="font-mono text-xs text-[var(--fm-text-muted)]">Completed At</Label>
              <Input
                id="completedAt"
                type="datetime-local"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                className="h-8 border-[var(--fm-line)] bg-[var(--fm-surface)] font-mono text-xs"
              />
            </div>
          </div>

          <div className="font-mono text-xs text-[var(--fm-text-muted)] pt-1">
            Build duration: <span className="text-[var(--fm-text)] tabular-nums">{getBuildDuration()} minutes</span>
          </div>

          {errorMsg && (
            <p className="font-mono text-xs text-[var(--fm-status-poor)]">{errorMsg}</p>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--fm-line)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Recording…' : 'Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
