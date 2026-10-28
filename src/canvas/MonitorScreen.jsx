/* eslint-disable react-hooks/immutability -- the canvas texture is redrawn imperatively from the frame loop */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSnapshot } from '../director'
import { rgb } from '../palette'
import { loadout, profile, projects, sideQuests, stats } from '../constants'

const W = 1024
const H = 694
const M = 64 // margin
const big = (px) => `800 ${px}px "Bricolage Grotesque", "Arial Black", sans-serif`
const mono = (px) => `500 ${px}px "Martian Mono", ui-monospace, monospace`
const aside = (px) => `italic 500 ${px}px "Schibsted Grotesk", system-ui, sans-serif`
const FONTS = [big(64), mono(20), aside(32)]
const pad = (n) => String(n).padStart(2, '0')

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Monochrome teal phosphor, mixed from the palette.
const makeInk = () => ({
  bg: rgb('text'),
  glow: rgb('primary', 0.4),
  fg: rgb('highlight'),
  soft: rgb('border-muted'),
  faint: rgb('border', 0.45),
})

const draw = (ctx, ink) => {
  const write = (str, x, y, { font, color = ink.fg, align = 'left', spacing = 0, glow = 14 }) => {
    ctx.font = font
    ctx.textAlign = align
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`
    ctx.fillStyle = color
    ctx.shadowColor = ink.fg
    ctx.shadowBlur = glow
    ctx.fillText(str, x, y)
    ctx.shadowBlur = 0
  }
  // Big words: tight tracking, shrunk to fit if they'd overflow.
  const shout = (str, x, y, px, { align = 'center', maxW = W - M * 2 } = {}) => {
    ctx.font = big(px)
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${-px * 0.045}px`
    const w = ctx.measureText(str).width
    const size = w > maxW ? Math.floor((px * maxW) / w) : px
    write(str, x, y, { font: big(size), align, spacing: -size * 0.045, glow: 24 })
    return size
  }
  const rule = (y) => {
    ctx.fillStyle = ink.faint
    ctx.fillRect(M, y, W - M * 2, 2)
  }
  const chrome = (left, right, footer) => {
    write(left, M, 76, { font: mono(19), color: ink.soft, spacing: 2, glow: 4 })
    if (right) write(right, W - M, 76, { font: mono(19), color: ink.soft, align: 'right', spacing: 2, glow: 4 })
    rule(102)
    if (footer) {
      rule(H - 108)
      write(footer, W / 2, H - 66, { font: mono(17), color: ink.soft, align: 'center', spacing: 2, glow: 4 })
    }
  }

  return {
    hero: () => {
      chrome('NM-OS 2.6', 'READY', 'SCROLL TO BOOT ↓')
      shout('hi.', W / 2, 430, 300)
    },
    'process-0': () => {
      chrome('BUILD 0.1', 'STEP 1/3', 'MOSTLY PRINT STATEMENTS')
      shout('it runs.', W / 2, 360, 190)
      write('(barely)', W / 2, 450, { font: aside(44), color: ink.soft, align: 'center', glow: 6 })
    },
    'process-1': () => {
      chrome('BUILD 0.9', 'STEP 2/3', 'TESTED ON A SHAKY WEBCAM')
      shout('it survives.', W / 2, 360, 170)
      write('(even the Pi)', W / 2, 450, { font: aside(44), color: ink.soft, align: 'center', glow: 6 })
    },
    'process-2': () => {
      chrome('BUILD 1.0', 'STEP 3/3', 'NOW WITH FONTS')
      shout('it’s pretty.', W / 2, 360, 170)
      write('(finally)', W / 2, 450, { font: aside(44), color: ink.soft, align: 'center', glow: 6 })
    },
    about: () => {
      chrome('WHOAMI', 'NM-01')
      shout('student dev.', M, 232, 120, { align: 'left' })
      write('edge ai · vision · interactive web', M + 4, 292, { font: aside(30), color: ink.soft, glow: 6 })
      rule(350)
      const col = (W - M * 2) / stats.length
      stats.forEach(({ value, suffix, short }, i) => {
        const x = M + col * i
        shout(`${value}${suffix}`, x, 494, 120, { align: 'left', maxW: col - 20 })
        write(short.toUpperCase(), x + 4, 556, { font: mono(17), color: ink.soft, spacing: 2, glow: 4 })
      })
    },
    toolbox: () => {
      chrome('TOOLBOX', 'FAN: ON')
      loadout.forEach(({ group, items }, i) => {
        const y = 204 + i * 114
        shout(group.toLowerCase(), M, y, 74, { align: 'left', maxW: W - M * 2 - 190 })
        write(`${pad(items.length)} TOOLS`, W - M, y - 10, { font: mono(17), color: ink.soft, align: 'right', spacing: 2, glow: 4 })
        if (i < loadout.length - 1) {
          ctx.fillStyle = ink.faint
          ctx.fillRect(M, y + 34, W - M * 2, 2)
        }
      })
    },
    work: () => {
      chrome('SELECT A CARTRIDGE', pad(projects.length))
      projects.forEach(({ title, status }, i) => {
        const y = 182 + i * 82
        write(pad(i + 1), M, y - 8, { font: mono(19), color: ink.soft, glow: 4 })
        shout(title, M + 92, y, 58, { align: 'left', maxW: W - M * 2 - 160 })
        if (status === 'In progress') write('● LIVE', W - M, y - 10, { font: mono(15), align: 'right', glow: 10 })
      })
    },
    archive: () => {
      chrome('B-SIDES', pad(sideQuests.length))
      sideQuests.forEach(({ title }, i) => {
        const y = 214 + i * 112
        shout(title, M, y, 76, { align: 'left' })
      })
    },
    contact: (blink) => {
      chrome('SAY HI', 'LINE OPEN', 'I READ EVERYTHING')
      shout('say hi.', W / 2, 360, 230)
      ctx.font = mono(25)
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1px'
      const w = ctx.measureText(profile.email).width
      write(profile.email, W / 2 - 14, 462, { font: mono(25), align: 'center', spacing: 1, glow: 8 })
      if (blink) {
        ctx.fillStyle = ink.fg
        ctx.fillRect(W / 2 + w / 2 - 4, 438, 14, 30)
      }
    },
    colophon: () => {
      chrome('END OF TAPE', 'THANKS', profile.name.toUpperCase())
      shout('fin.', W / 2, 440, 300)
    },
    work_i: (i) => {
      const p = projects[i]
      chrome(`CARTRIDGE ${pad(i + 1)}/${pad(projects.length)}`, p.genre.toUpperCase(), p.tags.join(' · ').toUpperCase())
      const size = shout(p.title, W / 2, 318, 150)
      write(p.quip, W / 2, 318 + Math.max(70, size * 0.6), { font: aside(40), color: ink.soft, align: 'center', glow: 6 })
      const live = p.status === 'In progress'
      write(live ? '● IN PROGRESS' : 'SHIPPED ✓', W / 2, 520, { font: mono(20), align: 'center', spacing: 3, glow: live ? 12 : 4, color: live ? ink.fg : ink.soft })
    },
  }
}

// A monochrome phosphor display painted onto a canvas and shown on the monitor.
const MonitorScreen = ({ position, size, powered }) => {
  const mesh = useRef()
  const mat = useRef()
  const { ctx, texture, ink } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { ctx: canvas.getContext('2d'), texture, ink: makeInk() }
  }, [])
  const cards = useMemo(() => draw(ctx, ink), [ctx, ink])
  const state = useRef({ start: null, key: '', shown: null, switchT: 1 })

  useEffect(() => {
    // Redraw once the web fonts arrive so the screen doesn't keep the fallback fonts.
    Promise.all(FONTS.map((f) => document.fonts?.load(f))).then(() => { state.current.key = '' })
    return () => texture.dispose()
  }, [texture])

  const paint = (key, blink) => {
    ctx.shadowBlur = 0
    ctx.fillStyle = ink.bg
    ctx.fillRect(0, 0, W, H)
    const glow = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.72)
    glow.addColorStop(0, ink.glow)
    glow.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'alphabetic'
    if (key.startsWith('work-')) cards.work_i(Number(key.slice(5)))
    else (cards[key] ?? cards.hero)(blink)
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
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
      paint(s.shown, blink)
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
