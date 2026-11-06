// Writes the logo files in public/brand, and the favicon, from the geometry in src/brand/mark.js.
// Run it with `pnpm brand` after changing that file.
import { mkdirSync, writeFileSync } from 'node:fs'
import { COLORWAYS, markGeometry, VIEW_BOX } from '../src/brand/mark.js'

const out = new URL('../public/brand/', import.meta.url)
mkdirSync(out, { recursive: true })

const drawMark = (size, c) => {
  const { dial, layers, lens } = markGeometry(size)
  const parts = []
  if (dial) {
    const ticks = Array.from({ length: dial.ticks }, (_, i) => {
      const major = i % dial.major === 0
      const y1 = -dial.radius + 0.9
      const y2 = -dial.radius + (major ? 3.1 : 1.9)
      return `<line y1="${y1.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width="${major ? 0.8 : 0.4}" transform="rotate(${(i * 360) / dial.ticks})"/>`
    })
    parts.push(`<g id="dial" fill="none" stroke="${c.dial}"><circle r="${dial.radius}" stroke-width="0.5"/>${ticks.join('')}</g>`)
  }
  for (const { id, tone, d, angles } of layers) {
    parts.push(`<g id="petals-${id}" fill="${c[tone]}">${angles.map((a) => `<path d="${d}" transform="rotate(${a})"/>`).join('')}</g>`)
  }
  const ring = lens.ring > 0 && c.glint !== 'none'
    ? `<circle r="${lens.ring}" fill="none" stroke="${c.glint}" stroke-width="${lens.ringWidth}" opacity="0.55"/>`
    : ''
  const glint = c.glint === 'none' ? '' : `<circle cx="${lens.glint[0]}" cy="${lens.glint[1]}" r="${lens.glint[2]}" fill="${c.glint}"/>`
  parts.push(`<g id="lens"><circle r="${lens.body}" fill="${c.lens}"/>${ring}${glint}</g>`)
  return parts.join('')
}

const svg = (body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`

const TITLE = 'Neelabja Mukhopadhyay'
for (const size of ['full', 'compact']) {
  for (const [name, colors] of Object.entries(COLORWAYS)) {
    writeFileSync(new URL(`logo-${size}-${name}.svg`, out), svg(drawMark(size, colors), TITLE))
  }
}

// The favicon: the compact mark on a tile, so it holds up on both light and dark browser tabs.
const tile = `<rect x="-32" y="-32" width="64" height="64" rx="14" fill="#031a31"/><g transform="scale(0.86)">${drawMark('compact', COLORWAYS.reversed)}</g>`
writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg(tile, TITLE))
