/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively in the frame loop by design */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getSnapshot, setHovered } from '../director'
import { linear } from '../palette'
import { orbit, TARGETS } from './targets'
import MonitorScreen from './MonitorScreen'
import Signal from './Signal'

const MODEL_URL = '/console.glb'
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const damp = THREE.MathUtils.damp
const color = (name) => new THREE.Color().setRGB(...linear(name), THREE.LinearSRGBColorSpace)

// Mint-white casings, near-black teal trim, wine-red accessories: straight from the palette.
const PALETTE = {
  Monitor_body_mat: { color: 'bg-light', roughness: 0.45 },
  VGS_body_mat: { color: 'bg-light', roughness: 0.45 },
  Monitor_details_one_mat: { color: 'text', roughness: 0.5 },
  Monitor_details_two_mat: { color: 'text', roughness: 0.4, metalness: 0.3 },
  VGS_details_one_mat: { color: 'text', roughness: 0.5 },
  VGS_details_two_mat: { color: 'primary', roughness: 0.35, metalness: 0.4 },
  Gamepad_and_cartridge: { color: 'secondary', roughness: 0.35 },
}

// The "how I work" steps render the console as a wireframe, then clay, then finished.
const MODE_FOR = { 'process-0': 'wire', 'process-1': 'clay' }

// Mutating the cached GLTF scene once is intentional: it is only ever mounted here.
const prepareScene = (scene) => {
  scene.traverse((o) => {
    if (!o.isMesh) return
    // Real geometry never gets raycast; cheap invisible boxes handle picking instead.
    o.raycast = () => {}
    const p = PALETTE[o.material.name]
    if (p && !o.material.userData.recolored) {
      o.material.userData.recolored = true
      o.material.color.copy(color(p.color))
      o.material.roughness = p.roughness
      if (p.metalness !== undefined) o.material.metalness = p.metalness
    }
  })

  scene.updateMatrixWorld(true)
  const toLocal = scene.matrixWorld.clone().invert()
  const boxOf = (node) => new THREE.Box3().setFromObject(node).applyMatrix4(toLocal)
  const glowColor = color('highlight')

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
        o.material.emissive = glowColor.clone()
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

  // A faint wash on the CRT glass in front of the screen.
  const glass = []
  scene.getObjectByName('Lumen_Monitor_0')?.traverse((o) => {
    if (o.isMesh && o.material.name === 'Monitor_glass_mat') glass.push(o.material)
  })
  for (const m of glass) {
    m.emissive = glowColor.clone()
    m.emissiveIntensity = 0
  }

  // Every mesh with its finished material, plus the two stand-ins for the process steps.
  const meshes = []
  scene.traverse((o) => { if (o.isMesh) meshes.push({ mesh: o, finished: o.material }) })
  const looks = {
    wire: new THREE.MeshBasicMaterial({ color: color('highlight'), wireframe: true, transparent: true, opacity: 0.5, toneMapped: false }),
    clay: new THREE.MeshStandardMaterial({ color: color('bg-dark'), roughness: 0.9, metalness: 0 }),
  }

  // The cartridge sitting in the console's bay; it reseats itself for each work.
  const cart = scene.getObjectByName('Bricktris_9')
  const receiver = scene.getObjectByName('Lumen_TV_35')
  const rb = receiver ? boxOf(receiver) : null
  const signalAt = rb ? [(rb.min.x + rb.max.x) / 2, 0.02, (rb.min.z + rb.max.z) / 2] : [2.4, 0.02, -3]

  return { proxies, glow, glass, cart, cartY: cart?.position.y ?? 0, signalAt, meshes, looks }
}

const ConsoleModel = ({ onSelect }) => {
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, scene)
  const { proxies, glow, glass, cart, cartY, signalAt, meshes, looks } = useMemo(() => prepareScene(scene), [scene])
  const powered = useRef(false)
  const scanner = useRef()
  const gl = useThree((s) => s.gl)

  const state = useRef({ boot: 0, flash: null, flashT: 0, press: null, screen: null, hop: 1, mode: 'full', scan: 1 })
  const selectRef = useRef(onSelect)
  useEffect(() => { selectRef.current = onSelect }, [onSelect])

  useEffect(() => () => { looks.wire.dispose(); looks.clay.dispose() }, [looks])

  // The baked clip spins the fan, rollers and reels and runs the loading bar. It idles slowly
  // and runs at full speed while the Toolbox chapter is looking at the mechanism.
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
    const wash = powered.current ? 0.05 + (hovered === 'about' ? 0.12 : 0) : 0
    for (const m of glass) m.emissiveIntensity = damp(m.emissiveIntensity, wash, 8, dt)

    // Wireframe → clay → finished. Swap the look and send the scanner ring up the console.
    const mode = MODE_FOR[screen] ?? 'full'
    if (mode !== s.mode) {
      s.mode = mode
      s.scan = reducedMotion ? 1 : 0
      for (const { mesh, finished } of meshes) mesh.material = mode === 'full' ? finished : looks[mode]
    }
    s.scan = Math.min(1, s.scan + dt * 1.5)
    if (scanner.current) {
      scanner.current.visible = s.scan < 1
      scanner.current.position.y = s.scan * 3.4
      scanner.current.material.opacity = Math.sin(s.scan * Math.PI) * 0.9
    }

    // The piece belonging to the chapter on screen breathes; hover and clicks are brighter.
    s.flashT = Math.max(0, s.flashT - dt * 2)
    const breathe = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.4)
    for (const [id, mats] of Object.entries(glow)) {
      const target =
        (chapter === id ? 0.04 + breathe * 0.08 : 0) + (hovered === id ? 0.35 : 0) + (s.flash === id ? s.flashT * 1.2 : 0)
      for (const m of mats) m.emissiveIntensity = damp(m.emissiveIntensity, target, 8, dt)
    }

    if (clip) clip.timeScale = damp(clip.timeScale, chapter === 'toolbox' ? 1.4 : 0.2, 2, dt)

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
      <mesh ref={scanner} rotation-x={-Math.PI / 2} position={[0, 0, -1.15]} visible={false}>
        <ringGeometry args={[3.9, 4.0, 128]} />
        <meshBasicMaterial color={color('highlight')} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
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
