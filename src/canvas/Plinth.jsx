import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSnapshot } from '../director'
import { linear } from '../palette'

const RADIUS = 5.2
const color = (name) => new THREE.Color().setRGB(...linear(name), THREE.LinearSRGBColorSpace)

const makeFalloff = () => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.18)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

// The island: a deep-teal slab with a bright lip and a wine-red inlay. Underneath, a soft
// pool that reads as a shadow on light chapters and as a glow on dark ones.
const Plinth = () => {
  const falloff = useMemo(() => makeFalloff(), [])
  const pool = useRef()
  const tones = useMemo(() => ({ light: color('text'), dark: color('primary') }), [])
  const paint = useMemo(() => ({ slab: color('primary'), lip: color('highlight'), inlay: color('secondary') }), [])
  useEffect(() => () => falloff.dispose(), [falloff])

  useFrame((_, delta) => {
    const m = pool.current
    if (!m) return
    const dt = Math.min(delta, 0.1)
    const dark = getSnapshot().tone === 'dark'
    m.color.lerp(dark ? tones.dark : tones.light, 1 - Math.exp(-3 * dt))
    m.opacity = THREE.MathUtils.damp(m.opacity, dark ? 0.9 : 0.35, 3, dt)
  })

  return (
    <group>
      <mesh position={[0, -0.24, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.48, 128]} />
        <meshStandardMaterial color={paint.slab} roughness={0.75} metalness={0.05} envMapIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.012, 0]}>
        <cylinderGeometry args={[RADIUS + 0.014, RADIUS + 0.014, 0.03, 128, 1, true]} />
        <meshBasicMaterial color={paint.lip} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]}>
        <ringGeometry args={[RADIUS - 0.36, RADIUS - 0.3, 192]} />
        <meshBasicMaterial color={paint.inlay} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.3, 0]}>
        <planeGeometry args={[19, 19]} />
        <meshBasicMaterial ref={pool} map={falloff} color={tones.light} transparent opacity={0.35} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default Plinth
