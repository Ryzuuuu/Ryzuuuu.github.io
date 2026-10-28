/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively in the frame loop by design */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getSnapshot, setHovered } from '../director'
import { orbit, TARGETS } from './targets'
import MonitorScreen from './MonitorScreen'
import Signal from './Signal'

const MODEL_URL = '/console.glb'
const GOLD = new THREE.Color('#c9a45c')
const AMBER = new THREE.Color('#f2b45c')

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const damp = THREE.MathUtils.damp

// Ivory casings, warm blacks and oxblood accessories instead of the original toy blue.
const PALETTE = {
  Monitor_body_mat: { color: '#e2d6c0', roughness: 0.5 },
  VGS_body_mat: { color: '#e2d6c0', roughness: 0.5 },
  Monitor_details_one_mat: { color: '#14110e', roughness: 0.45 },
  Monitor_details_two_mat: { color: '#1d1916', roughness: 0.4, metalness: 0.35 },
  VGS_details_one_mat: { color: '#16120f', roughness: 0.45 },
  VGS_details_two_mat: { color: '#2b241d', roughness: 0.35, metalness: 0.5 },
  Gamepad_and_cartridge: { color: '#6e1d29', roughness: 0.38 },
}

// Mutating the cached GLTF scene once is intentional: it is only ever mounted here.
const prepareScene = (scene) => {
  scene.traverse((o) => {
    if (!o.isMesh) return
    // Real geometry never gets raycast; cheap invisible boxes handle picking instead.
    o.raycast = () => {}
    const p = PALETTE[o.material.name]
    if (p && !o.material.userData.recolored) {
      o.material.userData.recolored = true
      o.material.color.set(p.color)
      o.material.roughness = p.roughness
      if (p.metalness !== undefined) o.material.metalness = p.metalness
    }
  })

  scene.updateMatrixWorld(true)
  const toLocal = scene.matrixWorld.clone().invert()
  const boxOf = (node) => new THREE.Box3().setFromObject(node).applyMatrix4(toLocal)

  const proxies = []
  const glow = {}
  for (const [id, target] of Object.entries(TARGETS)) {
    const mats = new Set()
    for (const name of target.nodes) {
      const node = scene.getObjectByName(name)
      if (!node) continue
      node.traverse((o) => {
        if (!o.isMesh) return
        // Own materials so lighting up one piece doesn't light every piece sharing it.
        o.material = o.material.clone()
        o.material.emissive = GOLD.clone()
        o.material.emissiveIntensity = 0
        // The monitor glass is driven by the screen wash below instead.
        if (o.material.name !== 'Monitor_glass_mat') mats.add(o.material)
      })
      const box = boxOf(node)
      const size = box.getSize(new THREE.Vector3()).addScalar(0.15)
      proxies.push({ id, key: name, size: size.toArray(), center: box.getCenter(new THREE.Vector3()).toArray() })
    }
    glow[id] = [...mats]
  }

  // The original screen art was a texture we don't have; MonitorScreen replaces it.
  const logo = scene.getObjectByName('Lumen_logo_32')
  if (logo) logo.visible = false

  // A faint amber wash on the CRT glass in front of the screen.
  const glass = []
  scene.getObjectByName('Lumen_Monitor_0')?.traverse((o) => {
    if (o.isMesh && o.material.name === 'Monitor_glass_mat') glass.push(o.material)
  })
  for (const m of glass) {
    m.emissive = AMBER.clone()
    m.emissiveIntensity = 0
  }

  // The cartridge sitting in the console's bay; it reseats itself for each work.
  const cart = scene.getObjectByName('Bricktris_9')
  const receiver = scene.getObjectByName('Lumen_TV_35')
  const rb = receiver ? boxOf(receiver) : null
  const signalAt = rb ? [(rb.min.x + rb.max.x) / 2, 0.02, (rb.min.z + rb.max.z) / 2] : [2.4, 0.02, -3]

  return { proxies, glow, glass, cart, cartY: cart?.position.y ?? 0, signalAt }
}

