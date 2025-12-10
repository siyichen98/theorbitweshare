import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  base: '/theorbitweshare/',   // ← ← ← 关键！必须加！

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './'),
    },
  },
})
