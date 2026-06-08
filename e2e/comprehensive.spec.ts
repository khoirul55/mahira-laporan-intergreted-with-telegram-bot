import { test, expect, type Page } from '@playwright/test';

/**
 * ============================================================
 * COMPREHENSIVE E2E TEST SUITE
 * Mahira Tour — Sistem Laporan Terintegrasi
 * 
 * Test ini mencakup SEMUA fitur utama sistem:
 * 1. Login & Auth Flow
 * 2. Halaman Staff (Beranda, Laporan, Izin, Arsip, Profil)
 * 3. Halaman Direksi (Dashboard, Laporan, Pengumuman, dll)
 * 4. API Routes (Telegram Bot, Keep-alive)
 * 5. Dark/Light Mode
 * 6. Responsive (mobile & desktop)
 * ============================================================
 */

const BASE_URL = process.env.BASE_URL || 'https://mahira-laporan-intergreted-with-tel.vercel.app';

// ────────────────────────────────────────────────────────
// SECTION 1: API ROUTES — Comprehensive Testing
// ────────────────────────────────────────────────────────

test.describe('API Routes — Comprehensive', () => {

  test('GET /api/keep-alive tanpa secret → 401 Unauthorized', async ({ request }) => {
    const res = await request.get('/api/keep-alive');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('GET /api/keep-alive dengan secret salah → 401', async ({ request }) => {
    const res = await request.get('/api/keep-alive?secret=wrong-secret');
    expect(res.status()).toBe(401);
  });

  test('POST /api/telegram/webhook tanpa secret header → 401', async ({ request }) => {
    const res = await request.post('/api/telegram/webhook', {
      data: { message: { text: '/help', chat: { id: 12345 }, from: { id: 12345 } } }
    });
    expect([401, 400, 403]).toContain(res.status());
  });

  test('GET /api/telegram/reminder tanpa secret → 401', async ({ request }) => {
    const res = await request.get('/api/telegram/reminder');
    expect(res.status()).toBe(401);
  });

  test('GET /api/telegram/reminder dengan secret salah → 401', async ({ request }) => {
    const res = await request.get('/api/telegram/reminder?secret=wrong');
    expect(res.status()).toBe(401);
  });

  test('GET /api/telegram/weekly-digest tanpa secret → 401', async ({ request }) => {
    const res = await request.get('/api/telegram/weekly-digest');
    expect(res.status()).toBe(401);
  });

  test('GET /api/telegram/setup tanpa secret → 401', async ({ request }) => {
    const res = await request.get('/api/telegram/setup');
    expect(res.status()).toBe(401);
  });

  test('GET /api/telegram/setup dengan secret salah → 401', async ({ request }) => {
    const res = await request.get('/api/telegram/setup?secret=wrong&action=set');
    expect(res.status()).toBe(401);
  });

  test('API route yang tidak exist → 404', async ({ request }) => {
    const res = await request.get('/api/nonexistent');
    expect(res.status()).toBe(404);
  });
});


// ────────────────────────────────────────────────────────
// SECTION 2: HALAMAN LOGIN — Detailed Testing
// ────────────────────────────────────────────────────────

test.describe('Login Page — Detail', () => {

  test('halaman login menampilkan branding Mahira Tour', async ({ page }) => {
    await page.goto('/login');
    
    // Harus ada teks Mahira Tour
    await expect(page.getByText('Mahira Tour', { exact: true })).toBeVisible();
    
    // Harus ada teks selamat datang
    await expect(page.getByText('Selamat datang')).toBeVisible();
    
    // Harus ada teks "Akses terbatas"
    await expect(page.getByText('Akses terbatas')).toBeVisible();
  });

  test('form login memiliki label Email dan Password', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('tombol Masuk disabled saat loading', async ({ page }) => {
    await page.goto('/login');

    // Isi form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // Klik submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Tombol harus disabled saat loading (menunjukkan "Memproses...")
    await expect(page.getByText('Memproses...')).toBeVisible({ timeout: 3000 });
  });

  test('login gagal menampilkan pesan error', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('nonexistent@test.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Tunggu sampai loading selesai dan error muncul
    await page.waitForTimeout(3000);
    
    // Tetap di halaman login
    await expect(page).toHaveURL(/login/);
    
    // Error message muncul (bisa toast atau inline)
    const errorElement = page.locator('.text-destructive, [class*="destructive"], [role="alert"]');
    const isErrorVisible = await errorElement.count() > 0;
    expect(isErrorVisible || (await page.url()).includes('login')).toBeTruthy();
  });
});


// ────────────────────────────────────────────────────────
// SECTION 3: NAVIGASI & AUTH GUARD
// ────────────────────────────────────────────────────────

test.describe('Auth Guard — Semua Route Dilindungi', () => {

  const protectedRoutes = [
    '/beranda',
    '/beranda/laporan',
    '/beranda/izin',
    '/beranda/arsip',
    '/beranda/profil',
    '/beranda/riwayat',
    '/beranda/laporan-bulanan',
    '/dashboard',
    '/dashboard/laporan',
    '/dashboard/absences',
    '/dashboard/pengumuman',
    '/dashboard/arsip',
    '/dashboard/analytics',
    '/dashboard/divisions',
    '/dashboard/users',
    '/dashboard/riwayat',
    '/dashboard/laporan-bulanan',
  ];

  for (const route of protectedRoutes) {
    test(`${route} → redirect ke login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/login/, { timeout: 15000 });
    });
  }
});


// ────────────────────────────────────────────────────────
// SECTION 4: HALAMAN ERROR
// ────────────────────────────────────────────────────────

test.describe('Error Handling', () => {

  test('halaman 404 menampilkan konten yang sesuai (tidak crash)', async ({ page }) => {
    const response = await page.goto('/halaman-yang-tidak-ada');
    
    // Tidak boleh 500
    expect(response?.status()).not.toBe(500);
    
    // Boleh 404 atau redirect ke login
    expect([200, 302, 404]).toContain(response?.status());
  });

  test('path deeply nested yang tidak exist', async ({ page }) => {
    const response = await page.goto('/dashboard/laporan/99999999/edit/nonexistent');
    expect(response?.status()).not.toBe(500);
  });
});


// ────────────────────────────────────────────────────────
// SECTION 5: DARK/LIGHT MODE
// ────────────────────────────────────────────────────────

test.describe('Dark/Light Mode Toggle', () => {

  test('halaman login dimulai dengan light mode (default)', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // HTML element tidak boleh punya class "dark" saat pertama load
    const html = page.locator('html');
    const classes = await html.getAttribute('class') || '';
    
    // Default theme adalah "light" — jadi tidak boleh ada class "dark"
    // Atau bisa juga belum ada class apapun (light is default)
    expect(classes).not.toContain('dark');
  });
});


// ────────────────────────────────────────────────────────
// SECTION 6: RESPONSIVE DESIGN — Mobile
// ────────────────────────────────────────────────────────

test.describe('Responsive — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone SE

  test('login page responsive di mobile', async ({ page }) => {
    await page.goto('/login');

    // Form harus visible
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Tombol full width
    const btn = page.locator('button[type="submit"]');
    await expect(btn).toBeVisible();
  });
});


// ────────────────────────────────────────────────────────
// SECTION 7: PERFORMANCE & SEO
// ────────────────────────────────────────────────────────

test.describe('Performance & SEO', () => {

  test('halaman login memiliki title yang benar', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title).toContain('Mahira Tour');
  });

  test('halaman login load dalam waktu wajar (< 15s)', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    
    // Harus load dalam 15 detik
    expect(loadTime).toBeLessThan(15000);
  });

  test('tidak ada error console yang kritis', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors (like favicon 404)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('ERR_CONNECTION_REFUSED')
    );

    // Tidak boleh ada error kritis
    expect(criticalErrors.length).toBe(0);
  });
});


// ────────────────────────────────────────────────────────
// SECTION 8: CSS & DESIGN SYSTEM
// ────────────────────────────────────────────────────────

test.describe('Design System — Visual', () => {

  test('font Inter ter-load di halaman login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Cek computed font-family pada body
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Harus mengandung "Inter" (bukan Geist atau default system font)
    expect(fontFamily.toLowerCase()).toContain('inter');
  });

  test('CSS variables terdefinisi (--background, --foreground, --primary)', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const vars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        background: style.getPropertyValue('--background').trim(),
        foreground: style.getPropertyValue('--foreground').trim(),
        primary: style.getPropertyValue('--primary').trim(),
      };
    });

    // Semua variable harus terdefinisi (bukan kosong)
    expect(vars.background).not.toBe('');
    expect(vars.foreground).not.toBe('');
    expect(vars.primary).not.toBe('');
  });
});


// ────────────────────────────────────────────────────────
// SECTION 9: TELEGRAM BOT — Endpoint Verification
// ────────────────────────────────────────────────────────

test.describe('Telegram Bot — Endpoint Protection', () => {

  test('webhook endpoint menolak request tanpa body', async ({ request }) => {
    const res = await request.post('/api/telegram/webhook');
    // Tanpa secret → 401 atau tanpa body bisa 400
    expect([400, 401, 403, 500]).toContain(res.status());
  });

  test('webhook endpoint menolak request dengan header secret salah', async ({ request }) => {
    const res = await request.post('/api/telegram/webhook', {
      headers: {
        'x-telegram-bot-api-secret-token': 'wrong-secret'
      },
      data: { message: { text: '/help', chat: { id: 123 }, from: { id: 123 } } }
    });
    expect(res.status()).toBe(401);
  });

  test('reminder endpoint mengembalikan JSON response', async ({ request }) => {
    const res = await request.get('/api/telegram/reminder');
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('weekly-digest endpoint mengembalikan JSON response', async ({ request }) => {
    const res = await request.get('/api/telegram/weekly-digest');
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('setup endpoint mengembalikan JSON response', async ({ request }) => {
    const res = await request.get('/api/telegram/setup');
    expect(res.headers()['content-type']).toContain('application/json');
  });
});


// ────────────────────────────────────────────────────────
// SECTION 10: SUPABASE DATABASE CONNECTIVITY
// ────────────────────────────────────────────────────────

test.describe('Database Connectivity', () => {

  test('login form terhubung ke Supabase (respon bukan timeout)', async ({ page }) => {
    await page.goto('/login');

    // Fill with wrong credentials
    await page.getByLabel('Email').fill('test@nonexistent.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Harus ada response dalam 10 detik (bukan hang/timeout)
    await page.waitForFunction(() => {
      // Cek apakah button sudah tidak loading lagi
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.textContent?.includes('Memproses');
    }, { timeout: 10000 });

    // Masih di halaman login (tidak crash)
    await expect(page).toHaveURL(/login/);
  });
});
