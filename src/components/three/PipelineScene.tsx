'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollProgress } from '@/context/ScrollProgressContext'

const NODE_COUNT = 12
const SEED_POSITIONS: [number, number, number][] = [
  [0, 0, 0], [1.8, 0.6, -0.5], [-1.6, 0.8, 0.3], [0.4, 1.9, 0.2],
  [-0.3, -1.7, 0.4], [2.1, -0.9, 0.6], [-2.0, -0.5, -0.4], [0.8, 0.4, 1.8],
  [-0.6, 1.2, -1.7], [1.3, -1.5, -0.8], [-1.1, -1.0, 1.5], [0.1, 0.1, -2.0],
]

const EDGES: [number, number][] = [
  [0,1],[0,2],[0,3],[0,4],[1,5],[1,7],[2,6],[2,8],
  [3,8],[3,7],[4,9],[4,10],[5,9],[6,10],[7,11],[8,11],[9,11],[10,11],
]

const NODE_COLORS = [
  '#6366f1','#818cf8','#7c3aed','#a78bfa',
  '#06b6d4','#38bdf8','#6366f1','#c4b5fd',
  '#818cf8','#7c3aed','#06b6d4','#6366f1',
]

function buildEdgeGeometry(positions: [number,number,number][]) {
  const pts: THREE.Vector3[] = []
  for (const [a, b] of EDGES) {
    pts.push(new THREE.Vector3(...positions[a]))
    pts.push(new THREE.Vector3(...positions[b]))
  }
  const geo = new THREE.BufferGeometry()
  geo.setFromPoints(pts)
  return geo
}

function Nodes({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const progress = useScrollProgress()

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const p = progress.current

    if (p <= 0.4) {
      const t = p / 0.4
      g.rotation.y = t * Math.PI * 0.5
    } else if (p <= 0.7) {
      const t = (p - 0.4) / 0.3
      g.rotation.y = Math.PI * 0.5 + t * Math.PI * 0.5
      g.rotation.x = t * 0.26
    } else {
      g.rotation.y = Math.PI
      g.rotation.x = 0.26
    }
  })

  const edgeGeo = useMemo(() => buildEdgeGeometry(SEED_POSITIONS), [])

  return (
    <group ref={groupRef}>
      {SEED_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial
            color={NODE_COLORS[i % NODE_COLORS.length]}
            emissive={NODE_COLORS[i % NODE_COLORS.length]}
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      ))}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#6366f1" transparent opacity={0.25} />
      </lineSegments>
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const progress = useScrollProgress()

  useFrame(() => {
    const p = progress.current

    let z = 8
    if (p <= 0.4) {
      z = 8 - p / 0.4 * 4
    } else if (p <= 0.7) {
      z = 4
    } else {
      const t = (p - 0.7) / 0.3
      z = 4 + t * 2
    }
    camera.position.z = z
    camera.position.x = 0
    camera.position.y = 0
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <>
      <fog attach="fog" args={['#050510', 8, 22]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={60} color="#818cf8" />
      <pointLight position={[-4, -2, 2]} intensity={40} color="#06b6d4" />
      <pointLight position={[0, -4, -2]} intensity={30} color="#7c3aed" />
      <Nodes groupRef={groupRef} />
      <CameraRig />
    </>
  )
}

export default function PipelineScene() {
  return (
    <Canvas
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 8] }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
