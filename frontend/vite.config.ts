import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Base path for GitHub Pages deployment
  base: '/cursor-ai/',
  server: {
    port: 5174,
  },
  preview: {
    port: 4173,
  },
})
