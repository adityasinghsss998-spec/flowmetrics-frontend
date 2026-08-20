'use client'

export {
  MemberRoleProvider,
  MemberRoleProvider as OrgRoleProvider,
  useMemberRole,
  useMemberRole as useOrgRole,
} from '@/context/MemberRoleContext'
export type {
  OrgRole,
  OrgWithMembers,
  MemberRoleContextType,
  MemberRoleContextType as OrgRoleContextType,
} from '@/context/MemberRoleContext'
