'use client'
import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useRealtimeStore } from '@/store/realtimeStore'

let socket: Socket | null = null

export const useSocket = (repoId: number | null) => {
  const queryClient = useQueryClient()
  const { setConnected, addEvent } = useRealtimeStore()

  useEffect(() => {
    if (!repoId) return

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      setConnected(true)
      socket!.emit('join:repo', { repoId })
    })

    socket.on('disconnect', () => setConnected(false))

    const invalidateOnEvent = (eventName: string, queryKeys: (string | number)[][]) => {
      socket!.on(eventName, (data: Record<string, unknown>) => {
        addEvent({ type: eventName, data, timestamp: new Date().toISOString() })
        queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      })
    }

    invalidateOnEvent('pr:merged', [
      ['dora', repoId],
      ['cycle-trend', repoId],
      ['contributors', repoId],
      ['open-prs', repoId],
    ])

    invalidateOnEvent('pr:opened', [
      ['open-prs', repoId],
    ])

    invalidateOnEvent('pr:closed', [
      ['open-prs', repoId],
    ])

    invalidateOnEvent('deployment:completed', [
      ['dora', repoId],
      ['deploy-frequency', repoId],
      ['build-duration', repoId],
      ['recent-deployments', repoId],
    ])

    invalidateOnEvent('deployment:failed', [
      ['dora', repoId],
      ['deploy-frequency', repoId],
      ['recent-deployments', repoId],
    ])

    invalidateOnEvent('anomaly:detected', [])

    socket.on('data:updated', (data: Record<string, unknown>) => {
      addEvent({ type: 'data:updated', data, timestamp: new Date().toISOString() })
    })

    return () => {
      socket!.emit('leave:repo', { repoId })
      socket!.disconnect()
      socket = null
      setConnected(false)
    }
  }, [repoId, queryClient, setConnected, addEvent])
}
