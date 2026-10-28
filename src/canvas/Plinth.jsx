import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const GOLD = '#c9a45c'
const RADIUS = 5.2

// Soft pool of warm light under the island, so it reads as floating rather than cut out.
const makeGlow = () => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(214,160,90,0.42)')
  g.addColorStop(0.45, 'rgba(160,90,60,0.14)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// A lacquered display plinth with a gold band and an inlaid ring: the island the exhibit stands on.
const Plinth = () => {
  const glow = useMemo(() => makeGlow(), [])
  useEffect(() => () => glow.dispose(), [glow])

  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS - 0.18, 0.4, 128]} />
        <meshStandardMaterial color="#1a1612" roughness={0.8} metalness={0.1} envMapIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[RADIUS + 0.012, RADIUS + 0.012, 0.05, 128, 1, true]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.37, 0]}>
        <cylinderGeometry args={[RADIUS - 0.16, RADIUS - 0.16, 0.025, 128, 1, true]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]}>
        <ringGeometry args={[RADIUS - 0.32, RADIUS - 0.3, 192]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.1, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default Plinth
