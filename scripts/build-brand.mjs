// Writes the logo files in public/brand, and the favicon, from the drawing in src/brand/mark.js.
// Run it with `pnpm brand` after changing that file.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { COLORWAYS, drawMark, VIEW_BOX } from '../src/brand/mark.js'

const out = new URL('../public/brand/', import.meta.url)
mkdirSync(out, { recursive: true })
for (const file of readdirSync(out)) if (file.startsWith('logo-')) rmSync(new URL(file, out))

const svg = (body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`

const TITLE = 'Neelabja Mukhopadhyay'
for (const size of ['full', 'compact']) {
  for (const [name, colors] of Object.entries(COLORWAYS)) {
    writeFileSync(new URL(`logo-${size}-${name}.svg`, out), svg(drawMark(size, colors, `${size}-${name}`), TITLE))
  }
}

// The favicon is the compact jewel: its own disc holds up on light and dark tabs alike.
writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg(drawMark('compact', COLORWAYS.jewel, 'fav'), TITLE))
