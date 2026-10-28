/* eslint-disable react-hooks/immutability -- the canvas texture is redrawn imperatively from the frame loop */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const W = 512
const H = 348
const FONT = '500 19px "JetBrains Mono", ui-monospace, monospace'
const GREEN = '#3dffa2'

// Commands type out; output lines (`out`) print instantly once their command is done.
const SCRIPT = [
  { text: 'NM-OS v26 · PLAYER 1', header: true },
  { text: '> whoami' },
  { text: 'neelabja: student, builder', out: true },
  { text: '> ls ~/cartridges' },
  { text: 'aerosense  trisense  neuroecho', out: true },
  { text: 'storesight presento  parabridge', out: true },
  { text: '> ./start --player=you' },
]
const HOVER_LINE = '> open ./profile   [click]'
const TOTAL_CHARS = SCRIPT.reduce((n, l) => n + (l.out || l.header ? 0 : l.text.length), 0) + 1

// Plain-text terminal painted onto a canvas and shown on the monitor.
const MonitorScreen = ({ position, size, hovered, powered }) => {
  const mat = useRef()
  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { ctx: canvas.getContext('2d'), texture }
  }, [])
  const state = useRef({ start: null, key: '' })

  useEffect(() => {
    // Redraw once the webfont arrives so the screen doesn't keep the fallback font.
    document.fonts?.load(FONT).then(() => { state.current.key = '' })
    return () => texture.dispose()
  }, [texture])

  const draw = (chars, cursor, hover) => {
    ctx.fillStyle = '#03120b'
    ctx.fillRect(0, 0, W, H)
    const glow = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.7)
    glow.addColorStop(0, 'rgba(61,255,162,0.10)')
    glow.addColorStop(1, 'rgba(0,0,0,0.5)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    ctx.font = FONT
    ctx.textBaseline = 'top'
    let left = chars
    let y = 26
    let lastX = 28
    let lastY = y
    for (const line of SCRIPT) {
      if (left <= 0) break
      const shown = line.out || line.header ? line.text : line.text.slice(0, left)
      left -= line.out || line.header ? 0 : line.text.length
      const text = hover && line === SCRIPT[SCRIPT.length - 1] ? HOVER_LINE : shown
      ctx.fillStyle = line.header ? 'rgba(61,255,162,0.55)' : line.out ? 'rgba(236,235,244,0.85)' : GREEN
      ctx.shadowColor = GREEN
      ctx.shadowBlur = line.out ? 0 : 8
      ctx.fillText(text, 28, y)
      lastX = 28 + ctx.measureText(text).width
      lastY = y
      y += line.header ? 44 : 34
    }
    ctx.shadowBlur = 0
    if (cursor) {
      ctx.fillStyle = GREEN
      ctx.fillRect(lastX + 4, lastY + 2, 11, 20)
    }
    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    for (let sy = 0; sy < H; sy += 3) ctx.fillRect(0, sy, W, 1)
    texture.needsUpdate = true
  }

  useFrame(({ clock }) => {
    const s = state.current
    const t = clock.elapsedTime
    if (!powered.current) {
      if (mat.current) mat.current.color.setScalar(0)
      return
    }
    if (s.start === null) s.start = t
    const elapsed = t - s.start
    if (mat.current) mat.current.color.setScalar(elapsed < 0.5 ? (Math.random() > 0.4 ? 1 : 0.25) : 1)

    const chars = Math.min(TOTAL_CHARS, Math.floor(Math.max(0, elapsed - 0.4) * 22))
    const cursor = Math.floor(t * 2) % 2 === 0
    const key = `${chars}|${cursor}|${hovered}`
    if (key !== s.key) {
      s.key = key
      draw(chars, cursor, hovered)
    }
  })

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial ref={mat} map={texture} toneMapped={false} />
    </mesh>
  )
}

export default MonitorScreen
