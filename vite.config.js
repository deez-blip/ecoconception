import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import purgeCss from 'vite-plugin-purgecss';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'production'
      ? purgeCss({
          safelist: [
            /^is-/,
            /^button-/,
            /^navigation-/,
            /^product-/,
            /^basket-/,
            /^react-phone-input/,
            /^css-/
          ]
        })
      : null,
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/firebase/')) {
            return 'vendor-firebase';
          }

          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router-dom/') ||
            id.includes('/node_modules/redux/') ||
            id.includes('/node_modules/redux-saga/') ||
            id.includes('/node_modules/redux-persist/')
          ) {
            return 'vendor-react-core';
          }

          return undefined;
        }
      }
    }
  },
  server: {
    port: 3000
  }
}));
