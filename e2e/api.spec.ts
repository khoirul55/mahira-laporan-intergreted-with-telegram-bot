import { test, expect } from '@playwright/test';

/**
 * API Route Smoke Tests
 * Memastikan API endpoints merespons dengan benar
 */
test.describe('API Routes', () => {

  test('keep-alive endpoint merespons (200 atau 401 jika butuh auth)', async ({ request }) => {
    const response = await request.get('/api/keep-alive');
    // 200 = sukses, 401 = endpoint ada tapi dilindungi auth middleware
    expect([200, 401]).toContain(response.status());
  });

  test('telegram webhook endpoint merespons (tanpa auth = 401/403)', async ({ request }) => {
    const response = await request.post('/api/telegram/webhook', {
      data: { message: 'test' },
    });

    // Tanpa secret yang valid, seharusnya ditolak
    expect([400, 401, 403, 405]).toContain(response.status());
  });

  test('telegram reminder tanpa secret ditolak', async ({ request }) => {
    const response = await request.get('/api/telegram/reminder');

    // Tanpa query param secret, seharusnya ditolak
    expect([400, 401, 403]).toContain(response.status());
  });

});
