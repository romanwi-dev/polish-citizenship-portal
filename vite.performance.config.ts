import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Performance-optimized Vite configuration
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  build: {
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          'utils': ['clsx', 'date-fns', 'zod'],
        }
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: ['@replit/']
  },
  // Server configuration for better development performance
  server: {
    hmr: {
      overlay: false // Disable error overlay for better performance
    },
    watch: {
      // Ignore node_modules and build directories
      ignored: ['**/node_modules/**', '**/dist/**', '**/build/**']
    }
  },
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@utils': path.resolve(__dirname, './client/src/utils'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@pages': path.resolve(__dirname, './client/src/pages'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});