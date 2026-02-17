import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      open: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000
  }
})
