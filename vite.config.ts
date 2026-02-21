import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5177,
    strictPort: true,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
    } : undefined,
  },
  preview: {
    port: 5177,
  },
}))
