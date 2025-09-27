import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// Aggressive performance configuration for production
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Aggressive chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          'utils': ['clsx', 'date-fns', 'zod'],
          'icons': ['lucide-react', 'react-icons'],
        },
        // Smaller chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    
    // Enable source maps for debugging
    sourcemap: false,
    
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
    
    // Asset optimization
    assetsInlineLimit: 4096,
    
    // Target modern browsers only
    target: 'es2020',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Server configuration for better performance testing
  server: {
    port: 5000,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  
  // Production optimizations
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    target: 'es2020',
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});