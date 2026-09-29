import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the portfolio single-page application.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
