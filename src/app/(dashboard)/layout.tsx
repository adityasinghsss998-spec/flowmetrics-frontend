'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (!isAuthenticated && !storedToken) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  // Prevent flash of authenticated content while redirecting
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (!isAuthenticated && !storedToken) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — handles its own desktop/mobile rendering */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top navbar (dashboard variant) — shows hamburger for mobile */}
        <Navbar
          variant="dashboard"
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Page content */}
        <main
          id="dashboard-main"
          className="flex-1 overflow-y-auto p-4 lg:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
