// Reads the brand palette from the CSS variables in index.css and converts it for places
// that can't take oklch() directly: three.js materials (linear RGB) and 2D canvas (hex).

const toLinear = ([L, C, h]) => {
  const r = (h * Math.PI) / 180
  const a = C * Math.cos(r)
  const b = C * Math.sin(r)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (v) => Math.min(1, Math.max(0, v))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

const encode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

const cache = new Map()

// Linear-light RGB triple (0–1) for a palette variable, e.g. linear('primary').
export const linear = (name) => {
  if (!cache.has(name)) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`)
    // Accepts both `oklch(0.4 0.1 177)` and the minifier's `oklch(40% .1 177)`.
    const m = raw.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+([\d.]+)/)
    const lch = m && [m[2] ? m[1] / 100 : +m[1], m[4] ? (m[3] / 100) * 0.4 : +m[3], +m[5]]
    cache.set(name, lch ? toLinear(lch) : [1, 0, 1])
  }
  return cache.get(name)
}

// sRGB colour string for a palette variable, optionally with alpha, for canvas drawing.
export const rgb = (name, alpha) => {
  const s = linear(name).map((v) => Math.round(encode(v) * 255))
  return alpha === undefined ? `rgb(${s.join(',')})` : `rgba(${s.join(',')},${alpha})`
}
