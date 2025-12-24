import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * ⚠️ WARNING: This admin panel is integrated into the main portfolio app.
 * DO NOT run this as a standalone server.
 * Access admin panel via: http://localhost:7000/cms/login
 */
export default defineConfig({
  plugins: [react()],
  // Server disabled - Admin panel accessed via /cms routes in main portfolio app
  server: {
    port: 7001,
    strictPort: true,
    // Prevent accidental standalone startup
    open: false
  },
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

