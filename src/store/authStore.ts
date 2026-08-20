import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/axios'

interface User {
  id: number
  name: string
  email: string
  github_username: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setTokens: (payload: { accessToken: string; refreshToken: string; user: User }) => void
  setUser: (user: User) => void
  fetchMe: () => Promise<User | null>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          const userData = data.data
          if (userData) {
            set({ user: userData })
            return userData
          }
          return null
        } catch {
          return null
        }
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('githubToken')
        localStorage.removeItem('flowmetrics-auth')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    { name: 'flowmetrics-auth' }
  )
)
