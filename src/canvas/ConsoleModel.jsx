/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively in the frame loop by design */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { TARGETS } from './targets'
import MonitorScreen from './MonitorScreen'

const MODEL_URL = '/console.glb'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const damp = THREE.MathUtils.damp

// Mutating the cached GLTF scene once is intentional: it is only ever mounted here.
const prepareScene = (scene) => {
  scene.updateMatrixWorld(true)
  const toLocal = scene.matrixWorld.clone().invert()

  // Real geometry never gets raycast; cheap invisible boxes handle picking instead.
  scene.traverse((o) => { if (o.isMesh) o.raycast = () => {} })

  const proxies = []
  const glow = {}
  for (const [id, target] of Object.entries(TARGETS)) {
    const mats = new Set()
    for (const name of target.nodes) {
      const node = scene.getObjectByName(name)
      if (!node) continue
      node.traverse((o) => {
        if (!o.isMesh) return
        // Own materials so hovering one object doesn't light up every object sharing it.
        o.material = o.material.clone()
        o.material.emissive = new THREE.Color(target.color)
        o.material.emissiveIntensity = 0
        // The monitor glass is driven by the screen glow below instead.
        if (o.material.name !== 'Monitor_glass_mat') mats.add(o.material)
      })
      const box = new THREE.Box3().setFromObject(node).applyMatrix4(toLocal)
      const size = box.getSize(new THREE.Vector3()).addScalar(0.15)
      proxies.push({ id, key: name, size: size.toArray(), center: box.getCenter(new THREE.Vector3()).toArray() })
    }
    glow[id] = [...mats]
  }

  // The original screen art was a texture we don't have; MonitorScreen replaces it.
  const logo = scene.getObjectByName('Lumen_logo_32')
  if (logo) logo.visible = false

  // A faint green wash on the CRT glass in front of the terminal.
  const glass = []
  scene.getObjectByName('Lumen_Monitor_0')?.traverse((o) => {
    if (o.isMesh && o.material.name === 'Monitor_glass_mat') glass.push(o.material)
  })
  for (const m of glass) {
    m.emissive = new THREE.Color('#3dffa2')
    m.emissiveIntensity = 0
  }

  return { proxies, glow, glass }
}

const ConsoleModel = ({ hovered, onHover, onSelect }) => {
  const root = useRef()
  const spinner = useRef()
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, scene)
  const { proxies, glow, glass } = useMemo(() => prepareScene(scene), [scene])
  const powered = useRef(false)
  const gl = useThree((s) => s.gl)

  const state = useRef({ boot: 0, flash: null, flashT: 0, angle: 0, vel: 0, dragging: false, press: null })
  const selectRef = useRef(onSelect)
  useEffect(() => { selectRef.current = onSelect }, [onSelect])

  // Monitor "boot": the loading-bar animation baked into the model plays once the screen is on.
  useEffect(() => {
    const action = Object.values(actions)[0]
    if (!action) return
    const t = setTimeout(() => action.reset().fadeIn(0.4).play(), 900)
    return () => { clearTimeout(t); action.stop() }
  }, [actions])

  // Drag sideways to spin. `pan-y` keeps vertical swipes scrolling the page on touch.
  // A press that barely moves counts as a click on whatever object it started on, even if
  // the camera drifted underneath the pointer in the meantime.
  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'pan-y'
    const s = state.current
    let lastX = 0
    const down = (e) => { s.dragging = true; lastX = e.clientX; s.vel = 0 }
    const move = (e) => {
      if (!s.dragging) return
      const dx = (e.clientX - lastX) * 0.006
      lastX = e.clientX
      s.angle += dx
      s.vel = dx
    }
    const up = (e) => {
      s.dragging = false
      const press = s.press
      s.press = null
      if (!press || e.type === 'pointercancel') return
      if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) return
      s.flash = press.id
      s.flashT = 1
      selectRef.current(press.id)
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useEffect(() => () => { document.body.style.cursor = '' }, [])

  useFrame(({ clock }, delta) => {
    const s = state.current
    const t = clock.elapsedTime

    if (!s.dragging) {
      s.vel *= Math.pow(0.04, delta)
      s.angle += s.vel
    }
    if (spinner.current) {
      const sway = reducedMotion ? 0 : Math.sin(t * 0.35) * 0.12
      spinner.current.rotation.y = damp(spinner.current.rotation.y, s.angle + sway, 8, delta)
    }
    if (root.current && !reducedMotion) root.current.position.y = Math.sin(t * 0.8) * 0.06

    // Screen powers on shortly after load; MonitorScreen handles the flicker.
    s.boot = Math.min(1, s.boot + delta * 0.9)
    powered.current = s.boot > 0.6
    const wash = powered.current ? 0.05 + (hovered === 'about' ? 0.1 : 0) : 0
    for (const m of glass) m.emissiveIntensity = damp(m.emissiveIntensity, wash, 8, delta)

    s.flashT = Math.max(0, s.flashT - delta * 2.5)
    for (const [id, mats] of Object.entries(glow)) {
      const target = (hovered === id ? 0.4 : 0) + (s.flash === id ? s.flashT * 1.5 : 0)
      for (const m of mats) m.emissiveIntensity = damp(m.emissiveIntensity, target, 10, delta)
    }
  })

  const handlers = (id) => ({
    onPointerOver: (e) => { e.stopPropagation(); onHover(id); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { onHover(null); document.body.style.cursor = '' },
    onPointerDown: (e) => {
      e.stopPropagation()
      state.current.press = { id, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    },
  })

  return (
    <group ref={root}>
      <group ref={spinner}>
        {/* Model origin sits at its back-left floor; centre it on the spin axis. */}
        <group position={[0, -1.3, 1.15]}>
          <primitive object={scene} />
          <MonitorScreen position={[-0.025, 1.9, -2.74]} size={[2.3, 1.56]} hovered={hovered === 'about'} powered={powered} />
          {proxies.map((p) => (
            <mesh key={p.key} position={p.center} {...handlers(p.id)}>
              <boxGeometry args={p.size} />
              <meshBasicMaterial visible={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)

export default ConsoleModel
