import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

export function useGithubConnect() {
  const { user } = useAuthStore()
  const isGithubConnected = Boolean(user?.github_username)

  const connectGithub = async () => {
    try {
      const res = await api.post('/auth/github/connect')
      const targetUrl = res.data?.url || res.data?.redirectUrl || res.request?.responseURL
      if (targetUrl) {
        window.location.href = targetUrl
      }
    } catch (err: any) {
      if (err.response?.request?.responseURL) {
        window.location.href = err.response.request.responseURL
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
        window.location.href = `${baseUrl}/auth/github/connect`
      }
    }
  }

  return {
    isGithubConnected,
    githubUsername: user?.github_username || null,
    connectGithub,
  }
}
