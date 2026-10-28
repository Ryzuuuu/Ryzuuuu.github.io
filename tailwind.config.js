/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07070c',
        panel: '#0e0e17',
        line: 'rgba(255,255,255,0.08)',
        fg: '#ecebf4',
        muted: '#a3a0b8',
        dim: '#6c6982',
        neon: {
          green: '#3dffa2',
          blue: '#8183ff',
          pink: '#ff5fb1',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      screens: {
        xs: '450px',
      },
    },
  },
  plugins: [],
}
