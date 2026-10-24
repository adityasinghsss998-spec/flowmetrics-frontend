'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MembersTab } from '@/components/settings/MembersTab'
import { useOrgRole } from '@/hooks/useOrgRole'
import { useGithubConnect } from '@/hooks/useGithubConnect'

export default function SettingsPage() {
  const { activeOrg } = useOrgRole()
  const { isGithubConnected, connectGithub } = useGithubConnect()

  return (
    <div style={{ maxWidth: 900, padding: '32px 24px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
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
              Settings
            </h1>
            <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', marginTop: 6, fontFamily: 'var(--font-ibm-plex-sans)' }}>
              Manage organization members, connected repositories, and notifications.
            </p>
          </div>
          {activeOrg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                border: '1px solid var(--fm-line)',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'var(--font-ibm-plex-mono)',
                color: 'var(--fm-text-muted)',
              }}
            >
              <span style={{ opacity: 0.7 }}>Org:</span>
              <span style={{ color: 'var(--fm-text)', fontWeight: 500 }}>{activeOrg.name}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList
          className="p-1 mb-8"
          style={{
            background: 'var(--fm-surface)',
            border: '1px solid var(--fm-line)',
            borderRadius: 4,
          }}
        >
          <TabsTrigger
            value="members"
            className="text-xs"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', borderRadius: 2 }}
          >
            Members
          </TabsTrigger>
          <TabsTrigger
            value="repositories"
            className="text-xs"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', borderRadius: 2 }}
          >
            Repositories
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', borderRadius: 2 }}
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab />
        </TabsContent>

        <TabsContent value="repositories" className="space-y-6">
          {/* GitHub integration */}
          <section style={{ border: '1px solid var(--fm-line)', borderRadius: 4, background: 'var(--fm-surface)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fm-line)' }}>
              <h2 style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 14, fontWeight: 600, color: 'var(--fm-text)', margin: 0 }}>
                GitHub integration
              </h2>
              <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', marginTop: 4, fontFamily: 'var(--font-ibm-plex-sans)' }}>
                Connect your organization to GitHub to track commits, pull requests, and deployment events.
              </p>
            </div>
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, color: 'var(--fm-text)', fontWeight: 500 }}>
                  GitHub app connection
                </p>
                <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', marginTop: 4, fontFamily: 'var(--font-ibm-plex-sans)' }}>
                  {isGithubConnected
                    ? 'Your GitHub account is connected and granting repository access.'
                    : 'Connect GitHub to authorize repository sync and webhooks.'}
                </p>
              </div>
              {isGithubConnected ? (
                <span
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    fontSize: 12,
                    color: 'var(--fm-status-good)',
                    border: '1px solid color-mix(in srgb, var(--fm-status-good) 30%, transparent)',
                    borderRadius: 4,
                    padding: '4px 10px',
                  }}
                >
                  Connected
                </span>
              ) : (
                <button
                  onClick={connectGithub}
                  className="btn-accent"
                  style={{ fontSize: 12 }}
                >
                  Connect GitHub
                </button>
              )}
            </div>
          </section>

          {/* Repository management */}
          <section style={{ border: '1px solid var(--fm-line)', borderRadius: 4, background: 'var(--fm-surface)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fm-line)' }}>
              <h2 style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 14, fontWeight: 600, color: 'var(--fm-text)', margin: 0 }}>
                Connected repositories
              </h2>
              <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', marginTop: 4, fontFamily: 'var(--font-ibm-plex-sans)' }}>
                Link GitHub repositories to {activeOrg?.name || 'your organization'} to monitor DORA metrics.
              </p>
            </div>
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--fm-text-muted)', fontFamily: 'var(--font-ibm-plex-sans)' }}>
                Connect repositories from the dashboard.
              </p>
              <Link
                href="/dashboard"
                className="btn-accent flex items-center gap-2"
                style={{ fontSize: 12 }}
              >
                <Plus className="h-3.5 w-3.5" />
                Go to dashboard
              </Link>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <section style={{ border: '1px solid var(--fm-line)', borderRadius: 4, background: 'var(--fm-surface)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fm-line)' }}>
              <h2 style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 14, fontWeight: 600, color: 'var(--fm-text)', margin: 0 }}>
                Email notifications
              </h2>
              <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', marginTop: 4, fontFamily: 'var(--font-ibm-plex-sans)' }}>
                Alerts and summaries sent by the notification service.
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--fm-line)' }}>
              {[
                {
                  title: 'Weekly DORA digest',
                  desc: 'Weekly summary of cycle times, deployment velocity, and MTTR.',
                },
                {
                  title: 'Anomaly and spike alerts',
                  desc: 'Email when deployment failure rates or lead time exceed thresholds.',
                },
                {
                  title: 'Team invitations',
                  desc: 'Automated invite emails when new members are invited to the organization.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    borderTop: '1px solid var(--fm-line)',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 13, color: 'var(--fm-text)', fontWeight: 500 }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--fm-text-muted)', marginTop: 3, fontFamily: 'var(--font-ibm-plex-sans)' }}>
                      {item.desc}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-ibm-plex-mono)',
                      fontSize: 11,
                      color: 'var(--fm-status-good)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Enabled
                  </span>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
