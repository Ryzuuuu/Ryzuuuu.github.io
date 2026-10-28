/* eslint-disable react-hooks/immutability -- the camera and shared vectors are mutated in the frame loop by design */
import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { director } from '../director'
import { distanceScale, resolveShot, SPLIT_MIN_WIDTH } from './shots'
import { focus, orbit } from './targets'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const { damp, degToRad, lerp } = THREE.MathUtils
const smooth = (t) => t * t * (3 - 2 * t)
const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180

// Blends the two shots the director hands over, then eases the camera toward the result.
// The rig never snaps: shots are damped in spherical terms, so the camera swings around
// the island instead of cutting through it.
const CameraRig = () => {
  const cur = useMemo(() => ({ az: 70, el: 30, dist: 32, fx: 0.5, fy: 0.5, ready: false }), [])
  const pointer = useMemo(() => ({ x: 0, y: 0 }), [])

  // The canvas sits behind the page, so track the pointer on the window instead.
  useEffect(() => {
    const move = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [pointer])

  useFrame(({ camera, size, clock }, delta) => {
    const dt = Math.min(delta, 0.1)
    const split = size.width >= SPLIT_MIN_WIDTH
    const { a, b, mix } = director
    const sa = resolveShot(a.shot, a.param, a.local, split)
    const sb = resolveShot(b.shot, b.param, b.local, split)
    const m = smooth(mix)

    const tx = lerp(sa.target[0], sb.target[0], m)
    const ty = lerp(sa.target[1], sb.target[1], m)
    const tz = lerp(sa.target[2], sb.target[2], m)
    const scale = distanceScale(size.width / size.height, split)

    // Let go of a drag and the exhibit drifts back into the composed shot.
    const idle = performance.now() / 1000 - orbit.lastInput
    if (!orbit.dragging) {
      orbit.offset += orbit.vel
      orbit.vel *= Math.pow(0.03, dt)
      if (idle > 2.5) orbit.offset = damp(orbit.offset, 0, 1.2, dt)
    }

    // Scrolling hard pulls the camera back and swings it a touch, so speed reads as momentum.
    const kick = reducedMotion ? 0 : THREE.MathUtils.clamp(director.velocity, -40, 40)
    const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.18) * 2.5
    const az = sa.az + wrap(sb.az - sa.az) * m + orbit.offset + sway + kick * 0.08 + (reducedMotion ? 0 : pointer.x * 3)
    const el = lerp(sa.el, sb.el, m) + (reducedMotion ? 0 : pointer.y * 1.5)
    const dist = lerp(sa.dist, sb.dist, m) * scale * (1 + Math.abs(kick) * 0.0035)
    const fx = lerp(sa.fx, sb.fx, m)
    const fy = lerp(sa.fy, sb.fy, m)

    // Slow and cinematic, except when reduced motion asks for no travel at all.
    const k = reducedMotion ? 50 : 2.4
    if (!cur.ready) {
      // Opening move: start wide and high, then glide into the first shot.
      cur.ready = true
      if (reducedMotion) Object.assign(cur, { az, el, dist, fx, fy })
      Object.assign(focus, { x: tx, y: ty, z: tz })
    }
    cur.az += wrap(az - cur.az) * (1 - Math.exp(-k * dt))
    cur.el = damp(cur.el, el, k, dt)
    cur.dist = damp(cur.dist, dist, k * 0.8, dt)
    cur.fx = damp(cur.fx, fx, k, dt)
    cur.fy = damp(cur.fy, fy, k, dt)
    focus.x = damp(focus.x, tx, k, dt)
    focus.y = damp(focus.y, ty, k, dt)
    focus.z = damp(focus.z, tz, k, dt)

    const azr = degToRad(cur.az)
    const elr = degToRad(cur.el)
    camera.position.set(
      focus.x + cur.dist * Math.sin(azr) * Math.cos(elr),
      focus.y + cur.dist * Math.sin(elr),
      focus.z + cur.dist * Math.cos(azr) * Math.cos(elr),
    )
    camera.lookAt(focus.x, focus.y, focus.z)

    // Lens shift: slide the image so the subject lands at (fx, fy) without skewing perspective.
    const { width: w, height: h } = size
    camera.setViewOffset(w, h, (0.5 - cur.fx) * w, (0.5 - cur.fy) * h, w, h)
  })

  return null
}

export default CameraRig
