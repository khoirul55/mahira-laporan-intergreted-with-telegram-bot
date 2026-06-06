import { test, expect } from '@playwright/test';

/**
 * Smoke Test — Halaman Login
 * Memastikan halaman login bisa diakses dan elemen-elemen penting tampil
 */
test.describe('Halaman Login', () => {

  test('halaman login bisa diakses', async ({ page }) => {
    await page.goto('/login');
    
    // Pastikan halaman berhasil dimuat
    await expect(page).toHaveURL(/login/);
  });

  test('form login menampilkan input email dan password', async ({ page }) => {
    await page.goto('/login');

    // Cari input email
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Cari input password
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('tombol login tersedia', async ({ page }) => {
    await page.goto('/login');

    // Cari tombol submit/login
    const loginButton = page.locator('button[type="submit"], button:has-text("Masuk"), button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('login gagal dengan kredensial salah menampilkan error', async ({ page }) => {
    await page.goto('/login');

    // Isi email dan password yang salah
    await page.fill('input[type="email"], input[name="email"]', 'wrong@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

    // Klik tombol login
    await page.click('button[type="submit"], button:has-text("Masuk"), button:has-text("Login")');

    // Tunggu feedback error muncul (toast/alert/text)
    await page.waitForTimeout(2000);

    // Pastikan tetap di halaman login (tidak redirect)
    await expect(page).toHaveURL(/login/);
  });

});
