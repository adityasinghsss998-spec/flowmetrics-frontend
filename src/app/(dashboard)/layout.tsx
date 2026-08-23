'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import { useSocket } from '@/hooks/useSocket'
import { OrgRoleProvider } from '@/hooks/useOrgRole'
import { PendingInvitesBanner } from '@/components/PendingInvitesBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const repoId = params?.repoId ? Number(params.repoId) : null
  useSocket(repoId)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('accessToken')
    if (!isAuthenticated && !token) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!mounted) {
    return null
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (!isAuthenticated && !token) {
    return null
  }

  return (
    <OrgRoleProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <PendingInvitesBanner />
          <Navbar
            variant="dashboard"
            onMenuClick={() => setMobileOpen(true)}
          />

          <main
            id="dashboard-main"
            className="flex-1 overflow-y-auto p-4 lg:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </OrgRoleProvider>
  )
}