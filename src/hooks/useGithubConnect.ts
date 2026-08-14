import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'

export function useGithubConnect() {
  const { user } = useAuthStore()
  const isGithubConnected = Boolean(user?.github_username)

  const connectGithub = async () => {
    try {
      // Make an authenticated API request to get the GitHub authorization URL
      // The access token is sent via the Authorization header (configured in axios interceptor)
      const response = await api.get('/auth/github/connect')
      const redirectUrl = response.data?.data?.url || response.data?.url

      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        // Fallback if the backend doesn't return a URL in the expected format
        // This still avoids passing the token in the URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
        window.location.href = `${baseUrl}/auth/github/connect`
      }
    } catch (error) {
      console.error('Failed to initiate GitHub connection:', error)
      // Fallback: redirect without token in URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
      window.location.href = `${baseUrl}/auth/github/connect`
    }
  }

  return {
    isGithubConnected,
    githubUsername: user?.github_username || null,
    connectGithub,
  }
}
