/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0e0c0a',
        umber: '#16130f',
        walnut: '#1f1a15',
        ivory: '#f1eadc',
        parchment: '#cbc0ab',
        stone: '#8f8473',
        hairline: 'rgb(201 164 92 / 0.2)',
        gold: {
          DEFAULT: '#c9a45c',
          light: '#e3c78e',
          deep: '#8f7238',
        },
        claret: {
          DEFAULT: '#7d2633',
          light: '#c45a69',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '450px',
      },
    },
  },
  plugins: [],
}
