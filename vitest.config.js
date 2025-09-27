import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.mjs'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    env: {
      QA_MODE: '1',
      NODE_ENV: 'test'
    },
    // Include patterns for test file detection
    include: [
      'tests/**/*.{test,spec}.{js,mjs,ts}',
      'tests/unit/**/*.{test,spec}.{js,mjs,ts}',
      '**/*.{test,spec}.{js,mjs,ts}'
    ],
    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'e2e-tests/**',
      'tests/e2e/**'  // E2E tests run via Playwright
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
});