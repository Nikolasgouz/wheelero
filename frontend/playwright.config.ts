import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 180000,
  expect: { timeout: 30000 },
  fullyParallel: true,
  workers: 8,
  projects: [
    { name: 'browser', grepInvert: /@exclusive/ },
    {
      name: 'service-worker-update',
      grep: /@exclusive/,
      dependencies: ['browser'],
      fullyParallel: false,
      workers: 1,
    },
  ],
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:4173',
          localStorage: [{ name: 'wheelero-analytics-consent-v1', value: 'rejected' }],
        },
      ],
    },
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'bun run preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
})
