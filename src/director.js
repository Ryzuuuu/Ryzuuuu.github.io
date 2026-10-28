import Lenis from 'lenis'
import { resolveShot, SPLIT_MIN_WIDTH } from './canvas/shots'

// Turns the scroll position into "what should the exhibit be doing right now".
//
// Every element with `data-shot` is an anchor. Its range runs from its top edge to the next
// anchor's top edge; the camera holds that anchor's shot while the middle of the viewport is
// inside the range and cross-fades into the next one around the boundary.
//
// One animation loop drives everything: Lenis's smoothed scroll, the shot blend the 3D scene
// reads each frame, scroll velocity (so the model can feel how hard you're scrolling), parallax
// and marquees. React only hears about the discrete parts (chapter, tone, monitor screen,
// hovered piece) through `subscribe`, so scrolling never re-renders anything.

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const director = {
  a: { shot: 'hero', param: 0, local: 0 },
  b: { shot: 'hero', param: 0, local: 0 },
  mix: 0,
  velocity: 0, // smoothed, in px per frame; positive = scrolling down
}

let snapshot = { chapter: 'home', screen: 'hero', shot: 'hero', tone: 'light', hovered: null }
const listeners = new Set()
let lenis = null

export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getSnapshot = () => snapshot

const publish = (next) => {
  if (Object.keys(next).every((k) => snapshot[k] === next[k])) return
  snapshot = { ...snapshot, ...next }
  listeners.forEach((fn) => fn())
}

export const setHovered = (hovered) => publish({ hovered })

export const goTo = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.8, force: true })
  else el.scrollIntoView()
}

