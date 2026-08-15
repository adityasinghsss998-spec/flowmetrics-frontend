import { create } from 'zustand'

interface RealtimeEvent {
  type: string
  data: Record<string, unknown>
  timestamp: string
}

interface RealtimeState {
  events: RealtimeEvent[]
  isConnected: boolean
  lastPrMerged: RealtimeEvent | null
  lastDeployment: RealtimeEvent | null
  lastAnomaly: RealtimeEvent | null
  setConnected: (v: boolean) => void
  addEvent: (event: RealtimeEvent) => void
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  events: [],
  isConnected: false,
  lastPrMerged: null,
  lastDeployment: null,
  lastAnomaly: null,
  setConnected: (v) => set({ isConnected: v }),
  addEvent: (event) =>
    set((state) => {
      const update: Partial<RealtimeState> = {
        events: [event, ...state.events].slice(0, 50),
      }
      if (event.type === 'pr:merged') update.lastPrMerged = event
      if (event.type.startsWith('deployment:')) update.lastDeployment = event
      if (event.type === 'anomaly:detected') update.lastAnomaly = event
      return update
    }),
}))
