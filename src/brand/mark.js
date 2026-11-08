// The mark: a blue lotus seen from above (নীলাব্জ, Neelabja, means blue lotus), set in a
// night-blue disc. Two rows of petals, offset by half a petal as on the real flower, each a single
// flat colour, round a small golden heart.
//
// This file is the single source of the drawing. drawMark() returns the SVG's inner markup; the
// React component (Logo.jsx) and the exported files (scripts/build-brand.mjs) both use it, so
// they can't drift apart. It's drawn on a 64-unit square centred on the origin, so every part
// turns about the middle. The class names are what index.css animates on the site.

export const VIEW_BOX = '-32 -32 64 64'

const n = (v) => Number(v.toFixed(2))

// One petal pointing up, from `inner` to `outer` units out: widest a little below the middle and
// drawn out to a fine point.
const petal = (inner, outer, width) => {
  const y = (t) => n(-(inner + (outer - inner) * t))
  const x = (v) => n(v * width)
  return `M0 ${y(0)}C${x(0.75)} ${y(0.06)} ${x(1)} ${y(0.34)} ${x(0.84)} ${y(0.56)}C${x(0.64)} ${y(0.8)} ${x(0.36)} ${y(0.92)} 0 ${y(1)}C${x(-0.36)} ${y(0.92)} ${x(-0.64)} ${y(0.8)} ${x(-0.84)} ${y(0.56)}C${x(-1)} ${y(0.34)} ${x(-0.75)} ${y(0.06)} 0 ${y(0)}Z`
}

const around = (count, offset = 0) => Array.from({ length: count }, (_, i) => n(offset + (i * 360) / count))

const row = (id, inner, outer, width, count, offset) => ({ id, d: petal(inner, outer, width), angles: around(count, offset) })

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

// One flat colour per row: deep neel behind, a paler blue in front.
export const COLORWAYS = {
  jewel: {
    disc: ['#1a2a6c', '#080c28'],
    back: '#3f5fd8',
    middle: '#a9c6ff',
    heart: '#f4b83a',
    gap: '#0b1240',
  },
  mono: {
    disc: null,
    back: 'currentColor',
    middle: 'currentColor',
    heart: 'currentColor',
    gap: '#ffffff',
  },
}

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
  layers.forEach(({ id: row, d, angles }, l) => {
    const petals = angles.map((a, i) =>
      `<g transform="rotate(${a})"><path class="logo__petal" style="--i:${i};--l:${l}" d="${d}" fill="${c[row]}" stroke="${c.gap}" stroke-width="${gap}" stroke-linejoin="round"/></g>`).join('')
    flower.push(`<g class="logo__layer logo__layer--${row}">${petals}</g>`)
  })

  flower.push(`<circle class="logo__heart" r="${heart.radius}" fill="${c.heart}" stroke="${c.gap}" stroke-width="${gap}"/>`)
  parts.push(`<g class="logo__turn">${flower.join('')}</g>`)

  return `<defs>${defs.join('')}</defs>${parts.join('')}`
}
