// @ts-check
const { defineConfig, devices } = require('@playwright/test')

const testUrl = 'http://127.0.0.1:3000'

module.exports = defineConfig({
  testDir: './test/features',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'html',
  use: {
    baseURL: testUrl,
    trace: 'on-first-retry',
    contextOptions: { acceptDownloads: true }
  },

  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            launchOptions: { args: ['--disable-dev-shm-usage'] }
          }
        }
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] }
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] }
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] }
        }
      ],

  webServer: {
    command: 'npm run dev',
    url: testUrl,
    reuseExistingServer: !process.env.CI
  }
})
