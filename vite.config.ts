import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({

  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  plugins: [react(), tailwindcss()],
})
