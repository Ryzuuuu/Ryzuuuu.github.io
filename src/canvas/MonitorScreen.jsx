/* eslint-disable react-hooks/immutability -- the canvas texture is redrawn imperatively from the frame loop */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSnapshot } from '../director'
import { rgb } from '../palette'
import { FONTS, H, isStatic, makeInstruments, W } from './instruments'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Repainting and re-uploading the screen isn't free, so phones get a slower tube.
const FPS = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 15 : 24
const TRAIL = 42

// Monochrome teal phosphor, mixed from the palette.
const makeInk = () => ({
  bg: rgb('text'),
  glow: rgb('primary', 0.4),
  fg: rgb('highlight'),
  soft: rgb('border-muted'),
  faint: rgb('border', 0.4),
})

const layer = (paint) => {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  paint(c.getContext('2d'))
  return c
}

// What the tracker on the opening screen follows. Lives outside React: it's read per frame.
const makePointer = () => ({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, seen: false, dwell: 0, trail: [] })

// A live phosphor display, painted to a canvas and shown on the monitor. The tube itself (glow,
// bloom, scanlines) is composited here; what's on it comes from instruments.js.
const MonitorScreen = ({ position, size, powered }) => {
  const mesh = useRef()
  const mat = useRef()
  const tube = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    const ink = makeInk()
    const ctx = canvas.getContext('2d')

    const back = layer((c) => {
      c.fillStyle = ink.bg
      c.fillRect(0, 0, W, H)
      const g = c.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.72)
      g.addColorStop(0, ink.glow)
      g.addColorStop(1, 'rgba(0,0,0,0.45)')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
    })
    const glass = layer((c) => {
      c.fillStyle = 'rgba(0,0,0,0.13)'
      for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2)
      const g = c.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, W * 0.68)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.32)')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
    })
    // Bloom on the cheap: shrink the frame, then lay it back over itself, blurred by the scaling.
    const bloom = document.createElement('canvas')
    bloom.width = W >> 3
    bloom.height = H >> 3
    return { ctx, texture, ink, back, glass, bloom, bloomCtx: bloom.getContext('2d'), canvas, draw: makeInstruments(ctx, ink) }
  }, [])
  const pointer = useMemo(() => makePointer(), [])
  const state = useRef({ start: null, key: '', shown: null, switchT: 1, lastTrail: 0 })

  useEffect(() => {
    // Redraw once the web fonts arrive so the screen doesn't keep the fallback fonts.
    Promise.all(FONTS.map((f) => document.fonts?.load(f))).then(() => { state.current.key = '' })
    return () => tube.texture.dispose()
  }, [tube])

  useEffect(() => {
    const move = (e) => {
      pointer.tx = e.clientX / window.innerWidth
      pointer.ty = e.clientY / window.innerHeight
      pointer.seen = true
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [pointer])

  const paint = (screen, t) => {
    const { ctx, back, glass, bloom, bloomCtx, canvas, texture, draw } = tube
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(back, 0, 0)
    ctx.textBaseline = 'alphabetic'
    draw(screen, t, { pointer })
    bloomCtx.clearRect(0, 0, bloom.width, bloom.height)
    bloomCtx.drawImage(canvas, 0, 0, bloom.width, bloom.height)
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.75
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bloom, 0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(glass, 0, 0)
    texture.needsUpdate = true
  }

  useFrame(({ clock }, delta) => {
    const s = state.current
    const t = clock.elapsedTime
    if (!powered.current) {
      mat.current?.color.setScalar(0)
      return
    }
    if (s.start === null) s.start = t
    const elapsed = t - s.start

    // Channel change: the picture collapses to a line, swaps, and opens back up.
    const { screen } = getSnapshot()
    if (s.shown === null) s.shown = screen
    if (screen !== s.shown) {
      if (reducedMotion) s.shown = screen
      else if (s.switchT >= 0.5) s.switchT = 0
    }
    s.switchT = Math.min(1, s.switchT + delta * 3.2)
    if (s.switchT >= 0.5 && s.shown !== screen) s.shown = screen
    const squash = s.switchT < 1 ? Math.abs(Math.cos(s.switchT * Math.PI)) : 1
    if (mesh.current) mesh.current.scale.y = Math.max(0.012, squash)

    const flicker = elapsed < 0.5 ? (Math.random() > 0.4 ? 1 : 0.25) : 1
    mat.current?.color.setScalar(flicker * (0.65 + 0.35 * squash) + (1 - squash) * 0.6)

    // The tracker lags a little behind the pointer; with no pointer (phones), it hunts.
    pointer.dwell += delta
    if (!pointer.seen) {
      pointer.tx = 0.5 + Math.sin(t * 0.43) * 0.3
      pointer.ty = 0.5 + Math.sin(t * 0.71 + 1) * 0.26
    }
    const k = 1 - Math.exp(-delta * 5)
    pointer.x += (pointer.tx - pointer.x) * k
    pointer.y += (pointer.ty - pointer.y) * k
    if (t - s.lastTrail > 0.07) {
      s.lastTrail = t
      pointer.trail.push({ x: pointer.x, y: pointer.y })
      if (pointer.trail.length > TRAIL) pointer.trail.shift()
    }

    // Static screens paint once; live ones at a film-ish rate, which also suits the tube.
    const still = reducedMotion || isStatic(s.shown)
    const key = still ? s.shown : `${s.shown}|${Math.floor(t * FPS)}`
    if (key !== s.key) {
      s.key = key
      paint(s.shown, reducedMotion ? 12 : t)
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial ref={mat} map={tube.texture} toneMapped={false} />
    </mesh>
  )
}

export default MonitorScreen
