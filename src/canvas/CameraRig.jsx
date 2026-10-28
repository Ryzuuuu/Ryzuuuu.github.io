import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const damp = THREE.MathUtils.damp

// Frames the console for the viewport, eases toward the pointer, and drifts as the
// hero scrolls away. Reads scroll/pointer inside the frame loop: no React state involved.
const CameraRig = () => {
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, pointer, size }, delta) => {
    const aspect = size.width / size.height
    // Matches the hero's lg breakpoint, where the copy sits beside the scene instead of below it.
    const split = window.innerWidth >= 1024
    const p = reducedMotion ? 0 : Math.min(1, window.scrollY / size.height)

    // Split layout: console sits right of the copy. Stacked layout: fit the console's width.
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const dist = split ? THREE.MathUtils.clamp(17 / aspect, 9.5, 12) : THREE.MathUtils.clamp(3.9 / (tanHalf * aspect), 9, 18)
    const shiftX = split ? -dist * tanHalf * aspect * 0.42 : 0

    const px = reducedMotion ? 0 : pointer.x
    const py = reducedMotion ? 0 : pointer.y
    const angle = px * 0.12 + p * 0.5
    const r = dist * (1 - p * 0.18)

    const tx = shiftX + Math.sin(angle) * r
    const ty = 3.4 + py * 0.35 + p * 1.8
    const tz = Math.cos(angle) * r

    camera.position.x = damp(camera.position.x, tx, 3, delta)
    camera.position.y = damp(camera.position.y, ty, 3, delta)
    camera.position.z = damp(camera.position.z, tz, 3, delta)
    look.set(shiftX, 0.2 - p * 0.6, 0)
    camera.lookAt(look)
  })

  return null
}

export default CameraRig
