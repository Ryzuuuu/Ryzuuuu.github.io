// The mark: a blue lotus seen from above (নীলাব্জ, Neelabja, means blue lotus), its petals set like
// the blades of a camera aperture around a lens.
//
// This file is the single source of the geometry. The React component (Logo.jsx) and the exported
// files in public/brand (scripts/build-brand.mjs) are both drawn from it, so they can't drift apart.
// It's drawn on a 64-unit square centred on the origin, so every part rotates about the middle.

export const VIEW_BOX = '-32 -32 64 64'

const n = (v) => Number(v.toFixed(2))

// One petal, pointing up, from `inner` to `outer` units out from the centre.
const petal = (inner, outer, width) => {
  const y = (t) => n(-(inner + (outer - inner) * t))
  const w = n(width)
  const t = n(width * 0.6)
  return `M0 ${y(0)}C${w} ${y(0.3)} ${t} ${y(0.76)} 0 ${y(1)}C${-t} ${y(0.76)} ${-w} ${y(0.3)} 0 ${y(0)}Z`
}

// Evenly spaced angles around the circle.
const around = (count, offset = 0) => Array.from({ length: count }, (_, i) => n(offset + (i * 360) / count))

// Two optical sizes, as a typeface would have. `full` carries the dial and the third row of petals
// and needs about 48 px; `compact` is redrawn with fewer, bolder parts for nav bars and favicons.
const SIZES = {
  full: {
    dial: { radius: 30.6, ticks: 64, major: 8 },
    layers: [
      { id: 'back', tone: 'back', d: petal(9, 27.5, 7.4), angles: around(8) },
      { id: 'middle', tone: 'middle', d: petal(7.5, 22, 6.4), angles: around(8, 22.5) },
      { id: 'front', tone: 'front', d: petal(6, 15.5, 4.8), angles: around(8) },
    ],
    lens: { body: 7.2, ring: 4.6, ringWidth: 0.9, glint: [-1.9, -1.9, 1.15] },
  },
  compact: {
    dial: null,
    layers: [
      { id: 'back', tone: 'back', d: petal(8, 31, 9.6), angles: around(8) },
      { id: 'middle', tone: 'middle', d: petal(6, 22.5, 7.6), angles: around(8, 22.5) },
    ],
    lens: { body: 8.4, ring: 0, ringWidth: 0, glint: [-2.4, -2.4, 2] },
  },
}

export const markGeometry = (size = 'full') => SIZES[size]

// The fixed colours used by the exported files. On the site, the same roles come from CSS
// variables in index.css, so the logo follows the page between light and dark.
export const COLORWAYS = {
  brand: { back: '#005a9c', middle: '#2f86cf', front: '#8cc4ef', lens: '#03162a', glint: '#ffffff', dial: '#005a9c' },
  reversed: { back: '#3f94dd', middle: '#8cc4ef', front: '#d6ebfb', lens: '#03162a', glint: '#ffffff', dial: '#8cc4ef' },
  mono: { back: 'currentColor', middle: 'currentColor', front: 'currentColor', lens: 'currentColor', glint: 'none', dial: 'currentColor' },
}
