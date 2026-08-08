import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Pass github token if stored (needed for /repos routes)
  const githubToken = localStorage.getItem('githubToken')
  if (githubToken) config.headers['x-github-token'] = githubToken

  return config
})

// Silent token refresh on 401
let isRefreshing = false
let subscribers: ((token: string) => void)[] = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribers.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        )

        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        isRefreshing = false
        subscribers.forEach((cb) => cb(newToken))
        subscribers = []

        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        isRefreshing = false
        subscribers = []
        localStorage.clear()
        // Also clear the Zustand store
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
