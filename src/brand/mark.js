// The mark: a blue lotus seen from above (নীলাব্জ, Neelabja, means blue lotus), set in a
// night-blue disc. Two rows of petals, offset by half a petal as on the real flower, each folded
// down its middle so one side is lit and the other in shadow, round a small golden heart.
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

// One drawing at every size: few, bold parts hold up from the favicon to a poster.
const SIZES = {
  full: {
    layers: [row('back', 6.5, 26, 9.2, 8, 0), row('middle', 5, 18.5, 7.4, 8, 22.5)],
    heart: { radius: 5.6 },
    gap: 0.8,
  },
}
SIZES.compact = SIZES.full

export const markGeometry = (size = 'full') => SIZES[size]

// Each row's lit and shaded halves fade from base to tip: pale, almost white at the heart,
// deepening through neel to a violet edge, as the real flower does.
// Each row's lit and shaded halves fade from a pale base to a deep blue tip.
export const COLORWAYS = {
  jewel: {
    disc: ['#1a2a6c', '#080c28'],
    back: { lit: ['#a9cdff', '#4a63e0'], shade: ['#7aa4f2', '#2c2a9e'] },
    middle: { lit: ['#eef6ff', '#8aa6f6'], shade: ['#c2d9ff', '#5068da'] },
    heart: ['#ffe9a3', '#f2b236'],
    gap: '#0b1240',
  },
  mono: {
    disc: null,
    back: { lit: ['currentColor', 'currentColor'], shade: ['currentColor', 'currentColor'] },
    middle: { lit: ['currentColor', 'currentColor'], shade: ['currentColor', 'currentColor'] },
    heart: ['currentColor', 'currentColor'],
    gap: '#ffffff',
  },
}

const linear = (id, [a, b], from, to) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${from}" x2="0" y2="${to}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`

// The SVG's inner markup. `key` makes the gradient ids unique when several marks share a page.
export const drawMark = (size = 'full', c = COLORWAYS.jewel, key = 'mark') => {
  const { layers, heart, gap } = SIZES[size]
  const id = (name) => `${key}-${name}`
  const defs = []
  const parts = []

  if (c.disc) {
    defs.push(`<radialGradient id="${id('disc')}" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${c.disc[0]}"/><stop offset="1" stop-color="${c.disc[1]}"/></radialGradient>`)
    parts.push(`<circle class="logo__disc" r="31.5" fill="url(#${id('disc')})"/>`)
  }

  const flower = []
  layers.forEach(({ id: row, lit, shade, angles, from, to }, l) => {
    defs.push(linear(id(`${row}-lit`), c[row].lit, from, to), linear(id(`${row}-shade`), c[row].shade, from, to))
    const petals = angles.map((a, i) =>
      `<g transform="rotate(${a})"><g class="logo__petal" style="--i:${i};--l:${l}"><path d="${lit}" fill="url(#${id(`${row}-lit`)})"/><path d="${shade}" fill="url(#${id(`${row}-shade`)})"/><path d="${lit}${shade}" fill="none" stroke="${c.gap}" stroke-width="${gap}" stroke-linejoin="round"/></g></g>`).join('')
    flower.push(`<g class="logo__layer logo__layer--${row}">${petals}</g>`)
  })

  defs.push(`<radialGradient id="${id('heart')}" cx="0.4" cy="0.36" r="0.64"><stop offset="0" stop-color="${c.heart[0]}"/><stop offset="1" stop-color="${c.heart[1]}"/></radialGradient>`)
  flower.push(`<circle class="logo__heart" r="${heart.radius}" fill="url(#${id('heart')})" stroke="${c.gap}" stroke-width="${gap}"/>`)
  parts.push(`<g class="logo__turn">${flower.join('')}</g>`)

  return `<defs>${defs.join('')}</defs>${parts.join('')}`
}
