// The mark: a lotus seen from above (Neelabja means blue lotus), set in an aubergine disc. Two rows of long, slender petals, offset by half a petal as on the real
// flower, each a single flat colour with its tip curling gently aside, round a small jade heart.
//
// This file is the single source of the drawing. drawMark() returns the SVG's inner markup; the
// React component (Logo.jsx) and the exported files (scripts/build-brand.mjs) both use it, so
// they can't drift apart. It's drawn on a 64-unit square centred on the origin, so every part
// turns about the middle. The class names are what index.css animates on the site.

export const VIEW_BOX = '-32 -32 64 64'

const n = (v) => Number(v.toFixed(2))

// One petal pointing up, from `inner` to `outer` units out: slender, widest a little below the
// middle, and drawn out to a fine point whose tip curls gently to one side, so that together the
// petals read as a soft swirl. `curl` is how far the tip leans, in units.
const petal = (inner, outer, width, curl) => {
  const y = (t) => n(-(inner + (outer - inner) * t))
  const x = (v, t) => n(v * width + curl * t * t)
  return `M0 ${y(0)}C${x(0.7, 0.06)} ${y(0.06)} ${x(1, 0.32)} ${y(0.32)} ${x(0.86, 0.55)} ${y(0.55)}C${x(0.66, 0.78)} ${y(0.78)} ${x(0.3, 0.93)} ${y(0.93)} ${x(0, 1)} ${y(1)}C${x(-0.22, 0.93)} ${y(0.93)} ${x(-0.6, 0.78)} ${y(0.78)} ${x(-0.84, 0.55)} ${y(0.55)}C${x(-1, 0.32)} ${y(0.32)} ${x(-0.7, 0.06)} ${y(0.06)} 0 ${y(0)}Z`
}

const around = (count, offset = 0) => Array.from({ length: count }, (_, i) => n(offset + (i * 360) / count))

const row = (id, inner, outer, width, curl, count, offset) => ({ id, d: petal(inner, outer, width, curl), angles: around(count, offset) })

// One drawing at every size: few, bold parts hold up from the favicon to a poster.
const SIZES = {
  full: {
    layers: [row('back', 4.5, 29.6, 7.6, 3.2, 8, 0), row('middle', 3.5, 21.5, 6.2, 2.4, 8, 22.5)],
    heart: { radius: 5 },
    gap: 0.8,
  },
}
SIZES.compact = SIZES.full

// One flat colour per row: deep lotus pink behind, a paler pink in front, round a jade heart.
export const COLORWAYS = {
  jewel: {
    disc: ['#4a1238', '#16060f'],
    back: '#ec3f8c',
    middle: '#ffc4d8',
    heart: '#7eebc4',
    gap: '#1d0817',
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
      `<g transform="rotate(${a})"><g class="logo__sway" style="--i:${i};--l:${l}"><path class="logo__petal" d="${d}" fill="${c[row]}" stroke="${c.gap}" stroke-width="${gap}" stroke-linejoin="round"/></g></g>`).join('')
    flower.push(`<g class="logo__layer logo__layer--${row}">${petals}</g>`)
  })

  flower.push(`<circle class="logo__heart" r="${heart.radius}" fill="${c.heart}" stroke="${c.gap}" stroke-width="${gap}"/>`)
  parts.push(`<g class="logo__turn">${flower.join('')}</g>`)

  return `<defs>${defs.join('')}</defs>${parts.join('')}`
}
