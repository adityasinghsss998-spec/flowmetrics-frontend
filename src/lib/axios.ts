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

    if (!original) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      Boolean(
        original?.url?.includes('/auth/login') ||
        original?.url?.includes('/auth/register') ||
        original?.url?.includes('/auth/refresh')
      )

    // Retry transient Render hibernation / cold start / rate-limit errors
    const status = error.response?.status
    const responseData = error.response?.data
    const isRenderHibernate =
      status === 429 &&
      (error.response?.headers?.['x-render-routing'] === 'hibernate-rate-limited' ||
        (typeof responseData === 'string' && responseData.includes('Too Many Requests')) ||
        (typeof responseData?.message === 'string' &&
          (responseData.message.includes('Too many requests') ||
           responseData.message.toLowerCase().includes('rate limit'))))

    const isColdStart =
      status === 502 ||
      status === 503 ||
      status === 504 ||
      isRenderHibernate ||
      (!error.response && error.message === 'Network Error')

    original._retryCount = (original._retryCount || 0) + 1
    if (!isAuthEndpoint && isColdStart && original._retryCount <= 4) {
      const delay = original._retryCount * 2500
      await new Promise((resolve) => setTimeout(resolve, delay))
      return api(original)
    }

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
          const currentPath = window.location.pathname + window.location.search
          window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`
        }

        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api