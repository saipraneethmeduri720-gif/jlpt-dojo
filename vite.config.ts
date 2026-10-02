import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jlpt-dojo/',
  plugins: [react()],
})