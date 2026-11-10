// Colours resolve to the tone roles in src/index.css, so a chapter's light/dark switch restyles
// everything at once.
const token = (name) => `color-mix(in oklch, var(--${name}) calc(<alpha-value> * 100%), transparent)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: token('surface'),
        sunk: token('surface-2'),
        ink: token('fg'),
        muted: token('fg-muted'),
        line: token('rule'),
        accent: token('accent'),
        spark: token('spark'),
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
