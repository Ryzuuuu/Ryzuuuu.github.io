import { resolveShot, SPLIT_MIN_WIDTH } from './canvas/shots'

// Turns the scroll position into "what should the exhibit be doing right now".
//
// Every element with `data-shot` is an anchor. Its range runs from its top edge to the next
// anchor's top edge; the camera holds that anchor's shot while the middle of the viewport is
// inside the range and cross-fades into the next one around the boundary.
//
// The 3D scene reads `director` every frame. React only hears about the discrete parts
// (chapter, screen, hovered piece) through `subscribe`, and the continuous parts go straight
// to CSS custom properties, so scrolling never re-renders anything.

export const director = {
  a: { shot: 'hero', param: 0, local: 0 },
  b: { shot: 'hero', param: 0, local: 0 },
  mix: 0,
}

let snapshot = { chapter: 'home', screen: 'hero', shot: 'hero', hovered: null }
const listeners = new Set()

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

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (t) => t * t * (3 - 2 * t)
const read = (el, local) => ({ shot: el.dataset.shot, param: Number(el.dataset.param ?? 0), local })

export const startDirector = () => {
  const root = document.documentElement
  let frame = 0

  const update = () => {
    frame = 0
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
    publish({
      chapter: lead.closest('[data-chapter]')?.dataset.chapter ?? 'home',
      screen: lead.dataset.screen ?? lead.dataset.shot,
      shot: lead.dataset.shot,
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

  const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
  update()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  // Late layout shifts (web fonts, images) move the anchors without a scroll event.
  const ro = new ResizeObserver(schedule)
  ro.observe(document.body)

  return () => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    ro.disconnect()
    cancelAnimationFrame(frame)
  }
}

export const goTo = (id) => document.getElementById(id)?.scrollIntoView()
