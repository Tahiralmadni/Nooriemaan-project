import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Code splitting — alag alag chunks banao
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase alag chunk mein
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          // React + Router alag
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI libraries alag
          ui: ['framer-motion', 'lucide-react'],
        }
      }
    },
    // Smaller chunks
    chunkSizeWarningLimit: 500,
    // esbuild minification (already included with Vite)
    minify: 'esbuild',
  }
})
