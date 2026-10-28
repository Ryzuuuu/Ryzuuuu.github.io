// Colours resolve to the CSS variables in src/index.css, so the palette lives in one place
// and the light/dark tone switch (which swaps those variables) restyles everything at once.
const token = (name) => `color-mix(in oklch, var(--${name}) calc(<alpha-value> * 100%), transparent)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: token('surface'),
        raised: token('surface-2'),
        ink: token('ink'),
        muted: token('ink-muted'),
        line: token('line'),
        accent: token('accent'),
        'on-accent': token('on-accent'),
        pop: token('pop'),
        primary: token('primary'),
        secondary: token('secondary'),
        highlight: token('highlight'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Arial Black"', 'sans-serif'],
        sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Martian Mono"', 'ui-monospace', 'monospace'],
      },
      screens: {
        xs: '450px',
      },
    },
  },
  plugins: [],
}
