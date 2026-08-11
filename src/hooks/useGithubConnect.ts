import { useAuthStore } from '@/store/authStore'

export function useGithubConnect() {
  const { user } = useAuthStore()
  const isGithubConnected = Boolean(user?.github_username)

  const connectGithub = () => {
    const token = localStorage.getItem('accessToken') || ''
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    window.location.href = `${baseUrl}/auth/github/connect?token=${encodeURIComponent(token)}`
  }

  return {
    isGithubConnected,
    githubUsername: user?.github_username || null,
    connectGithub,
  }
}
