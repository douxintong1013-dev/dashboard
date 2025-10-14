import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': {
        // 后端当前运行在 5003 端口
        target: 'http://localhost:5003',
        changeOrigin: true
      }
    }
  }
})