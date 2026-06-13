import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3344,
    proxy: {
      '/api': {
        target: 'http://localhost:3444',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3444',
        changeOrigin: true
      }
    }
  }
})
