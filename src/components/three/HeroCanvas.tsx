'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const PipelineScene = dynamic(() => import('./PipelineScene'), { ssr: false })

function StaticFallback() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-cyan-900/20 rounded-2xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-4 opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full bg-indigo-400"
              style={{ opacity: 0.3 + (i % 3) * 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HeroCanvas() {
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.innerWidth < 768
    if (!reduced && !mobile) setShow3D(true)
  }, [])

  return show3D ? <PipelineScene /> : <StaticFallback />
}
