import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import crypto from 'node:crypto'
import path from 'node:path'

// Polyfill for Node.js < 20.12.0 where crypto.hash is not available
if (typeof crypto.hash !== 'function') {
  (crypto as any).hash = (algorithm: string, data: crypto.BinaryLike) => {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://chef.wenspock.site',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
