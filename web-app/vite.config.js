import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          syntax: ['react-markdown', 'highlight.js', 'prism'],
          utils: ['uuid', 'localforage', 'jszip', 'file-saver'],
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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    exclude: [...configDefaults.exclude],
    coverage: {
      reporter: ['text', 'lcov'],
    },
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
