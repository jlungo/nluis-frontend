import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // or '0.0.0.0'
    port: 3000, // or any other port
    proxy: {
      '/api': {
        target: 'http://144.91.125.106:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase warning limit (in KB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('mapbox-gl') || id.includes('react-map-gl')) {
            return 'vendor-mapbox-gl';
          }
          if (id.includes('@turf')) return 'vendor-turf';
          if (id.includes('@tanstack')) return 'vendor-tanstack';
          if (id.includes('@dnd-kit')) return 'vendor-dndkit';
          if (id.includes('framer-motion')) return 'vendor-framer-motion';
          if (id.match(/node_modules[\\/]react($|[\\/])/)) return 'vendor-react';
          if (id.includes('mapbox-gl-draw')) return 'vendor-mapbox-gl-draw';

          return 'vendor';
        }
      }
    }
  }
});
