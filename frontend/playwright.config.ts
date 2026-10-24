import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 180000,
  expect: { timeout: 30000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `${process.platform === 'win32' ? '../.venv/Scripts/python' : '../.venv/bin/python'} run_e2e.py`,
      cwd: '../backend',
      url: 'http://127.0.0.1:8017/api/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'bun run preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
})
