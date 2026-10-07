import { test, expect } from '@playwright/test';

test('links stay undecorated while menu separators, hover motion, and keyboard focus remain', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const decoratedLinks = () => page.locator('a').evaluateAll(links => links
    .filter(link => getComputedStyle(link).textDecorationLine !== 'none')
    .map(link => link.textContent.trim() || link.getAttribute('aria-label')));
  expect(await decoratedLinks()).toEqual([]);

  await page.keyboard.press('Tab');
  const skipLink = page.locator('.skip-link');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS('text-decoration-line', 'none');
  await expect(skipLink).toHaveCSS('outline-style', 'solid');
  await skipLink.evaluate(link => link.blur());
  for (const selector of ['.wordmark', '.work-link a', '.footer-email a', '.footer a[href="#home"]']) {
    const link = page.locator(selector).first();
    await link.hover();
    await expect(link).toHaveCSS('text-decoration-line', 'none');
    await link.focus();
    await expect(link).toHaveCSS('text-decoration-line', 'none');
  }

  await page.getByRole('button', { name: 'Open navigation' }).click();
  const menuLinks = page.locator('.menu-navigation a');
  const firstLink = menuLinks.first();
  await firstLink.hover();
  await expect(firstLink).toHaveCSS('text-decoration-line', 'none');
  await expect(firstLink).toHaveCSS('border-bottom-width', '1px');
  await expect(firstLink).toHaveCSS('border-bottom-style', 'solid');
  expect(await firstLink.evaluate(link => getComputedStyle(link, '::after').content)).toBe('none');
  await expect(firstLink.locator('.menu-link-arrow')).toHaveCSS('opacity', '1');
  await expect(firstLink.locator('.menu-link-label')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 28, 0)');
  await expect(firstLink.locator('.menu-number-track')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -24)');

  await firstLink.focus();
  await firstLink.press('Tab');
  const secondLink = menuLinks.nth(1);
  await expect(secondLink).toBeFocused();
  await expect(secondLink).toHaveCSS('text-decoration-line', 'none');
  await expect(secondLink).toHaveCSS('outline-style', 'solid');
  await expect(secondLink).toHaveCSS('outline-width', '3px');
  await expect(secondLink).toHaveCSS('border-bottom-width', '1px');
  expect(await secondLink.evaluate(link => getComputedStyle(link, '::after').content)).toBe('none');
  await page.getByRole('button', { name: 'Close navigation' }).click();

  await page.getByRole('button', { name: 'Branding', exact: true }).click();
  await expect(page.locator('.project')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Beacon Trust', exact: true })).toBeVisible();
  expect(await decoratedLinks()).toEqual([]);
});
