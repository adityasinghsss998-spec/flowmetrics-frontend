'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

import { PendingInvitesBanner } from '@/components/PendingInvitesBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check Zustand store first, then fall back to localStorage
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
    <div className="min-h-screen bg-background flex flex-col">
      <PendingInvitesBanner />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
