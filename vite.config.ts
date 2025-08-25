import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, resolve(__dirname), '')
  
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['lucide-react'],
    },
    define: {
      // Make sure process.env is available for legacy code
      'process.env': {},
    },
    server: {
      port: 5173,
    },
    build: {
      // Production build optimizations
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // Disable sourcemaps in production for smaller bundle
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'framer-motion'],
            three: ['three', '@react-three/fiber', '@react-three/drei']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    // Environment variables prefix
    envPrefix: 'VITE_',
  }
});
