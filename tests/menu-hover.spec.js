import { test, expect } from '@playwright/test';

test('menu hover rolls numbers, reveals the Figma arrow, and resets on exit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const links = page.locator('.menu-navigation a');
  for (const link of await links.all()) {
    await link.hover();
    await expect(link.locator('.menu-link-arrow')).toHaveCSS('opacity', '1');
    await expect(link.locator('.menu-number-track')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -24)');
    await expect(link.locator('.menu-link-label')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 28, 0)');
  }
  await page.getByRole('button', { name: 'Close navigation' }).hover();
  await expect(links.last().locator('.menu-link-arrow')).toHaveCSS('opacity', '0');
  await expect(links.last().locator('.menu-number-track')).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: 'Close navigation' }).focus();
  await page.keyboard.press('Tab');
  await expect(links.first().locator('.menu-link-arrow')).toHaveCSS('opacity', '1');
  await expect(links.first().locator('.menu-link-arrow')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const geometry = await links.first().locator('.menu-link-arrow').boundingBox();
  expect(geometry.width).toBeCloseTo(18, 1);
  expect(geometry.height).toBeCloseTo(14.7279, 1);
  await page.screenshot({ path: 'test-results/menu-hover.png' });
});

test('every social tooltip appears on hover and keyboard focus, including with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  for (const icon of await page.locator('.menu-social').all()) {
    const tooltip = icon.locator('.menu-social-tooltip');
    await icon.hover();
    await expect(tooltip).toHaveCSS('opacity', '1');
    await expect(tooltip).toHaveText(await icon.getAttribute('aria-label'));
    await page.getByRole('button', { name: 'Close navigation' }).hover();
    await expect(tooltip).toHaveCSS('opacity', '0');
    await page.keyboard.press('Tab');
    await icon.focus();
    await expect(tooltip).toHaveCSS('opacity', '1');
    await page.getByRole('button', { name: 'Close navigation' }).focus();
  }
});
