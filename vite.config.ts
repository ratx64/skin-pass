import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // zxcvbn is intentionally lazy-loaded and large by design.
    // Keep warnings for unexpectedly large chunks, but avoid noise for this known case.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('zxcvbn')) {
            return 'zxcvbn';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('@headlessui') || id.includes('@heroicons')) {
            return 'ui-kit';
          }

          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('scheduler')
          ) {
            return 'react-vendor';
          }

          return undefined;
        },
      },
    },
  },
})
