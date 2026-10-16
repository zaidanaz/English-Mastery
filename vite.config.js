import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_PAGES === 'true' || mode === 'github' ? '/English-Mastery/' : '/',
  plugins: [react()],
  json: {
    stringify: true, // Optimize large JSON files
  },
}))
