'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { Organization } from '@/types/api'

export type OrgRole = 'owner' | 'admin' | 'member' | null

export interface OrgWithMembers extends Organization {
  members?: {
    id: number
    name: string
    email: string
    OrgMember?: { role: string }
    role?: string
  }[]
}

export interface MemberRoleContextType {
  role: OrgRole
  activeOrg: OrgWithMembers | null
  activeOrgId: number | null
  setActiveOrgId: (id: number | string | null) => void
  isLoading: boolean
  isOwner: boolean
  isAdmin: boolean
  isMember: boolean
  canManageOrg: boolean
  canManageMembers: boolean
  canConnectRepo: boolean
  canDeleteRepo: boolean
  canInvite: boolean
  refetchRole: () => void
}

const MemberRoleContext = React.createContext<MemberRoleContextType>({
  role: null,
  activeOrg: null,
  activeOrgId: null,
  setActiveOrgId: () => {},
  isLoading: false,
  isOwner: false,
  isAdmin: false,
  isMember: false,
  canManageOrg: false,
  canManageMembers: false,
  canConnectRepo: false,
  canDeleteRepo: false,
  canInvite: false,
  refetchRole: () => {},
})

export function MemberRoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | string | null>(null)

  const orgsQuery = useQuery<OrgWithMembers[]>({
    queryKey: ['orgs'],
    queryFn: async () => {
      try {
        const response = await api.get('/orgs')
        return response.data.data
      } catch {
        const fallback = await api.get('/organizations')
        return fallback.data.data
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const orgs = orgsQuery.data ?? []
  const activeOrg = React.useMemo(() => {
    if (!orgs.length) return null
    if (selectedOrgId) {
      const found = orgs.find((o) => String(o.id) === String(selectedOrgId))
      if (found) return found
    }
    return orgs[0]
  }, [orgs, selectedOrgId])

  const role = React.useMemo<OrgRole>(() => {
    if (!activeOrg || !user) return null
    if (activeOrg.owner_id === user.id) return 'owner'
    const member = activeOrg.members?.find((m) => m.id === user.id)
    if (member?.OrgMember?.role) {
      return member.OrgMember.role as OrgRole
    }
    if (member?.role) {
      return member.role as OrgRole
    }
    return 'member'
  }, [activeOrg, user])

  const isOwner = role === 'owner'
  const isAdmin = role === 'admin'
  const isMember = role === 'member'
  const canManageOrg = isOwner || isAdmin
  const canManageMembers = isOwner
  const canConnectRepo = isOwner || isAdmin
  const canDeleteRepo = isOwner || isAdmin
  const canInvite = isOwner || isAdmin

  return (
    <MemberRoleContext.Provider
      value={{
        role,
        activeOrg,
        activeOrgId: activeOrg ? activeOrg.id : null,
        setActiveOrgId: setSelectedOrgId,
        isLoading: orgsQuery.isLoading,
        isOwner,
        isAdmin,
        isMember,
        canManageOrg,
        canManageMembers,
        canConnectRepo,
        canDeleteRepo,
        canInvite,
        refetchRole: () => {
          orgsQuery.refetch()
        },
      }}
    >
      {children}
    </MemberRoleContext.Provider>
  )
}

export function useMemberRole() {
  const context = React.useContext(MemberRoleContext)
  if (!context) {
    throw new Error('useMemberRole must be used within a MemberRoleProvider')
  }
  return context
}

// Aliases for seamless compatibility
export const OrgRoleProvider = MemberRoleProvider
export const useOrgRole = useMemberRole
