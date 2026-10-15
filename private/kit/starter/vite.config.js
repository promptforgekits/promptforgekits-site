import { defineConfig } from 'vite';

// base: './' makes the build work on itch.io, GitHub Pages subpaths and Netlify.
export default defineConfig({
  base: './',
  server: { port: 5173, open: true },
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 }
});
