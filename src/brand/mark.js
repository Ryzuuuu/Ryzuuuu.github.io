// The mark: a blue lotus seen from above (নীলাব্জ, Neelabja, means blue lotus), set like a jewel in
// a night-blue disc. Each petal is folded down its middle, lit on one side and in shadow on the
// other, so the flower reads as faceted and three-dimensional. Its rows are offset by half a
// petal, as on the real flower, around a golden heart of stamens, and a small gold satellite
// circles the rim: the signal the console's antenna is listening for.
//
// This file is the single source of the drawing. drawMark() returns the SVG's inner markup; the
// React component (Logo.jsx) and the exported files (scripts/build-brand.mjs) both use it, so
// they can't drift apart. It's drawn on a 64-unit square centred on the origin, so every part
// turns about the middle. The class names are what index.css animates on the site.

export const VIEW_BOX = '-32 -32 64 64'

const n = (v) => Number(v.toFixed(2))

// One half of a petal pointing up, from `inner` to `outer` units out: out along the edge to the
// tip, then straight back down the fold. `side` is 1 for the right half, -1 for the left.
const half = (inner, outer, width, side) => {
  const y = (t) => n(-(inner + (outer - inner) * t))
  const x = (v) => n(v * width * side)
  return `M0 ${y(0)}C${x(0.75)} ${y(0.06)} ${x(1)} ${y(0.34)} ${x(0.84)} ${y(0.56)}C${x(0.64)} ${y(0.8)} ${x(0.36)} ${y(0.92)} 0 ${y(1)}Z`
}

const around = (count, offset = 0) => Array.from({ length: count }, (_, i) => n(offset + (i * 360) / count))

const row = (id, inner, outer, width, count, offset) => ({
  id,
  lit: half(inner, outer, width, -1),
  shade: half(inner, outer, width, 1),
  angles: around(count, offset),
  from: -inner,
  to: -outer,
})

// Two optical sizes, as a typeface would have: `full` from about 48 px up, and `compact`, with
// fewer and bolder parts, for the nav bar and the favicon.
const SIZES = {
  full: {
    layers: [row('back', 7, 25.5, 7.4, 8, 0), row('middle', 6, 20, 6.4, 8, 22.5), row('front', 4.5, 13.5, 4.6, 8, 0)],
    heart: { radius: 5.2, rays: 16, ray: [5.6, 7.4] },
    orbit: { radius: 27.9, width: 0.5, dot: 1.4 },
    gap: 0.55,
  },
  compact: {
    layers: [row('back', 7, 26.5, 9.4, 8, 0), row('middle', 5.5, 19, 7.8, 8, 22.5)],
    heart: { radius: 6.2, rays: 0, ray: null },
    orbit: { radius: 28.6, width: 1, dot: 2.1 },
    gap: 0.9,
  },
}

export const markGeometry = (size = 'full') => SIZES[size]

// Each row's lit and shaded halves fade from base to tip: pale, almost white at the heart,
// deepening through neel to a violet edge, as the real flower does.
export const COLORWAYS = {
  jewel: {
    disc: ['#1d2f78', '#070b26'],
    rim: '#4a63c9',
    glow: '#5f8cff',
    back: { lit: ['#a9cdff', '#4a63e0'], shade: ['#7aa4f2', '#2c2a9e'] },
    middle: { lit: ['#e2f0ff', '#7b98f4'], shade: ['#b2cfff', '#4a5bd6'] },
    front: { lit: ['#ffffff', '#c4dcff'], shade: ['#e8f2ff', '#94b4f6'] },
    heart: ['#fff6cf', '#f6bd3c', '#c0700f'],
    ray: '#ffe08a',
    orbit: '#7f9cff',
    satellite: '#ffd86b',
    gap: '#0b1240',
  },
  mono: {
    disc: null,
    rim: null,
    glow: null,
    back: { lit: ['currentColor', 'currentColor'], shade: ['currentColor', 'currentColor'] },
    middle: { lit: ['currentColor', 'currentColor'], shade: ['currentColor', 'currentColor'] },
    front: { lit: ['currentColor', 'currentColor'], shade: ['currentColor', 'currentColor'] },
    heart: ['currentColor', 'currentColor', 'currentColor'],
    ray: 'currentColor',
    orbit: 'currentColor',
    satellite: 'currentColor',
    gap: '#ffffff',
  },
}

