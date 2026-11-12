import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSnapshot } from '../director'
import { linear } from '../palette'

const RINGS = 4
const EVERY = 0.62 // seconds between pulses
const LIFE = 2.1 // seconds a ring takes to spread out
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const color = (name) => new THREE.Color().setRGB(...linear(name), THREE.LinearSRGBColorSpace)

// Pulses spreading across the plinth from the antenna. Each ring is sent out on its own, so the
// signal starts with the first pulse and stops with the last: while the antenna is pointed at
// (or the Contact chapter is on), a new ring leaves every beat; once it isn't, nothing more is
// sent and the rings already out fade in a fraction of a second instead of finishing their run.
const Signal = ({ position }) => {
  const group = useRef()
  const rings = useRef([])
  const live = useRef(Array.from({ length: RINGS }, () => ({ age: Infinity })))
  const clock = useRef({ next: 0, slot: 0, fade: 0 })
  const tint = useMemo(() => color('phosphor'), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const { chapter, hovered, screen } = getSnapshot()
    const on = screen !== 'process-1' && (hovered === 'contact' || chapter === 'contact' || chapter === 'end')
    const c = clock.current

    // Sending: the first pulse goes the moment it's switched on, then one every beat.
    if (on) {
      c.fade = Math.min(1, c.fade + dt * 6)
      c.next -= dt
      if (c.next <= 0) {
        live.current[c.slot].age = 0
        c.slot = (c.slot + 1) % RINGS
        c.next = EVERY
      }
    } else {
      c.fade = Math.max(0, c.fade - dt * 4.5)
      c.next = 0
    }

    let any = false
    live.current.forEach((r, i) => {
      const ring = rings.current[i]
      if (!ring) return
      r.age += dt
      if (!on && c.fade === 0) r.age = Infinity
      const p = r.age === Infinity ? 1 : reducedMotion ? 0.35 : r.age / LIFE
      ring.visible = p < 1
      if (!ring.visible) return
      any = true
      // Leave fast from the antenna's foot and slow as they spread, like a ripple.
      const e = 1 - (1 - p) ** 2.2
      const s = 0.45 + e * 1.8
      ring.scale.set(s, s, 1)
      ring.material.opacity = c.fade * Math.min(1, p * 10) * (1 - p) ** 1.5 * 0.95
    })
    if (group.current) group.current.visible = any
  })

  return (
    <group ref={group} position={position} visible={false}>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} ref={(el) => { rings.current[i] = el }} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.95, 1, 128]} />
          <meshBasicMaterial color={tint} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default Signal
