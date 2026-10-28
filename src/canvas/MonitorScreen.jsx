/* eslint-disable react-hooks/immutability -- the canvas texture is redrawn imperatively from the frame loop */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSnapshot } from '../director'
import { loadout, profile, projects, sideQuests, stats } from '../constants'

const W = 1024
const H = 694
const M = 72 // margin
const BG = '#120a04'
const AMBER = '#f7c67c'
const SOFT = 'rgba(247,198,124,0.62)'
const FAINT = 'rgba(247,198,124,0.26)'
const serif = (px, italic = true) => `${italic ? 'italic ' : ''}500 ${px}px "Cormorant Garamond", Georgia, serif`
const sans = (px) => `500 ${px}px Jost, system-ui, sans-serif`
const FONTS = [serif(64), serif(64, false), sans(24)]
const pad = (n) => String(n).padStart(2, '0')
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi']

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const write = (ctx, str, x, y, { font, color = AMBER, align = 'left', spacing = 0, glow = 14 }) => {
  ctx.font = font
  ctx.textAlign = align
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`
  ctx.fillStyle = color
  ctx.shadowColor = AMBER
  ctx.shadowBlur = glow
  // Letter-spacing pads the right edge too; nudge centred/right text back so it sits true.
  const nudge = align === 'center' ? spacing / 2 : align === 'right' ? spacing : 0
  ctx.fillText(str, x + nudge, y)
  ctx.shadowBlur = 0
}

const fitSerif = (ctx, str, maxW, px, italic = true) => {
  ctx.font = serif(px, italic)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  const w = ctx.measureText(str).width
  return w > maxW ? Math.floor((px * maxW) / w) : px
}

const rule = (ctx, y) => {
  ctx.fillStyle = FAINT
  ctx.fillRect(M, y, W - M * 2, 2)
}

const chrome = (ctx, left, right, footer) => {
  write(ctx, left, M, 80, { font: sans(21), spacing: 6, color: SOFT, glow: 6 })
  if (right) write(ctx, right, W - M, 80, { font: sans(21), spacing: 6, color: SOFT, align: 'right', glow: 6 })
  rule(ctx, 112)
  if (footer) {
    rule(ctx, H - 114)
    write(ctx, footer, W / 2, H - 76, { font: sans(19), spacing: 7, color: SOFT, align: 'center', glow: 6 })
  }
}

// One title card per screen key. Keys come from `data-screen` on the page's scroll anchors.
const CARDS = {
  hero: (ctx) => {
    chrome(ctx, 'EXHIBIT No. 01', 'MMXXVI', 'SCROLL TO BEGIN')
    write(ctx, profile.initials, W / 2, 352, { font: serif(250), align: 'center', glow: 26 })
    write(ctx, profile.name.toUpperCase(), W / 2, 468, { font: sans(27), spacing: 9, align: 'center', glow: 10 })
  },
  manifesto: (ctx) => {
    chrome(ctx, 'IN THE ROUND', '360°', 'THE WHOLE PHILOSOPHY')
    write(ctx, 'Ship it.', W / 2, 318, { font: serif(150), align: 'center', glow: 24 })
    write(ctx, 'Then make it beautiful.', W / 2, 448, { font: serif(74), align: 'center', glow: 16 })
  },
  about: (ctx) => {
    chrome(ctx, 'I · PROFILE', 'NM-01')
    write(ctx, 'Student developer', M, 232, { font: serif(96), glow: 22 })
    write(ctx, 'EDGE AI · VISION · 3D WEB', M + 4, 296, { font: sans(22), spacing: 6, color: SOFT, glow: 6 })
    rule(ctx, 360)
    const col = (W - M * 2) / stats.length
    stats.forEach(({ value, short }, i) => {
      const x = M + col * i
      write(ctx, value, x, 498, { font: serif(110, false), glow: 22 })
      write(ctx, short.toUpperCase(), x + 4, 560, { font: sans(18), spacing: 5, color: SOFT, glow: 4 })
    })
  },
  expertise: (ctx) => {
    chrome(ctx, 'II · EXPERTISE', 'MECHANISM RUNNING')
    loadout.forEach(({ group, items }, i) => {
      const y = 214 + i * 112
      write(ctx, `${ROMAN[i]}.`, M, y, { font: serif(52), color: SOFT, glow: 10 })
      write(ctx, group, M + 92, y, { font: serif(70, false), glow: 18 })
      write(ctx, `${pad(items.length)} TOOLS`, W - M, y - 8, { font: sans(18), spacing: 5, color: SOFT, align: 'right', glow: 4 })
      if (i < loadout.length - 1) {
        ctx.fillStyle = 'rgba(247,198,124,0.12)'
        ctx.fillRect(M, y + 38, W - M * 2, 2)
      }
    })
  },
  work: (ctx) => {
    chrome(ctx, 'III · SELECTED WORK', `${pad(projects.length)} CARTRIDGES`)
    projects.forEach(({ title, status }, i) => {
      const y = 186 + i * 82
      write(ctx, `No. ${pad(i + 1)}`, M, y - 6, { font: sans(19), spacing: 4, color: SOFT, glow: 4 })
      write(ctx, title, M + 150, y, { font: serif(56, false), glow: 14 })
      if (status === 'In progress') write(ctx, '●', W - M, y - 8, { font: sans(18), align: 'right', glow: 12 })
    })
  },
  archive: (ctx) => {
    chrome(ctx, 'III b · ARCHIVE', 'SIDE PROJECTS')
    sideQuests.forEach(({ title, note }, i) => {
      const y = 200 + i * 116
      write(ctx, title, M, y, { font: serif(62), glow: 16 })
      write(ctx, note.toUpperCase(), M + 2, y + 40, { font: sans(16), spacing: 4, color: SOFT, glow: 4 })
    })
  },
  contact: (ctx, blink) => {
    chrome(ctx, 'IV · CORRESPONDENCE', 'LINE OPEN', 'I READ EVERY MESSAGE')
    write(ctx, 'Write to me.', W / 2, 322, { font: serif(150), align: 'center', glow: 26 })
    ctx.font = sans(28)
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px'
    const w = ctx.measureText(profile.email).width
    write(ctx, profile.email, W / 2 - 16, 440, { font: sans(28), spacing: 2, align: 'center', glow: 10 })
    if (blink) {
      ctx.fillStyle = AMBER
      ctx.fillRect(W / 2 + w / 2 - 6, 414, 14, 32)
    }
  },
  colophon: (ctx) => {
    chrome(ctx, 'END OF EXHIBIT', 'MMXXVI', profile.name.toUpperCase())
    write(ctx, 'Fin.', W / 2, 400, { font: serif(230), align: 'center', glow: 30 })
  },
}

const workCard = (i) => (ctx) => {
  const p = projects[i]
  chrome(ctx, `III · WORK No. ${pad(i + 1)}`, `${pad(i + 1)} / ${pad(projects.length)}`, p.tags.join(' · ').toUpperCase())
  write(ctx, p.genre.toUpperCase(), W / 2, 224, { font: sans(22), spacing: 7, color: SOFT, align: 'center', glow: 6 })
  const px = fitSerif(ctx, p.title, W - M * 2 - 40, 150)
  write(ctx, p.title, W / 2, 330 + px * 0.25, { font: serif(px), align: 'center', glow: 26 })
  const live = p.status === 'In progress'
  write(ctx, `${live ? '●  ' : ''}${p.status.toUpperCase()}`, W / 2, 490, { font: sans(22), spacing: 7, align: 'center', glow: live ? 14 : 6, color: live ? AMBER : SOFT })
}

const cardFor = (key) => (key.startsWith('work-') ? workCard(Number(key.slice(5))) : (CARDS[key] ?? CARDS.hero))

// Amber phosphor display painted onto a canvas and shown on the monitor.
const MonitorScreen = ({ position, size, powered }) => {
  const mesh = useRef()
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
  const state = useRef({ start: null, key: '', shown: null, switchT: 1 })

  useEffect(() => {
    // Redraw once the web fonts arrive so the screen doesn't keep the fallback fonts.
    Promise.all(FONTS.map((f) => document.fonts?.load(f))).then(() => { state.current.key = '' })
    return () => texture.dispose()
  }, [texture])

  const draw = (key, blink) => {
    ctx.shadowBlur = 0
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
    const glow = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.72)
    glow.addColorStop(0, 'rgba(247,170,80,0.13)')
    glow.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'alphabetic'
    cardFor(key)(ctx, blink)
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2)
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

    const blink = s.shown === 'contact' && Math.floor(t * 1.6) % 2 === 0
    const key = `${s.shown}|${blink}`
    if (key !== s.key) {
      s.key = key
      draw(s.shown, blink)
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial ref={mat} map={texture} toneMapped={false} />
    </mesh>
  )
}

export default MonitorScreen
