'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  MeshTransmissionMaterial,
  RoundedBox,
  Environment,
  ContactShadows,
  Text,
} from '@react-three/drei'
import * as THREE from 'three'
import { useScrollProgress } from '@/context/ScrollProgressContext'

const PANEL_W = 3.2
const PANEL_H = 2.0
const PANEL_D = 0.05

const LAYER_CFG = [
  { zStart: 0.06,  zEnd: 2.4,  glass: true,  tint: '#5b5bd6', transmission: 0.55, thickness: 0.45, roughness: 0.04 },
  { zStart: 0.02,  zEnd: 0.78, glass: true,  tint: '#4c3fb5', transmission: 0.50, thickness: 0.38, roughness: 0.06 },
  { zStart: -0.02, zEnd: -0.78, glass: true, tint: '#2d4a8a', transmission: 0.45, thickness: 0.32, roughness: 0.08 },
  { zStart: -0.06, zEnd: -2.4,  glass: false, tint: '#0a0a14', transmission: 0,   thickness: 0,   roughness: 0.08 },
]

const PANEL_CONTENT = [
  {
    label: 'DORA METRICS',
    accent: '#a5b4fc',
    rows: [
      { key: 'Deploy Freq', val: '5.8 / wk', up: true },
      { key: 'Lead Time',   val: '18.5 h',   up: false },
      { key: 'CFR',         val: '8.2 %',    up: false },
      { key: 'MTTR',        val: '2.5 h',    up: false },
    ],
  },
  {
    label: 'CYCLE TIME',
    accent: '#c4b5fd',
    rows: [
      { key: 'Throughput',   val: '8.4 / day', up: true },
      { key: 'Review Time',  val: '4.2 h',     up: false },
      { key: 'Queue Depth',  val: '12 PRs',    up: null },
      { key: 'Merge Rate',   val: '94 %',      up: true },
    ],
  },
  {
    label: 'LIVE EVENTS',
    accent: '#67e8f9',
    rows: [
      { key: 'pr:merged',            val: '2m ago',  up: null },
      { key: 'deploy:completed',     val: '5m ago',  up: null },
      { key: 'anomaly:detected',     val: '12m ago', up: null },
      { key: 'review:requested',     val: '18m ago', up: null },
    ],
  },
  {
    label: 'ANALYTICS',
    accent: '#34d399',
    rows: [
      { key: 'Total Commits', val: '2.4 K', up: true },
      { key: 'Active PRs',    val: '18',    up: null },
      { key: 'Contrib Score', val: '94',    up: true },
      { key: 'Teams Online',  val: '7',     up: null },
    ],
  },
]

function Divider({ x, y, z, width, col }: { x: number; y: number; z: number; width: number; col: string }) {
  return (
    <mesh position={[x + width / 2, y, z]}>
      <boxGeometry args={[width, 0.004, 0.001]} />
      <meshBasicMaterial color={col} transparent opacity={0.35} />
    </mesh>
  )
}

function PanelContent({ idx }: { idx: number }) {
  const cfg = PANEL_CONTENT[idx]
  const z = PANEL_D / 2 + 0.01
  const left = -1.28
  const right = 1.22
  const top = 0.78
  const rowH = 0.265

  return (
    <group position={[0, 0, z]}>
      <Text
        position={[left, top, 0]}
        fontSize={0.115}
        color={cfg.accent}
        anchorX="left"
        anchorY="top"
        letterSpacing={0.12}
      >
        {cfg.label}
      </Text>

      <Divider x={left} y={top - 0.20} z={0} width={right - left} col={cfg.accent} />

      {cfg.rows.map((row, i) => {
        const y = top - 0.32 - i * rowH
        const arrow = row.up === true ? ' ↑' : row.up === false ? ' ↓' : ''
        const valCol = row.up === true ? '#86efac' : row.up === false ? '#fca5a5' : '#94a3b8'
        return (
          <group key={row.key}>
            <Text
              position={[left, y, 0]}
              fontSize={0.088}
              color="#94a3b8"
              anchorX="left"
              anchorY="top"
              letterSpacing={0.04}
            >
              {row.key}
            </Text>
            <Text
              position={[right, y, 0]}
              fontSize={0.088}
              color={valCol}
              anchorX="right"
              anchorY="top"
              letterSpacing={0.04}
            >
              {row.val + arrow}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

function Layers() {
  const groupRef = useRef<THREE.Group | null>(null)
  const layerRefs = [
    useRef<THREE.Group | null>(null),
    useRef<THREE.Group | null>(null),
    useRef<THREE.Group | null>(null),
    useRef<THREE.Group | null>(null),
  ]
  const progress = useScrollProgress()

  useFrame(() => {
    const p = progress.current
    const g = groupRef.current
    if (!g) return
    g.rotation.x = THREE.MathUtils.lerp(-0.14, 0.36, p)
    g.rotation.y = THREE.MathUtils.lerp(0.28, -0.18, p)
    LAYER_CFG.forEach((cfg, i) => {
      const r = layerRefs[i].current
      if (!r) return
      r.position.z = THREE.MathUtils.lerp(cfg.zStart, cfg.zEnd, p)
    })
  })

  return (
    <group ref={groupRef} position={[0.2, 0, 0]}>
      {LAYER_CFG.map((cfg, i) => (
        <group key={i} ref={layerRefs[i]}>
          <RoundedBox args={[PANEL_W, PANEL_H, PANEL_D]} radius={0.07} smoothness={4}>
            {cfg.glass ? (
              <MeshTransmissionMaterial
                backside
                samples={4}
                resolution={256}
                transmission={cfg.transmission}
                thickness={cfg.thickness}
                roughness={cfg.roughness}
                ior={1.5}
                chromaticAberration={0.07}
                anisotropy={0.4}
                color={cfg.tint}
                distortion={0.06}
                distortionScale={0.3}
                temporalDistortion={0}
              />
            ) : (
              <meshPhysicalMaterial
                color={cfg.tint}
                roughness={cfg.roughness}
                metalness={0.9}
                reflectivity={1}
              />
            )}
          </RoundedBox>
          <PanelContent idx={i} />
        </group>
      ))}
    </group>
  )
}

export default function PipelineScene() {
  return (
    <Canvas
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 8] }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: 'transparent' }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <Environment preset="city" />
        <ambientLight intensity={1.2} color="#8080ff" />
        <directionalLight position={[0, 5, 6]} intensity={3.5} color="#ffffff" />
        <pointLight position={[-4, 2, 3]} intensity={120} color="#6366f1" />
        <pointLight position={[4, -1, 4]} intensity={100} color="#06b6d4" />
        <pointLight position={[0, -4, 2]} intensity={80} color="#7c3aed" />
        <pointLight position={[0, 4, 2]} intensity={60} color="#a5b4fc" />
        <Layers />
        <ContactShadows
          position={[0, -1.45, 0]}
          opacity={0.6}
          scale={9}
          blur={2.5}
          far={2.5}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  )
}
