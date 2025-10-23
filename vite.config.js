
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Map frontend /api calls to the local Vercel dev server (default port 3000)
    proxy: {
      '/api': 'http://localhost:3000' 
    }
  }
})
