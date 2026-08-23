'use client'

import * as React from 'react'
import {
  Users,
  GitBranch,
  Bell,
  Settings as SettingsIcon,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MembersTab } from '@/components/settings/MembersTab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrgRole } from '@/hooks/useOrgRole'
import { useGithubConnect } from '@/hooks/useGithubConnect'

export default function SettingsPage() {
  const { activeOrg, role } = useOrgRole()
  const { isGithubConnected, connectGithub } = useGithubConnect()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Workspace Configuration
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage organization members, connected repositories, and notification preferences.
            </p>
          </div>
          {activeOrg && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/60 text-xs">
              <span className="text-muted-foreground">Org:</span>
              <span className="font-semibold text-foreground">{activeOrg.name}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full space-y-6">
        <TabsList className="bg-card/60 border-border/50 p-1">
          <TabsTrigger value="members" className="gap-2 text-xs">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="repositories" className="gap-2 text-xs">
            <GitBranch className="h-4 w-4" />
            <span>Repositories</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab />
        </TabsContent>

        <TabsContent value="repositories" className="space-y-6">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-base font-semibold">GitHub Integration</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Connect your organization to GitHub to track commits, pull requests, and deployment events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-background/40 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <GitBranch className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">GitHub App Connection</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isGithubConnected
                        ? 'Your GitHub account is connected and granting repo access.'
                        : 'Connect GitHub to authorize repository sync and webhooks.'}
                    </p>
                  </div>
                </div>
                {isGithubConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <Button
                    onClick={connectGithub}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Connect GitHub
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-base font-semibold">Email Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Configure alerts and summaries sent by the notification service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-background/40">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Weekly DORA Digest</p>
                    <p className="text-xs text-muted-foreground">
                      Receive weekly summaries of cycle times, deployment velocity, and MTTR.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-medium">Enabled</span>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-background/40">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Anomaly & Spike Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Immediate email notification when deployment failure rates or lead time spike beyond thresholds.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-medium">Enabled</span>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-background/40">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Team Invitations</p>
                    <p className="text-xs text-muted-foreground">
                      Automated invite emails dispatched when new members are invited.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-medium">Enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
