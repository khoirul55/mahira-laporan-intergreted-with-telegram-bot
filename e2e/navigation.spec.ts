import { test, expect } from '@playwright/test';

/**
 * Smoke Test — Navigasi & Routing
 * Memastikan halaman-halaman utama bisa diakses
 */
test.describe('Navigasi Dasar', () => {

  test('redirect ke login jika belum terautentikasi', async ({ page }) => {
    // Coba akses halaman staff tanpa login
    await page.goto('/beranda');
    
    // Harus redirect ke login
    await expect(page).toHaveURL(/login/);
  });

  test('redirect ke login jika akses dashboard direksi tanpa auth', async ({ page }) => {
    // Coba akses halaman direksi tanpa login
    await page.goto('/dashboard');

    // Harus redirect ke login
    await expect(page).toHaveURL(/login/);
  });

  test('halaman 404 tidak crash', async ({ page }) => {
    const response = await page.goto('/halaman-tidak-ada');

    // Pastikan tidak error 500
    expect(response?.status()).not.toBe(500);
  });

});