const ConsoleModel = ({ onSelect }) => {
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, scene)
  const { proxies, glow, glass, cart, cartY, signalAt } = useMemo(() => prepareScene(scene), [scene])
  const powered = useRef(false)
  const gl = useThree((s) => s.gl)

  const state = useRef({ boot: 0, flash: null, flashT: 0, press: null, screen: null, hop: 1 })
  const selectRef = useRef(onSelect)
  useEffect(() => { selectRef.current = onSelect }, [onSelect])

  // The baked clip spins the fan, rollers and reels and runs the loading bar. It idles slowly
  // and runs at full speed while the Expertise chapter is looking at the mechanism.
  const clip = useMemo(() => Object.values(actions)[0], [actions])
  useEffect(() => {
    if (!clip) return
    clip.reset().play()
    clip.timeScale = 0.2
    return () => { clip.stop() }
  }, [clip])

  // Drag sideways to orbit. `pan-y` keeps vertical swipes scrolling the page on touch.
  // A press that barely moves counts as a click on whatever piece it started on.
  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'pan-y'
    const s = state.current
    let lastX = 0
    const now = () => performance.now() / 1000
    const down = (e) => { orbit.dragging = true; orbit.vel = 0; lastX = e.clientX; orbit.lastInput = now() }
    const move = (e) => {
      if (!orbit.dragging) return
      const d = (e.clientX - lastX) * -0.3
      lastX = e.clientX
      orbit.offset += d
      orbit.vel = d
      orbit.lastInput = now()
    }
    const up = (e) => {
      if (!orbit.dragging) return
      orbit.dragging = false
      orbit.lastInput = now()
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
    const dt = Math.min(delta, 0.1)
    const { chapter, screen, hovered } = getSnapshot()

    // Screen powers on shortly after load; MonitorScreen handles the flicker.
    s.boot = Math.min(1, s.boot + dt * 0.9)
    powered.current = s.boot > 0.6
    const wash = powered.current ? 0.04 + (hovered === 'about' ? 0.08 : 0) : 0
    for (const m of glass) m.emissiveIntensity = damp(m.emissiveIntensity, wash, 8, dt)

    // The piece belonging to the chapter on screen breathes gold; hover and clicks are brighter.
    s.flashT = Math.max(0, s.flashT - dt * 2)
    const breathe = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2)
    for (const [id, mats] of Object.entries(glow)) {
      const target =
        (chapter === id ? 0.05 + breathe * 0.07 : 0) + (hovered === id ? 0.3 : 0) + (s.flash === id ? s.flashT * 1.2 : 0)
      for (const m of mats) m.emissiveIntensity = damp(m.emissiveIntensity, target, 8, dt)
    }

    if (clip) clip.timeScale = damp(clip.timeScale, chapter === 'expertise' ? 1.3 : 0.2, 2, dt)

    // Each new work reseats the cartridge: it lifts out of the bay and drops back in.
    if (screen !== s.screen) {
      if (s.screen !== null && screen.startsWith('work-') && !reducedMotion) s.hop = 0
      s.screen = screen
    }
    if (cart) {
      s.hop = Math.min(1, s.hop + dt * 1.4)
      const lift = Math.sin(Math.PI * Math.min(1, s.hop * 1.15)) ** 2
      cart.position.y = cartY + lift * 0.42
      cart.rotation.z = lift * 0.12
    }
  })

  const handlers = (id) => ({
    onPointerOver: (e) => { e.stopPropagation(); setHovered(id); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { setHovered(null); document.body.style.cursor = '' },
    onPointerDown: (e) => {
      e.stopPropagation()
      state.current.press = { id, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    },
  })

  return (
    <group>
      <primitive object={scene} />
      <MonitorScreen position={[-0.025, 1.9, -2.74]} size={[2.3, 1.56]} powered={powered} />
      <Signal position={signalAt} />
      {proxies.map((p) => (
        <mesh key={p.key} position={p.center} {...handlers(p.id)}>
          <boxGeometry args={p.size} />
          <meshBasicMaterial visible={false} />
        </mesh>
      ))}
    </group>
  )
}

useGLTF.preload(MODEL_URL)

export default ConsoleModel
