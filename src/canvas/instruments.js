import { profile, projects, sideProjects, tools } from '../constants'

// Everything the monitor can show, drawn on a 2D canvas in phosphor. Each instrument is a small
// model of the real project, using that project's real thresholds and formulas where it has
// them. Any data that's invented for the picture is marked SIMULATED on screen.
//
// No three.js in here, and no state beyond what's passed in: an instrument is a pure function of
// time (and, on the opening screen, of the pointer).

export const W = 1024
export const H = 694
const M = 64

const serif = (px, weight = 700) => `${weight} ${px}px "Bricolage Grotesque", "Arial Black", sans-serif`
// The screen is seen small, so the fine print is set larger than it looks like it should be.
const mono = (px, weight = 400) => `${weight} ${px}px "Martian Mono", ui-monospace, monospace`
export const FONTS = [serif(64), mono(20), mono(20, 500)]

const TAU = Math.PI * 2
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)
const pad = (n, l = 2) => String(n).padStart(l, '0')
// Cheap, stable noise so the pictures repeat without looking looped.
const wob = (t, s = 0) => Math.sin(t * 1.3 + s) * 0.5 + Math.sin(t * 2.9 + s * 2.1) * 0.3 + Math.sin(t * 7.1 + s * 3.7) * 0.2

const kit = (ctx, ink) => {
  const text = (str, x, y, { font = mono(19), color = ink.fg, align = 'left', spacing = 0 } = {}) => {
    ctx.font = font
    ctx.textAlign = align
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`
    ctx.fillStyle = color
    ctx.fillText(str, x, y)
  }
  const line = (pts, { color = ink.fg, width = 2, dash = null, close = false } = {}) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    if (close) ctx.closePath()
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash(dash ?? [])
    ctx.stroke()
    ctx.setLineDash([])
  }
  const rect = (x, y, w, h, color = ink.fg) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
  }
  const dot = (x, y, r, color = ink.fg) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.fillStyle = color
    ctx.fill()
  }
  const ring = (x, y, r, color = ink.fg, width = 2, a0 = 0, a1 = TAU) => {
    ctx.beginPath()
    ctx.arc(x, y, r, a0, a1)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.stroke()
  }
  // Title strip, and an optional line at the bottom.
  const chrome = (left, right, foot) => {
    // Big enough to tell at a glance which screen is up, even with the whole island in view.
    text(left, M, 76, { font: serif(50), spacing: -1 })
    if (right) text(right, W - M, 74, { font: mono(20), color: ink.soft, align: 'right', spacing: 1 })
    rect(M, 92, W - M * 2, 1.5, ink.faint)
    if (foot) {
      rect(M, H - 88, W - M * 2, 1.5, ink.faint)
      text(foot, M, H - 54, { font: mono(17), color: ink.soft, spacing: 1 })
    }
  }
  // Corner marks of a detection box.
  const brackets = (x, y, w, h, len = 22, color = ink.fg, width = 3) => {
    const c = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]
    for (const [cx, cy, dx, dy] of c) line([[cx + dx * len, cy], [cx, cy], [cx, cy + dy * len]], { color, width })
  }
  return { text, line, rect, dot, ring, chrome, brackets }
}

// Twenty-one landmarks, the same topology MediaPipe returns. `curl` runs thumb to pinky, 0 to 1.
const FINGERS = [
  { base: [-0.5, -0.32], angle: -52, len: [0.42, 0.33, 0.26] },
  { base: [-0.32, -0.95], angle: -11, len: [0.46, 0.3, 0.24] },
  { base: [-0.06, -1.04], angle: -2, len: [0.5, 0.34, 0.25] },
  { base: [0.2, -0.98], angle: 7, len: [0.46, 0.31, 0.24] },
  { base: [0.43, -0.82], angle: 18, len: [0.36, 0.24, 0.2] },
]
const hand = (k, ink, cx, cy, s, curl, t, { numbers = false } = {}) => {
  const sway = wob(t * 0.35, 1) * 0.08
  const at = (x, y) => {
    const c = Math.cos(sway)
    const n = Math.sin(sway)
    return [cx + (x * c - y * n) * s, cy + (x * n + y * c) * s]
  }
  const wrist = at(0, 0)
  const points = [wrist]
  const knuckles = []
  FINGERS.forEach((f, i) => {
    let [x, y] = f.base
    let a = (f.angle * Math.PI) / 180
    const c = curl[i]
    // A curling finger folds toward the palm's centre and foreshortens.
    const bend = c * (i < 2 ? 0.55 : -0.28)
    const chain = [at(x, y)]
    knuckles.push(chain[0])
    f.len.forEach((l) => {
      a += bend * 0.5
      const short = l * (1 - c * 0.72)
      x += Math.sin(a) * short
      y -= Math.cos(a) * short
      chain.push(at(x, y))
    })
    k.line(chain, { color: ink.soft, width: 3 })
    points.push(...chain)
  })
  k.line([wrist, knuckles[0], knuckles[1], knuckles[2], knuckles[3], knuckles[4], wrist], { color: ink.soft, width: 3 })
  points.forEach(([x, y], i) => {
    k.dot(x, y, i === 0 ? 8 : 6)
    if (numbers) k.text(String(i), x + 11, y - 8, { font: mono(13), color: ink.soft })
  })
}

export const makeInstruments = (ctx, ink) => {
  const k = kit(ctx, ink)
  const { text, line, rect, dot, ring, chrome, brackets } = k

  // Project id → instrument. Each receives time in seconds.
  const byProject = {
    // Three sensors, real thresholds: TTC under 1.5 s → 150 ms pulse, 1.0 → 300, 0.5 → 500.
    trisense: (t) => {
      chrome('BLIND MODE', 'HC-SR04 × 3  10 Hz', 'TTC < 1.5 s 150 MS    < 1.0 s 300 MS    < 0.5 s 500 MS')
      const cx = W / 2
      const cy = H - 118
      const R = 400
      const sectors = [
        { name: 'L', a: -0.92, seed: 1.7, v: 0.62, off: 0.5 },
        { name: 'C', a: 0, seed: 0.3, v: 0.86, off: 0 },
        { name: 'R', a: 0.92, seed: 2.9, v: 0.5, off: 0.2 },
      ]
      for (let i = 1; i <= 4; i++) ring(cx, cy, (R * i) / 4, ink.faint, 1.5, -Math.PI, 0)
      let centreTTC = 9
      sectors.forEach((c, i) => {
        const a0 = c.a - 0.36
        const a1 = c.a + 0.36
        line([[cx, cy], [cx + Math.sin(a0) * R, cy - Math.cos(a0) * R]], { color: ink.faint, width: 1.5 })
        line([[cx, cy], [cx + Math.sin(a1) * R, cy - Math.cos(a1) * R]], { color: ink.faint, width: 1.5 })
        const range = 3.2
        const cycle = range / c.v + 1.2
        const p = ((t + c.off * cycle) % cycle) / cycle
        const d = Math.max(0.28, range * (1 - p * 1.25))
        const ttc = d / c.v
        const pulse = ttc < 0.5 ? 500 : ttc < 1 ? 300 : ttc < 1.5 ? 150 : 0
        if (i === 1) centreTTC = ttc
        const r = (d / range) * R
        // The echo sweeping out, and the obstacle it found.
        ring(cx, cy, r, pulse ? ink.fg : ink.soft, pulse ? 5 : 3, -Math.PI / 2 + a0, -Math.PI / 2 + a1)
        const sweep = ((t * 2.4 + i * 0.3) % 1) * r
        ring(cx, cy, sweep, ink.faint, 2, -Math.PI / 2 + a0, -Math.PI / 2 + a1)
        const lx = cx + Math.sin(c.a) * (R + 26)
        const ly = cy - Math.cos(c.a) * (R + 26)
        text(`${c.name} ${d.toFixed(2)} m`, lx, ly, { font: mono(18), align: 'center', color: pulse ? ink.fg : ink.soft })
        // Haptic motor.
        const mx = cx - 120 + i * 120
        const on = pulse && Math.floor(t * 10) % 2 === 0
        rect(mx - 42, cy - 2, 84, 16, on ? ink.fg : ink.faint)
      })
      const alert = centreTTC < 1
      text(alert ? '“Obstacle ahead”' : `${Math.min(centreTTC, 9.9).toFixed(1)} s`, cx, cy - 46, {
        font: serif(alert ? 44 : 58), align: 'center',
      })
    },

    // Three checks from docs/MODEL_DECISIONS.md, as stated in the README.
    fasal: (t) => {
      chrome('CHECKED', 'FASAL SAHAAYAK', 'NEVER SHOW A FARMER A NUMBER THAT CAN’T BE JUSTIFIED')
      const rows = [
        { label: 'Fertilizer classifier', a: 'model', av: 14, b: 'chance', bv: 14, unit: '%', max: 28 },
        { label: 'Yield, on future seasons', a: 'model', av: 0.908, b: 'baseline', bv: 0.907, unit: ' R²', max: 1, fix: 3 },
        { label: 'Monsoon rice, rainfall', a: 'bug', av: 38, b: 'real', bv: 1350, unit: ' mm', max: 1500 },
      ]
      const x0 = M
      const bw = W - M * 2 - 190
      rows.forEach((r, i) => {
        const y = 150 + i * 152
        const reveal = smooth(clamp((((t * 0.28) % 1.3) - i * 0.12) * 2.4))
        text(r.label, x0, y, { font: serif(38) })
        ;[[r.a, r.av], [r.b, r.bv]].forEach(([name, v], j) => {
          const by = y + 22 + j * 38
          const w = bw * (v / r.max) * reveal
          text(name.toUpperCase(), x0, by + 21, { font: mono(15), color: ink.soft, spacing: 1 })
          rect(x0 + 100, by + 4, Math.max(2, w), 22, j ? ink.fg : ink.soft)
          const shown = (v * reveal).toLocaleString('en-US', { minimumFractionDigits: r.fix ?? 0, maximumFractionDigits: r.fix ?? 0 })
          text(`${shown}${r.unit}`, x0 + 100 + bw + 76, by + 22, { font: mono(19), align: 'right' })
        })
      })
    },

    neuroecho: (t) => {
      chrome('90 SEC READING TASK', 'SIMULATED', 'A TRIAGE AID. NOT A DIAGNOSIS.')
      const secs = (t * 4) % 90
      const midY = 232
      const pts = []
      for (let x = 0; x <= W - M * 2; x += 3) {
        const u = x * 0.018 + t * 3.2
        const phrase = Math.sin(u * 0.33) + Math.sin(u * 0.12 + 1)
        const voiced = clamp((phrase + 0.45) * 2.2)
        const f = Math.sin(u * 19) * 0.55 + Math.sin(u * 37 + 1) * 0.3 + Math.sin(u * 61) * 0.15
        pts.push([M + x, midY + f * voiced * 92 * (0.65 + 0.35 * Math.sin(u))])
      }
      line(pts, { width: 2 })
      const bars = [
        { name: 'JITTER', v: 0.62 + wob(t, 1) * 0.08, unit: '%', scale: 1.5 },
        { name: 'SHIMMER', v: 3.4 + wob(t, 2) * 0.35, unit: '%', scale: 8 },
        { name: 'HNR', v: 21.5 + wob(t, 3) * 1.1, unit: ' dB', scale: 35 },
        { name: 'PAUSE RATIO', v: 0.19 + wob(t, 4) * 0.02, unit: '', scale: 0.5 },
      ]
      bars.forEach((b, i) => {
        const y = 382 + i * 50
        text(b.name, M, y + 8, { font: mono(17), color: ink.soft, spacing: 1 })
        rect(M + 165, y, 300, 2, ink.faint)
        rect(M + 165, y - 6, 300 * clamp(b.v / b.scale), 14)
        text(`${b.v.toFixed(2)}${b.unit}`, M + 590, y + 8, { font: mono(18), align: 'right' })
      })
      const rx = W - M - 112
      const ry = 462
      const p = clamp(secs / 90)
      ring(rx, ry, 96, ink.faint, 6)
      ring(rx, ry, 96, ink.fg, 6, -Math.PI / 2, -Math.PI / 2 + TAU * p)
      text(`${pad(Math.floor(secs))}`, rx, ry + 12, { font: serif(70), align: 'center' })
      text('SECONDS', rx, ry + 42, { font: mono(13), color: ink.soft, align: 'center', spacing: 1.5 })
    },

    // A floor from a store_layout.json. The foot of the box decides the zone; staff excluded.
    storesight: (t) => {
      chrome('CAM 01', 'SIMULATED', '')
      const fx = M
      const fy = 112
      const fw = 610
      const fh = H - 112 - 54
      const zones = [
        { n: 'ENTRY', x: 0, y: 0.72, w: 0.24, h: 0.28 },
        { n: 'AISLE_A', x: 0.28, y: 0, w: 0.3, h: 0.66 },
        { n: 'AISLE_B', x: 0.62, y: 0, w: 0.38, h: 0.42 },
        { n: 'BILLING', x: 0.62, y: 0.56, w: 0.38, h: 0.44 },
      ]
      zones.forEach((z) => {
        ctx.strokeStyle = ink.faint
        ctx.lineWidth = 1.5
        ctx.strokeRect(fx + z.x * fw, fy + z.y * fh, z.w * fw, z.h * fh)
        text(z.n, fx + z.x * fw + 10, fy + z.y * fh + 24, { font: mono(13), color: ink.soft, spacing: 1 })
      })
      const people = [...Array(8)].map((_, i) => {
        const s = i * 2.13 + 0.4
        const u = t * (0.09 + (i % 3) * 0.018) + s
        const px = 0.5 + 0.44 * Math.sin(u) * Math.cos(u * 0.37 + s)
        // The box stands above the foot point, so keep feet low enough for the head to stay in frame.
        const py = 0.6 + 0.36 * Math.sin(u * 0.71 + s * 2)
        return { i, x: fx + px * fw, y: fy + py * fh, staff: i === 5 }
      })
      const zoneOf = (p) => zones.find((z) => {
        const x = (p.x - fx) / fw
        const y = (p.y - fy) / fh
        return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h
      })
      const counts = {}
      people.forEach((p) => {
        const w = 34
        const h = 66
        const z = zoneOf(p)
        if (z && !p.staff) counts[z.n] = (counts[z.n] ?? 0) + 1
        brackets(p.x - w / 2, p.y - h, w, h, 9, p.staff ? ink.faint : ink.fg, 2)
        dot(p.x, p.y, 4, p.staff ? ink.faint : ink.fg)
        text(p.staff ? 'STF' : `${pad(p.i + 11)}`, p.x - w / 2, p.y - h - 6, { font: mono(13), color: p.staff ? ink.faint : ink.soft })
      })
      // The side panel: zone counts, then an event feed that follows from them.
      const lx = fx + fw + 28
      const lw = W - M - lx
      zones.forEach((z, i) => {
        const y = 136 + i * 32
        text(z.n, lx, y, { font: mono(15), color: ink.soft })
        text(pad(counts[z.n] ?? 0), lx + lw, y, { font: mono(17), align: 'right' })
      })
      rect(lx, 262, lw, 1.5, ink.faint)
      const KINDS = ['ENTRY', 'ZONE_ENTER', 'ZONE_DWELL', 'ZONE_EXIT', 'BILLING_QUEUE_JOIN', 'EXIT', 'REENTRY', 'BILLING_QUEUE_ABANDON']
      const step = Math.floor(t * 0.9)
      for (let i = 0; i < 9; i++) {
        const n = step - i
        const kind = KINDS[Math.abs((n * 7 + (n >> 2)) % KINDS.length)]
        text(kind.length > 16 ? `${kind.slice(0, 15)}.` : kind, lx, 292 + i * 31, { font: mono(14), color: i ? ink.soft : ink.fg })
      }
    },

    // Climb, cruise, descent; a 3° idle path against a 4.5° late one. CO₂ at 3.16 kg per kg of fuel.
    aerosense: (t) => {
      chrome('A320  CLIMB CRUISE DESCENT', 'SIMULATED', '')
      const x0 = M
      const x1 = W - M
      const yb = 400
      const yt = 164
      const p = ((t * 0.042) % 1)
      const alt = (u) => {
        if (u < 0.2) return smooth(u / 0.2)
        if (u < 0.68) return 1
        return Math.max(0, 1 - (u - 0.68) / 0.26)
      }
      const late = (u) => {
        if (u < 0.2) return alt(u)
        if (u < 0.74) return 1
        return Math.max(0, 1 - (u - 0.74) / 0.2)
      }
      const px = (u) => lerp(x0, x1, u)
      const py = (a) => lerp(yb, yt, a)
      const path = (fn, to = 1) => {
        const o = []
        for (let u = 0; u <= to; u += 0.008) o.push([px(u), py(fn(u))])
        return o
      }
      rect(x0, yb, x1 - x0, 1.5, ink.faint)
      for (let u = 0; u <= 1.001; u += 0.1) rect(px(u), yb, 1.5, 8, ink.faint)
      line(path(alt), { color: ink.soft, width: 2, dash: [8, 8] })
      line(path(late), { color: ink.faint, width: 2 })
      line(path(late, p), { width: 3 })
      const ax = px(p)
      const ay = py(late(p))
      dot(ax, ay, 7)
      ring(ax, ay, 15 + ((t * 18) % 16), ink.faint, 2)
      text('3.0° IDLE', px(0.62), py(0.56), { font: mono(14), color: ink.soft, align: 'right' })
      text('4.5° LATE', px(0.86), py(0.72), { font: mono(14) })
      text('TOP OF DESCENT', px(0.71), yt - 16, { font: mono(14), color: ink.soft, align: 'center', spacing: 1 })
      const phase = p < 0.2 ? 'CLIMB' : p < 0.74 ? 'CRUISE' : 'DESCENT'
      const flow = phase === 'CLIMB' ? 7800 : phase === 'CRUISE' ? 2460 + wob(t, 1) * 60 : 520 + wob(t, 2) * 30
      const burned = 9200 * (p < 0.2 ? p * 1.5 : p < 0.74 ? 0.3 + (p - 0.2) * 1.1 : 0.894 + (p - 0.74) * 0.3)
      const cells = [
        ['PHASE', phase],
        ['FL', pad(Math.round(late(p) * 370), 3)],
        ['FUEL FLOW', `${Math.round(flow)} KG/H`],
        ['CO₂', `${Math.round(burned * 3.16).toLocaleString('en-IN')} KG`],
      ]
      cells.forEach(([a, b], i) => {
        const x = M + (i * (W - M * 2)) / 4
        text(a, x, 478, { font: mono(14), color: ink.soft, spacing: 1 })
        text(b, x, 530, { font: i < 2 ? serif(50) : mono(26) })
      })
      text('ADVISORY ONLY. THE PILOT STAYS IN COMMAND.', M, H - 58, { font: mono(16), color: ink.soft, spacing: 1 })
    },

    // Majority vote over the last six frames, four must agree, then a one-second cooldown.
    presento: (t) => {
      chrome('HAND  21 LANDMARKS', 'GESTURE BUFFER', '')
      const GESTURES = [
        { name: 'OPEN PALM', key: 'NEXT →', curl: [0, 0, 0, 0, 0] },
        { name: 'TWO FINGERS', key: 'F5', curl: [1, 0, 0, 1, 1] },
        { name: 'FIST', key: 'SPACE', curl: [1, 1, 1, 1, 1] },
        { name: 'OPEN PALM', key: 'NEXT →', curl: [0, 0, 0, 0, 0] },
      ]
      const period = 3.4
      const idx = Math.floor(t / period)
      const local = (t % period) / period
      const g = GESTURES[idx % GESTURES.length]
      const prev = GESTURES[(idx + GESTURES.length - 1) % GESTURES.length]
      const blend = smooth(clamp(local * 5))
      hand(k, ink, 300, 556, 214, g.curl.map((c, i) => lerp(prev.curl[i], c, blend)), t)
      // Votes arrive one frame at a time; a noisy frame now and then, as there would be.
      const rx = 548
      const cell = (W - M - rx - 5 * 8) / 6
      const frames = Math.min(6, Math.floor(local * 14))
      for (let i = 0; i < 6; i++) {
        const seen = i < frames
        const agrees = (idx * 5 + i * 3) % 7 !== 0
        ctx.strokeStyle = ink.faint
        ctx.lineWidth = 1.5
        ctx.strokeRect(rx + i * (cell + 8), 150, cell, 58)
        if (seen) rect(rx + i * (cell + 8) + 5, 155, cell - 10, 48, agrees ? ink.fg : ink.faint)
      }
      let yes = 0
      for (let i = 0; i < frames; i++) if ((idx * 5 + i * 3) % 7 !== 0) yes++
      const confirmed = yes >= 4
      text(`${yes} OF 6`, rx, 248, { font: mono(17), color: ink.soft, spacing: 1 })
      text(confirmed ? g.name : 'WAITING', W - M, 248, { font: mono(17), align: 'right', color: confirmed ? ink.fg : ink.soft, spacing: 1 })
      text(confirmed ? g.key : '…', rx, 372, { font: serif(92) })
      // The cooldown bar.
      const since = confirmed ? clamp((local - 6 / 14 * 0.7) * period) : 0
      rect(rx, 410, W - M - rx, 2, ink.faint)
      rect(rx, 407, (W - M - rx) * since, 8, ink.fg)
      text('COOLDOWN 1 S', rx, 442, { font: mono(14), color: ink.soft, spacing: 1 })
      // The deck it drives.
      const slide = 1 + idx - Math.floor(idx / 2)
      ctx.strokeStyle = ink.soft
      ctx.lineWidth = 2
      ctx.strokeRect(rx, 482, 148, 94)
      text(pad((slide % 24) + 1), rx + 74, 546, { font: serif(50), align: 'center' })
      text('ANY APP THAT TAKES', rx + 170, 516, { font: mono(14), color: ink.soft })
      text('A KEY PRESS', rx + 170, 542, { font: mono(14), color: ink.soft })
    },

    // One config drives the geometry. Span and girder count move; everything follows.
    parabridge: (t) => {
      const span = 26 + Math.sin(t * 0.34) * 9
      const girders = 3 + Math.round(1.5 + Math.sin(t * 0.17) * 1.5)
      chrome('BridgeConfig', 'ISOMETRIC', `span_m=${span.toFixed(1)}  n_girders=${girders}  n_piles_per_cap=4`)
      const a = -0.72 + Math.sin(t * 0.2) * 0.1
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const scale = 19
      const pr = ([x, y, z]) => {
        const rx = x * ca - z * sa
        const rz = x * sa + z * ca
        return [W / 2 + rx * scale, 290 - y * scale + rz * scale * 0.5]
      }
      const L = span / 2
      const width = 10
      const seg = (p, q, opts) => line([pr(p), pr(q)], opts)
      // Deck slab.
      const deck = [[-L, 4, -width / 2], [L, 4, -width / 2], [L, 4, width / 2], [-L, 4, width / 2]]
      line(deck.map(pr), { close: true, color: ink.soft, width: 2 })
      for (let i = 1; i < 10; i++) {
        const x = lerp(-L, L, i / 10)
        seg([x, 4, -width / 2], [x, 4, width / 2], { color: ink.faint, width: 1 })
      }
      // Girders and X cross-frames.
      const gz = [...Array(girders)].map((_, i) => lerp(-width / 2 + 1, width / 2 - 1, girders > 1 ? i / (girders - 1) : 0.5))
      gz.forEach((z) => {
        seg([-L, 3.2, z], [L, 3.2, z], { width: 3 })
        seg([-L, 2.2, z], [L, 2.2, z], { width: 3 })
      })
      for (let f = 0; f <= 6; f++) {
        const x = lerp(-L, L, f / 6)
        for (let i = 0; i < gz.length - 1; i++) {
          seg([x, 3.2, gz[i]], [x, 2.2, gz[i + 1]], { color: ink.soft, width: 1.5 })
          seg([x, 2.2, gz[i]], [x, 3.2, gz[i + 1]], { color: ink.soft, width: 1.5 })
        }
      }
      // Hammerhead caps, piers, pile caps, and a 2 × 2 pile group under each.
      ;[-L + 2, L - 2].forEach((x) => {
        line([[x - 1, 2, -5], [x + 1, 2, -5], [x + 1, 2, 5], [x - 1, 2, 5]].map(pr), { close: true, width: 2 })
        ;[-2.4, 2.4].forEach((z) => {
          seg([x, 2, z], [x, -7, z], { width: 3 })
          line([[x - 1.8, -7, z - 1.8], [x + 1.8, -7, z - 1.8], [x + 1.8, -7, z + 1.8], [x - 1.8, -7, z + 1.8]].map(pr), { close: true, color: ink.soft, width: 2 })
          ;[[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(([dx, dz]) => {
            seg([x + dx, -7, z + dz], [x + dx, -11, z + dz], { color: ink.soft, width: 1.5 })
          })
        })
      })
    },
  }

  // Everything else the screen can show. Static cards ignore `t`.
  const cards = {
    // The tracker. A box follows the visitor's pointer, with the lag a real one would have.
    hero: (t, { pointer }) => {
      chrome('TRACKING', 'CAM 00', '')
      const fx = M
      const fy = 112
      const fw = W - M * 2
      const fh = H - 112 - 92
      for (let i = 1; i < 6; i++) rect(fx + (fw * i) / 6, fy, 1.5, fh, 'rgba(255,255,255,0.03)')
      for (let i = 1; i < 4; i++) rect(fx, fy + (fh * i) / 4, fw, 1.5, 'rgba(255,255,255,0.03)')
      brackets(fx, fy, fw, fh, 30, ink.faint, 2)
      const live = pointer.seen
      const w = 196 + wob(t, 1) * 6
      const h = 148 + wob(t, 2) * 6
      const bx = fx + pointer.x * fw
      const by = fy + pointer.y * fh
      pointer.trail.forEach((p, i) => {
        dot(fx + p.x * fw, fy + p.y * fh, 1 + (i / pointer.trail.length) * 3, ink.faint)
      })
      brackets(bx - w / 2, by - h / 2, w, h, 24, live ? ink.fg : ink.soft, 3)
      line([[bx - 9, by], [bx + 9, by]], { color: ink.soft, width: 2 })
      line([[bx, by - 9], [bx, by + 9]], { color: ink.soft, width: 2 })
      const conf = (0.94 + wob(t * 2, 3) * 0.04).toFixed(2)
      const label = live ? `you  ${conf}` : 'searching'
      const ly = by - h / 2 - 12
      text(label, clamp(bx - w / 2, fx, fx + fw - 180), ly < fy + 22 ? by + h / 2 + 28 : ly, { font: mono(21, 500) })
      const secs = Math.floor(pointer.dwell)
      text(`X ${pointer.x.toFixed(2)}  Y ${pointer.y.toFixed(2)}`, M, H - 44, { font: mono(18), color: ink.soft, spacing: 1 })
      text(`ON PAGE ${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`, W - M, H - 44, { font: mono(18), color: ink.soft, align: 'right', spacing: 1 })
    },

    'process-0': (t) => {
      chrome('main.py', 'BUILD 0.1')
      const LOG = [
        '$ python main.py', 'loading model...', 'here', 'frame 0001  None', 'here 2', 'frame 0002  None',
        'why is this None', 'frame 0003  ok', 'frame 0004  ok', 'print(boxes)', '[[ 212 88 401 372 ]]',
        'frame 0005  ok', 'it works', 'frame 0006  ok', 'frame 0007  ok', 'frame 0008  ok',
      ]
      const n = Math.floor(t * 2.2) % (LOG.length + 6)
      const shown = LOG.slice(Math.max(0, n - 12), n)
      shown.forEach((l, i) => {
        text(l, M, 142 + i * 39, { font: mono(23), color: i === shown.length - 1 ? ink.fg : ink.soft })
      })
      if (Math.floor(t * 2) % 2 === 0) rect(M, 124 + shown.length * 39, 14, 24)
    },

    // The smoothing is TriSense's: an EMA at alpha 0.6, which lets the real input through.
    'process-1': (t) => {
      chrome('INPUT', 'BUILD 0.9', 'EMA  α = 0.6')
      const raw = []
      const ema = []
      let e = 0
      const A = 0.6
      const span = W - M * 2
      for (let x = 0; x <= span; x += 6) {
        const u = x * 0.012 + t * 1.3
        const signal = Math.sin(u) * 86 + Math.sin(u * 0.37) * 34
        const noise = Math.sin(u * 37.7) * 30 + Math.sin(u * 91.3) * 22 + (Math.sin(u * 5.1) > 0.93 ? 96 : 0)
        const v = signal + noise
        e = x === 0 ? v : A * e + (1 - A) * v
        raw.push([M + x, 200 + v * 0.62])
        ema.push([M + x, 432 + e * 0.75])
      }
      text('RAW', M, 118, { font: mono(15), color: ink.soft, spacing: 1 })
      line(raw, { color: ink.soft, width: 2 })
      text('SMOOTHED', M, 340, { font: mono(15), color: ink.soft, spacing: 1 })
      line(ema, { width: 3 })
    },

    'process-2': (t) => {
      chrome('BUILD 1.0', 'PASSING')
      text('Ready.', W / 2, 372, { font: serif(208), align: 'center', spacing: -5 })
      if (Math.floor(t * 1.6) % 2 === 0) rect(W / 2 + 290, 262, 10, 116)
    },

    about: (t) => {
      chrome(profile.first.toUpperCase(), 'VIT BHOPAL  2027')
      const opening = (Math.sin(t * 0.7) + 1) / 2
      const curl = [0, 1, 2, 3, 4].map((i) => clamp((Math.sin(t * 0.7 + i * 0.5) + 1) / 2) * (0.25 + 0.75 * opening))
      hand(k, ink, W / 2 + 170, H - 76, 266, curl, t, { numbers: true })
      text('21', M, 248, { font: serif(150), spacing: -3 })
      text('LANDMARKS', M + 4, 292, { font: mono(17), color: ink.soft, spacing: 2 })
      const now = new Date(Date.now() + 5.5 * 3600 * 1000)
      const clock = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`
      text(clock, M, H - 96, { font: mono(38) })
      text('IST', M + 4, H - 62, { font: mono(15), color: ink.soft, spacing: 2 })
    },

    toolbox: (t) => {
      chrome('TOOLS', 'FAN ON')
      const row = (H - 134) / tools.length
      const live = Math.floor(t * 0.8) % tools.length
      tools.forEach(({ verb, items }, i) => {
        const y = 150 + i * row
        const on = i === live
        if (on) rect(M, y - 38, 5, 50)
        text(verb, M + 22, y, { font: serif(42), color: on ? ink.fg : ink.soft })
        text(items.slice(0, 3).join('  ').toUpperCase(), W - M, y - 4, { font: mono(14), color: on ? ink.fg : ink.soft, align: 'right', spacing: 0.5 })
      })
    },

    work: (t) => {
      chrome('CARTRIDGES', pad(projects.length))
      const live = Math.floor(t * 0.75) % projects.length
      const row = (H - 136) / projects.length
      projects.forEach(({ title, status }, i) => {
        const y = 164 + i * row
        const on = i === live
        if (on) rect(M, y - 50, W - M * 2, row - 8, ink.faint)
        text(pad(i + 1), M + 14, y - 8, { font: mono(17), color: on ? ink.fg : ink.soft })
        text(title, M + 66, y - 2, { font: serif(50), color: on ? ink.fg : ink.soft, spacing: -0.5 })
        text(status.toUpperCase(), W - M - 14, y - 8, { font: mono(14), color: ink.soft, align: 'right', spacing: 1 })
      })
    },

    archive: () => {
      chrome('ALSO', pad(sideProjects.length))
      const row = (H - 136) / sideProjects.length
      sideProjects.forEach(({ title }, i) => {
        text(title, M, 172 + i * row, { font: serif(66), spacing: -1 })
      })
    },

    contact: (t) => {
      chrome('LINE OPEN', 'TX')
      const pts = []
      for (let x = 0; x <= W - M * 2; x += 4) {
        const u = x / (W - M * 2)
        const env = Math.sin(u * Math.PI) ** 2
        pts.push([M + x, 232 + Math.sin(u * 62 - t * 5) * Math.sin(u * 7 + t) * 74 * env])
      }
      line(pts, { width: 2.5 })
      const size = 58
      ctx.font = serif(size)
      text(profile.email, W / 2, 462, { font: serif(size), align: 'center', spacing: -0.5 })
      const w = ctx.measureText(profile.email).width
      if (Math.floor(t * 1.6) % 2 === 0) rect(W / 2 + w / 2 + 8, 416, 5, 58)
    },

    colophon: () => {
      chrome('END OF TAPE', '')
      text('Thanks for', W / 2, 320, { font: serif(128), align: 'center', spacing: -3 })
      text('watching.', W / 2, 450, { font: serif(128), align: 'center', spacing: -3 })
    },
  }

  return (screen, t, input) => {
    if (screen.startsWith('work-')) {
      const p = projects[Number(screen.slice(5))]
      const run = p && byProject[p.id]
      if (run) {
        run(t)
        return
      }
    }
    ;(cards[screen] ?? cards.hero)(t, input)
  }
}

// The screens that never change between frames, and so never need repainting.
export const isStatic = (screen) => screen === 'archive' || screen === 'colophon'
