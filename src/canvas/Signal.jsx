import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSnapshot } from '../director'
import { linear } from '../palette'

const RINGS = 3
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const color = (name) => new THREE.Color().setRGB(...linear(name), THREE.LinearSRGBColorSpace)

// Ripples spreading across the plinth from the antenna while Contact is on screen.
const Signal = ({ position }) => {
  const group = useRef()
  const rings = useRef([])
  const level = useRef(0)
  const tint = useMemo(() => color('highlight'), [])

  useFrame(({ clock }, delta) => {
    const { chapter, hovered } = getSnapshot()
    const on = chapter === 'contact' || hovered === 'contact'
    level.current = THREE.MathUtils.damp(level.current, on ? 1 : 0, 2.5, Math.min(delta, 0.1))
    if (!group.current) return
    group.current.visible = level.current > 0.01
    if (!group.current.visible) return
    rings.current.forEach((ring, i) => {
      const p = reducedMotion ? 0.2 + i * 0.25 : (clock.elapsedTime * 0.45 + i / RINGS) % 1
      // Fades out before the rings would spill past the plinth's edge.
      const s = 0.3 + p * 2
      ring.scale.set(s, s, 1)
      ring.material.opacity = level.current * (1 - p) ** 1.4 * 0.95
    })
  })

  return (
    <group ref={group} position={position} visible={false}>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} ref={(el) => { rings.current[i] = el }} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.95, 1, 128]} />
          <meshBasicMaterial color={tint} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default Signal
