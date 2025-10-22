import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000',
  //       changeOrigin: true,
  //     },
  //   },
  // },
  theme: {
    extend: {
      colors: {
        'o-level': '#3B82F6', // Blue
        'acc': '#10B981', // Green
        'sod': '#8B5CF6', // Purple
      },
    },
  },
})
