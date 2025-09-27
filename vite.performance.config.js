// Performance optimization configuration for Vite
export const performanceConfig = {
  // Build optimizations
  build: {
    // Enable minification with terser for smaller bundles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple compression passes for better optimization
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'charts': ['recharts'],
          'forms': ['react-hook-form', 'zod'],
        },
        // Use consistent chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: false, // Disable in production for faster builds
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },

  // Server optimizations
  server: {
    // Enable HTTP/2 for better performance
    https: false, // Set to true with proper certificates for HTTP/2
    // Warmup frequently used files
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/pages/home.tsx',
        './src/pages/dashboard.tsx',
      ],
    },
  },

  // Optimization options
  optimizeDeps: {
    // Pre-bundle heavy dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'date-fns',
      'recharts',
      'framer-motion',
    ],
    // Exclude dependencies that shouldn't be pre-bundled
    exclude: ['@replit/vite-plugin-runtime-error-modal'],
    // Force optimization even if cached
    force: false,
  },

  // CSS optimizations
  css: {
    // Enable CSS modules
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS configuration for optimization
    postcss: {
      plugins: [
        // Add autoprefixer for browser compatibility
        require('autoprefixer'),
        // Optimize CSS with cssnano in production
        process.env.NODE_ENV === 'production' && require('cssnano')({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
            colormin: true,
            mergeLonghand: true,
          }],
        }),
      ].filter(Boolean),
    },
  },

  // Enable caching for faster rebuilds
  cacheDir: 'node_modules/.vite',
  
  // Worker optimizations
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/worker-[hash].js',
      },
    },
  },

  // Preview server optimizations
  preview: {
    compression: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
};

// Performance plugins configuration
export const performancePlugins = [
  // Image optimization plugin
  {
    name: 'image-optimizer',
    transform(code, id) {
      if (id.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        // Add lazy loading attributes to images
        return code.replace(/<img/g, '<img loading="lazy" decoding="async"');
      }
      return code;
    },
  },

  // Bundle analyzer plugin (only in analyze mode)
  process.env.ANALYZE && {
    name: 'bundle-analyzer',
    generateBundle(options, bundle) {
      const sizes = {};
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          sizes[fileName] = chunk.code.length;
        }
      }
      console.log('\n📊 Bundle Sizes:');
      Object.entries(sizes)
        .sort(([, a], [, b]) => b - a)
        .forEach(([name, size]) => {
          console.log(`  ${name}: ${(size / 1024).toFixed(2)} KB`);
        });
    },
  },

  // Preload critical chunks
  {
    name: 'preload-critical',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `
        <link rel="preload" href="/assets/index.js" as="script">
        <link rel="preload" href="/assets/index.css" as="style">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="dns-prefetch" href="https://polishcitizenship.typeform.com">
        </head>
        `
      );
    },
  },
].filter(Boolean);

// Export complete performance configuration
export default {
  config: performanceConfig,
  plugins: performancePlugins,
};