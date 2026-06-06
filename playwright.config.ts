import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration untuk Mahira Tour Reporting System
 * 
 * Cara pakai:
 *   npm run test:e2e                    → test ke production (Vercel)
 *   npm run test:e2e -- --headed        → test dengan browser terlihat
 *   npm run test:e2e:ui                 → mode UI interaktif
 *   npm run test:e2e:report             → buka HTML report
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Folder tempat file test berada
  testDir: './e2e',

  // Timeout per test: 60 detik (production bisa lebih lambat dari localhost)
  timeout: 60_000,

  // Retry 1x jika gagal (berguna untuk flaky tests / network issues)
  retries: 1,

  // Reporter: HTML report + console output
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  // Shared settings untuk semua test
  use: {
    // Base URL — Vercel production
    // Bisa di-override dengan env: BASE_URL=http://localhost:3000 npm run test:e2e
    baseURL: process.env.BASE_URL || 'https://mahira-laporan-intergreted-with-tel.vercel.app',

    // Screenshot otomatis saat test gagal
    screenshot: 'only-on-failure',

    // Rekam video saat test gagal
    video: 'retain-on-failure',

    // Trace untuk debugging (buka di trace.playwright.dev)
    trace: 'retain-on-failure',
  },

  // Browser yang ditest
  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile Chrome (responsive test)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});

