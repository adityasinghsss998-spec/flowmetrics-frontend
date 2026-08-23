import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`

  const githubToken = localStorage.getItem('githubToken')
  if (githubToken) config.headers['x-github-token'] = githubToken

  return config
})

let isRefreshing = false

type RefreshSubscriber = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}
let subscribers: RefreshSubscriber[] = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isAuthEndpoint =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribers.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        )

        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        isRefreshing = false
        subscribers.forEach(({ resolve }) => resolve(newToken))
        subscribers = []

        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        isRefreshing = false
        subscribers.forEach(({ reject }) => reject(refreshErr))
        subscribers = []

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('githubToken')
        localStorage.removeItem('flowmetrics-auth')

        useAuthStore.getState().logout()

        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login?error=session_expired'
        }

        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api