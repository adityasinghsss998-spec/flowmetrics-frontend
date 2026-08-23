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
      
      alert("Deployment recorded successfully")
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
      <DialogContent className="sm:max-w-[425px] border-white/[0.08] bg-card p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Record Deployment</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manually record a deployment for this repository.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment" className="text-xs font-medium text-muted-foreground">Environment</Label>
              <Select value={environment} onValueChange={(val) => { if (val) setEnvironment(val) }}>
                <SelectTrigger id="environment" className="h-9 border-white/[0.08] bg-white/[0.03]">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={(val) => { if (val) setStatus(val) }}>
                <SelectTrigger id="status" className="h-9 border-white/[0.08] bg-white/[0.03]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sha" className="text-xs font-medium text-muted-foreground">Commit SHA (Optional)</Label>
            <Input
              id="sha"
              maxLength={40}
              placeholder="abc1234 (optional)"
              value={sha}
              onChange={(e) => setSha(e.target.value)}
              className="h-9 border-white/[0.08] bg-white/[0.03]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployedBy" className="text-xs font-medium text-muted-foreground">Deployed By (Optional)</Label>
            <Input
              id="deployedBy"
              placeholder="GitHub username"
              value={deployedByUsername}
              onChange={(e) => setDeployedByUsername(e.target.value)}
              className="h-9 border-white/[0.08] bg-white/[0.03]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deployedAt" className="text-xs font-medium text-muted-foreground">Started At *</Label>
              <Input
                id="deployedAt"
                type="datetime-local"
                required
                value={deployedAt}
                onChange={(e) => setDeployedAt(e.target.value)}
                className="h-9 border-white/[0.08] bg-white/[0.03]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completedAt" className="text-xs font-medium text-muted-foreground">Completed At</Label>
              <Input
                id="completedAt"
                type="datetime-local"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                className="h-9 border-white/[0.08] bg-white/[0.03]"
              />
            </div>
          </div>

          <div className="pt-2 text-sm text-muted-foreground/80 font-medium">
            Build duration: {getBuildDuration()} minutes
          </div>

          {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 border-white/[0.08] bg-transparent hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isSubmitting ? 'Recording...' : 'Record Deployment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