const linear = (id, [a, b], from, to) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${from}" x2="0" y2="${to}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`

// The SVG's inner markup. `key` makes the gradient ids unique when several marks share a page.
export const drawMark = (size = 'full', c = COLORWAYS.jewel, key = 'mark') => {
  const { layers, heart, orbit, gap } = SIZES[size]
  const id = (name) => `${key}-${name}`
  const defs = []
  const parts = []

  if (c.disc) {
    defs.push(`<radialGradient id="${id('disc')}" cx="0.5" cy="0.36" r="0.66"><stop offset="0" stop-color="${c.disc[0]}"/><stop offset="1" stop-color="${c.disc[1]}"/></radialGradient>`)
    defs.push(`<radialGradient id="${id('glow')}"><stop offset="0" stop-color="${c.glow}" stop-opacity="0.75"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>`)
    parts.push(`<circle class="logo__disc" r="31.5" fill="url(#${id('disc')})"/>`)
    parts.push(`<circle class="logo__glow" r="24" fill="url(#${id('glow')})"/>`)
    parts.push(`<circle r="31" fill="none" stroke="${c.rim}" stroke-width="0.8" opacity="0.7"/>`)
    // A sheen across the top of the disc, as on glass.
    parts.push(`<path d="M-24 -18A30 30 0 0 1 24 -18A34 26 0 0 0 -24 -18Z" fill="#ffffff" opacity="0.07"/>`)
  }

  if (c.orbit) {
    parts.push(`<circle r="${orbit.radius}" fill="none" stroke="${c.orbit}" stroke-width="${orbit.width}" stroke-dasharray="${size === 'full' ? '0.6 1.6' : 'none'}" opacity="0.45"/>`)
    parts.push(`<g class="logo__orbit"><circle cy="${-orbit.radius}" r="${orbit.dot * 1.9}" fill="${c.satellite}" opacity="0.25"/><circle cy="${-orbit.radius}" r="${orbit.dot}" fill="${c.satellite}"/></g>`)
  }

  const flower = []
  layers.forEach(({ id: row, lit, shade, angles, from, to }, l) => {
    defs.push(linear(id(`${row}-lit`), c[row].lit, from, to), linear(id(`${row}-shade`), c[row].shade, from, to))
    const petals = angles.map((a, i) =>
      `<g transform="rotate(${a})"><g class="logo__petal" style="--i:${i};--l:${l}"><path d="${lit}" fill="url(#${id(`${row}-lit`)})"/><path d="${shade}" fill="url(#${id(`${row}-shade`)})"/><path d="${lit}${shade}" fill="none" stroke="${c.gap}" stroke-width="${gap}" stroke-linejoin="round"/></g></g>`).join('')
    flower.push(`<g class="logo__layer logo__layer--${row}">${petals}</g>`)
  })

  defs.push(`<radialGradient id="${id('heart')}" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="${c.heart[0]}"/><stop offset="0.5" stop-color="${c.heart[1]}"/><stop offset="1" stop-color="${c.heart[2]}"/></radialGradient>`)
  const rays = heart.rays
    ? `<g stroke="${c.ray}" stroke-width="0.6" stroke-linecap="round">${around(heart.rays).map((a) => `<line y1="${-heart.ray[0]}" y2="${-heart.ray[1]}" transform="rotate(${a})"/>`).join('')}</g>`
    : ''
  flower.push(`<g class="logo__heart">${rays}<circle r="${heart.radius}" fill="url(#${id('heart')})" stroke="${c.gap}" stroke-width="${gap}"/><circle cx="${n(-heart.radius * 0.3)}" cy="${n(-heart.radius * 0.32)}" r="${n(heart.radius * 0.26)}" fill="#ffffff" opacity="0.6"/></g>`)
  parts.push(`<g class="logo__turn">${flower.join('')}</g>`)

  return `<defs>${defs.join('')}</defs>${parts.join('')}`
}
