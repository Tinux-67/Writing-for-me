import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
  ],
  build: {
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        // manualChunks as function — required by Vite 8 / rolldown
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (['react', 'react-dom', 'react-router-dom'].some(p => id.includes(p))) return 'vendor';
            if (['react-markdown', 'react-syntax-highlighter', 'highlight.js'].some(p => id.includes(p))) return 'syntax';
            if (['uuid', 'localforage', 'jszip', 'file-saver'].some(p => id.includes(p))) return 'utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: process.env.PORT || 3030,  // 3000 is taken by open-webui Docker container
    open: false,   // Don't auto-open — browser fires before dep optimization finishes → 500
    cors: true,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: process.env.PORT || 3030,
    },
    // Pre-warm entry modules so the first request never hits a cold 500
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/context/NotesContext.jsx',
        './src/utils/storage.js',
        './src/utils/security.js',
      ],
    },
  },
  // Force pre-bundle of all CJS/heavy deps before first request arrives.
  // This eliminates the 500 on cold start (Vite pre-bundling race condition).
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-markdown',
      'react-syntax-highlighter',
      'localforage',
      'dompurify',
      'marked',
      'uuid',
      'file-saver',
    ],
  },
  preview: {
    port: process.env.PORT || 4174,
    open: false,
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
