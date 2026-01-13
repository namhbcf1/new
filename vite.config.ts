import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core & router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy UI libraries
          'vendor-ui': ['sweetalert2', 'html2canvas'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
