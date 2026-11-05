import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazy-loaded 3D chunk (three.js + drei) is large by nature and loads after the page copy,
    // so raise the warning threshold just above it instead of printing a warning on every build.
    chunkSizeWarningLimit: 1100,
  },
})
