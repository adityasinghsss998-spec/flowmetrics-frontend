'use client'

import { createContext, useContext, useRef } from 'react'

type ProgressRef = { current: number }

const ScrollProgressContext = createContext<ProgressRef>({ current: 0 })

export function ScrollProgressProvider({ children }: { children: React.ReactNode }) {
  const progress = useRef(0)
  return (
    <ScrollProgressContext.Provider value={progress}>
      {children}
    </ScrollProgressContext.Provider>
  )
}

export function useScrollProgress() {
  return useContext(ScrollProgressContext)
}
