import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Il sito vive sotto https://<utente>.github.io/Tuscia/ ; in sviluppo sotto la radice.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Tuscia/' : '/',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
}))
