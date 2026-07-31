import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'marked', 'highlight.js'],
          utils: ['crypto-js', 'uuid', 'localforage', 'jszip', 'file-saver'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: process.env.PORT || 3000,
    open: true,
    cors: true,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: process.env.PORT || 3000,
    },
  },
  preview: {
    port: process.env.PORT || 4173,
    open: true,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
    },
  },
});
