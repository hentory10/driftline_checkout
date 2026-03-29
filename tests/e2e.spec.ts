import { test, expect } from '@playwright/test';

test('happy path: full surf camp booking flow', async ({ page }) => {
  await page.goto('/');

  // Landing
  await expect(page.getByRole('heading', { name: /ride perfect waves/i })).toBeVisible();
  await page.getByRole('link', { name: /start booking/i }).click();

  // Step 1: Package
  await expect(page.getByRole('heading', { name: /choose your surf package/i })).toBeVisible();
  await page.getByLabel(/surf level/i).selectOption('beginner');
  await page.getByRole('button', { name: /beginner bliss/i }).click();
  await page.getByRole('button', { name: /next/i }).click();

  // Step 2: Dates
  await expect(page.getByRole('heading', { name: /pick your arrival date/i })).toBeVisible();
  await page.getByLabel(/arrival date/i).selectOption({ index: 1 });
  await page.getByRole('button', { name: /next/i }).click();

  // Step 3: Room
  await expect(page.getByRole('heading', { name: /select your room/i })).toBeVisible();
  await page.getByRole('button', { name: /shared dorm/i }).click();
  await page.getByRole('button', { name: /next/i }).click();

  // Step 4: Travellers
  await expect(page.getByRole('heading', { name: /traveller details/i })).toBeVisible();
  await page.getByLabel(/number of travellers/i).fill('1');
  await page.getByLabel(/traveller 1 name/i).fill('Alice');
  await page.getByRole('button', { name: /next/i }).click();

  // Step 5: Extras
  await expect(page.getByRole('heading', { name: /add extras/i })).toBeVisible();
  await page.getByLabel(/yoga classes/i).check();
  await page.getByLabel(/add travel insurance/i).check();
  await page.getByRole('button', { name: /next/i }).click();

  // Step 6: Payment
  await expect(page.getByRole('heading', { name: /payment/i })).toBeVisible();
  await page.getByLabel(/pay-in-full/i).check();
  // Stripe Elements: skip actual card entry in test
  // await page.getByLabel(/card/i).fill('4242 4242 4242 4242');
  // await page.getByRole('button', { name: /pay now/i }).click();

  // Confirmation (simulate)
  // await expect(page.getByRole('heading', { name: /thank you for booking/i })).toBeVisible();
}); 