// Freeze the page behind the phone menu.
export const lockScroll = (locked) => {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (t) => t * t * (3 - 2 * t)
const read = (el, local) => ({ shot: el.dataset.shot, param: Number(el.dataset.param ?? 0), local })
const TONE_COLOR = { light: '#cffef1', dark: '#00160a' }

export const startDirector = () => {
  const root = document.documentElement
  const meta = document.querySelector('meta[name="theme-color"]')

  lenis = reducedMotion ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, autoRaf: false })

  // In-page links glide instead of jumping.
  const onClick = (e) => {
    const a = e.target.closest?.('a[href^="#"]')
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
    const id = a.getAttribute('href').slice(1)
    if (!id || !document.getElementById(id)) return
    e.preventDefault()
    goTo(id)
  }
  document.addEventListener('click', onClick)

  // ── Shots, chapter, tone ────────────────────────────────────────────────────
  const updateShots = () => {
    const anchors = document.querySelectorAll('[data-shot]')
    const n = anchors.length
    if (!n) return
    const vh = window.innerHeight
    const focus = vh * 0.5
    const tops = Array.from(anchors, (el) => el.getBoundingClientRect().top)
    const lastBottom = anchors[n - 1].getBoundingClientRect().bottom

    let i = 0
    for (let k = 0; k < n; k++) if (tops[k] <= focus) i = k
    const start = tops[i]
    const end = i < n - 1 ? tops[i + 1] : lastBottom
    const span = Math.max(1, end - start)
    const local = clamp01((focus - start) / span)
    const blend = Math.min(vh * 0.55, span * 0.5)

    let from = i
    let to = i
    let mix = 0
    if (i < n - 1 && focus > end - blend / 2) {
      to = i + 1
      mix = clamp01((focus - (end - blend / 2)) / blend)
    } else if (i > 0 && focus < start + blend / 2) {
      from = i - 1
      mix = clamp01(0.5 + (focus - start) / blend)
    }

    director.a = read(anchors[from], from === i ? local : 1)
    director.b = read(anchors[to], to === i ? local : 0)
    director.mix = mix

    const lead = anchors[mix < 0.5 ? from : to]
    const tone = lead.closest('[data-tone]')?.dataset.tone ?? 'light'
    if (tone !== snapshot.tone) {
      root.dataset.tone = tone
      meta?.setAttribute('content', TONE_COLOR[tone])
    }
    publish({
      chapter: lead.closest('[data-chapter]')?.dataset.chapter ?? 'home',
      screen: lead.dataset.screen ?? lead.dataset.shot,
      shot: lead.dataset.shot,
      tone,
    })

    // Where the exhibit sits on screen, for the glow and the copy-side scrims.
    const split = window.innerWidth >= SPLIT_MIN_WIDTH
    const sa = resolveShot(director.a.shot, director.a.param, director.a.local, split)
    const sb = resolveShot(director.b.shot, director.b.param, director.b.local, split)
    const m = smooth(mix)
    root.style.setProperty('--fx', (sa.fx + (sb.fx - sa.fx) * m).toFixed(4))
    root.style.setProperty('--fy', (sa.fy + (sb.fy - sa.fy) * m).toFixed(4))

    const max = root.scrollHeight - vh
    root.style.setProperty('--progress', (max > 0 ? clamp01(window.scrollY / max) : 0).toFixed(4))
  }

  // ── Parallax: `data-speed` drifts an element against the scroll ─────────────
  const shift = new WeakMap()
  const updateParallax = () => {
    if (reducedMotion) return
    const mid = window.innerHeight / 2
    document.querySelectorAll('[data-speed]').forEach((el) => {
      const prev = shift.get(el) ?? 0
      const r = el.getBoundingClientRect()
      const centre = r.top - prev + r.height / 2
      if (centre < -window.innerHeight || centre > window.innerHeight * 2) return
      const y = (centre - mid) * -Number(el.dataset.speed)
      shift.set(el, y)
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
    })
  }

  // ── Marquees: drift on their own, speed up when you scroll ──────────────────
  let marquees = []
  const measure = () => {
    marquees = Array.from(document.querySelectorAll('[data-marquee]'), (el) => ({
      track: el.querySelector('.marquee-track'),
      speed: Number(el.dataset.marquee) || 40,
      width: el.querySelector('.marquee-track')?.scrollWidth / 2 || 1,
      x: 0,
    }))
  }
  const updateMarquees = (dt) => {
    for (const m of marquees) {
      if (!m.track) continue
      const boost = reducedMotion ? 0 : Math.min(18, Math.abs(director.velocity)) * 26
      const dir = Math.sign(m.speed) * (director.velocity < -0.5 ? -1 : 1)
      m.x = (m.x - (Math.abs(m.speed) + boost) * dir * dt) % m.width
      if (m.x > 0) m.x -= m.width
      m.track.style.transform = `translate3d(${m.x.toFixed(1)}px, 0, 0)`
    }
  }

  // ── The loop ────────────────────────────────────────────────────────────────
  let raf = 0
  let lastY = -1
  let lastT = performance.now()
  let dirty = true
  const loop = (t) => {
    const dt = Math.min(0.1, (t - lastT) / 1000)
    lastT = t
    lenis?.raf(t)
    const y = window.scrollY
    const raw = lenis ? lenis.velocity : y - (lastY < 0 ? y : lastY)
    director.velocity += (raw - director.velocity) * 0.2
    if (y !== lastY || dirty) {
      updateShots()
      updateParallax()
      lastY = y
      dirty = false
    }
    if (!reducedMotion) updateMarquees(dt)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  const onResize = () => { dirty = true; measure() }
  measure()
  window.addEventListener('resize', onResize, { passive: true })
  // Late layout shifts (web fonts, images) move the anchors without a scroll event.
  const ro = new ResizeObserver(onResize)
  ro.observe(document.body)
  document.fonts?.ready.then(onResize)

  return () => {
    cancelAnimationFrame(raf)
    document.removeEventListener('click', onClick)
    window.removeEventListener('resize', onResize)
    ro.disconnect()
    lenis?.destroy()
    lenis = null
  }
}
