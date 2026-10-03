import { test, expect } from '@playwright/test';

test('Grateful Erhis and the introduction remain static before and after fonts load', async ({ page }) => {
  let releaseFont;
  const fontGate = new Promise(resolve => { releaseFont = resolve; });
  await page.route('**/Poppins-Regular.woff2', async route => {
    await fontGate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const intro = page.locator('.intro');
    await expect(page.locator('.hero')).toHaveClass(/hero-pending/);
    await expect(intro).toHaveCSS('opacity', '1');
    await expect(intro).toHaveCSS('transform', 'none');
    expect(await intro.evaluate(element => element.getAnimations().length)).toBe(0);
    expect(await page.locator('.wordmark').evaluate(element => element.getAnimations().length)).toBe(0);
    expect(await intro.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(0);
    releaseFont();
    await expect(page.locator('.hero')).toHaveClass(/hero-ready/);
    expect(await page.evaluate(() => document.fonts.check('400 16px Poppins'))).toBe(true);
    await expect(intro).toHaveCSS('opacity', '1');
    await expect(intro).toHaveCSS('transform', 'none');
    expect(await intro.evaluate(element => element.getAnimations().length)).toBe(0);
  } finally {
    releaseFont();
  }
});

test('reduced motion displays the intro immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.intro')).toHaveCSS('opacity', '1');
  await expect(page.locator('.intro')).toHaveCSS('transform', 'none');
  expect(await page.locator('.intro').evaluate(element => element.getAnimations().length)).toBe(0);
});
