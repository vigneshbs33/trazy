import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ['node_modules/**', 'dist/**', 'src/tests/e2e/**']
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
