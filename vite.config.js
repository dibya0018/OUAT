import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Also expose the environment switch and site URLs (no secrets) to the frontend; see src/lib/site.js.
  envPrefix: ['VITE_', 'APP_ENV', 'SITE_URL', 'LOCAL_SITE_URL'],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      // Uploaded product photos are served (or fetched from MEDIA_BASE_URL) by the API server.
      '/uploads': { target: 'http://localhost:3001' },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router') || id.includes('node_modules/react-helmet-async') || id.includes('node_modules/scheduler')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
