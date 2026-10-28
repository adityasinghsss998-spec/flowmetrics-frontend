import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
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
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      fetchMe: async () => {
        try {
          const refreshToken =
            localStorage.getItem('refreshToken') || get().refreshToken
          if (refreshToken) {
            try {
              const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
              const { data: refreshRes } = await axios.post(
                `${baseUrl}/auth/refresh`,
                { refreshToken }
              )
              const newAccessToken = refreshRes?.data?.accessToken
              if (newAccessToken) {
                localStorage.setItem('accessToken', newAccessToken)
                set({ accessToken: newAccessToken })
                try {
                  const base64Url = newAccessToken.split('.')[1]
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  )
                  const decoded = JSON.parse(jsonPayload)
                  if (decoded?.id) {
                    set((state) => ({
                      user: {
                        id: decoded.id,
                        email: decoded.email,
                        name: decoded.name || state.user?.name || '',
                        github_username: decoded.github_username || '',
                      },
                    }))
                  }
                } catch (parseErr) {
                  console.error('Failed to parse decoded JWT', parseErr)
                }
              }
            } catch (refErr) {
              console.warn('Silent refresh in fetchMe failed', refErr)
            }
          }

          const { data } = await api.get('/auth/me')
          const userData = data.data
          if (userData) {
            set((state) => ({
              user: {
                ...state.user,
                ...userData,
                id: Number(userData.id),
                github_username: userData.github_username || state.user?.github_username || '',
              },
            }))
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
