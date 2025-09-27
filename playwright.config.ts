import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: false, // Disable parallel execution for Replit environment
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduce retries for faster feedback
  workers: 1, // Single worker for Replit stability
  timeout: 30000, // 30 second timeout per test
  globalTimeout: 300000, // 5 minute global timeout
  reporter: [
    ['html', { outputFolder: 'test-results' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line']
  ],
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off', // Disable video to save resources
    actionTimeout: 10000, // 10 seconds for actions
    navigationTimeout: 15000, // 15 seconds for navigation
    // Force headless mode for server environments
    headless: true,
    // Comprehensive Replit/container compatibility flags
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    }
  },

  projects: [
    // Only test with Chromium in QA mode for speed and reliability
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional options for Replit environment
        viewport: { width: 1280, height: 720 },
      },
    }
    // Disable other browsers in QA mode for faster execution
    // Uncomment for full cross-browser testing:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // Additional wait for server stability
    stderr: 'pipe',
    stdout: 'pipe'
  },
});