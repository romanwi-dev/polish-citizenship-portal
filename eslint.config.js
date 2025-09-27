import js from '@eslint/js';

export default [
  // Base JavaScript configuration
  js.configs.recommended,
  
  // Global settings for all JavaScript files
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        React: 'readonly',
        JSX: 'readonly'
      }
    },
    rules: {
      // Error Prevention
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Code Quality
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error'
    }
  },

  // React/JSX files configuration (client side)
  {
    files: ['client/src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn'
    }
  },

  // Server-side Node.js files
  {
    files: ['server/**/*.{js,ts}', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-console': 'off' // Allow console in server code
    }
  },

  // Test files
  {
    files: [
      'tests/**/*.{js,ts,mjs}',
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts,mjs}'
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off' // Test files often have unused mock vars
    }
  },

  // Configuration files
  {
    files: [
      '*.config.{js,ts}',
      '*.config.*.{js,ts}',
      'vite.config.ts',
      'playwright.config.ts',
      'vitest.config.js',
      'drizzle.config.ts',
      'eslint.config.js'
    ],
    rules: {
      'no-console': 'off'
    }
  },

  // Ignore patterns
  {
    ignores: [
      // Build outputs
      'dist/',
      'build/',
      '.next/',
      'out/',
      
      // Dependencies
      'node_modules/',
      
      // Generated files
      'generated_pdfs/',
      'uploaded_documents/',
      'test-results/',
      'playwright-report/',
      'temp_pdfs/',
      
      // Data directories
      'data/',
      'files/',
      'migrations/',
      'portal/',
      'public/',
      
      // Legacy/external
      'frontend/',
      'backend/',
      'e2e-tests/',
      
      // Temporary files
      '*.log',
      '.tmp/',
      '.cache/',
      
      // Environment files
      '.env*'
    ]
  }
];