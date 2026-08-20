import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

export function useGithubConnect() {
  const { user } = useAuthStore()
  const isGithubConnected = Boolean(user?.github_username)

  const connectGithub = () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
      const userId = user?.id
      if (userId) {
        window.location.href = `${baseUrl}/auth/github/connect?userId=${userId}`
      } else {
        window.location.href = `${baseUrl}/auth/github`
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  return {
    isGithubConnected,
    githubUsername: user?.github_username || null,
    connectGithub,
  }
}
