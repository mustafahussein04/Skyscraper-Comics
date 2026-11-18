import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/system',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
  webServer: [
    {
      command: 'node tests/system/start-backend.cjs',
      url: 'http://127.0.0.1:3101/api/products',
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      env: { VITE_API_URL: 'http://127.0.0.1:3101' },
      reuseExistingServer: false,
    },
  ],
})
