import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'production' ? '/taan-basketball-admin/' : '/',
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
}))
