import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    proxy: {
      // Proxy all requests to backend
      '/orders': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/warehouses': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/drivers': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/vehicles': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/optimize': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/simulate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/alerts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
