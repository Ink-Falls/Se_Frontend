import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,// Change this to your desired port
  },
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    globals: true, // Enables global functions like describe, it, test
    environment: 'jsdom', // For testing React components
    setupFiles: './tests/setup/setupTests.jsx', // Path to your setup file
  },
})
