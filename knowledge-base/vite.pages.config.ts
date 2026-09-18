import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist/pages',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/index.html'),
        about: resolve(__dirname, 'pages/about/index.html'),
        dashboard: resolve(__dirname, 'pages/dashboard/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: '/pages/'
  }
});
