import { test, expect } from '@playwright/test';

for (const width of [1440, 768, 390, 320]) {
  test(`page renders without overflow or broken assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img[loading="lazy"]').all()) {
      await image.evaluate(img => img.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `test-results/landing-${width}.png`, fullPage: true });
  });
}

test('navigation, project filters, services, and inquiry form work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await expect(page.locator('.project')).toHaveCount(4);
  await page.getByRole('button', { name: 'Branding', exact: true }).click();
  await expect(page.getByText('Branding projects are coming soon.')).toBeVisible();
  await page.getByRole('button', { name: 'UI/UX', exact: true }).click();
  await expect(page.locator('.project')).toHaveCount(4);
  await page.locator('summary').filter({ hasText: 'Strategy' }).click();
  await expect(page.getByText('Find your direction with audience research', { exact: false })).toBeVisible();
  await page.locator('summary').filter({ hasText: 'Strategy' }).click();
  await expect(page.locator('.service').first()).not.toHaveAttribute('open');
  await page.getByLabel('Email Address').fill('visitor@example.com');
  await page.getByLabel('Name', { exact: true }).fill('Portfolio Visitor');
  await page.getByLabel('Inquiry').fill('I need a website for my business.');
  await page.getByRole('button', { name: 'Let’s talk' }).click();
  await expect(page.getByRole('status')).toContainText('Your email app will open');
});

test('video slots are silent and looping, while still images and failed videos retain their posters', async ({ page }) => {
  let releaseDemo;
  await page.route('**/assets/videos/demo.webm', async route => {
    await new Promise(resolve => { releaseDemo = resolve; });
    await route.fulfill({ status: 404 });
  });
  await page.route('**/assets/videos/broken.webm', route => route.fulfill({ status: 404 }));
  await page.goto('/tests/media-harness.html', { waitUntil: 'domcontentloaded' });
  const video = page.locator('#video-slot video');
  await expect(video).toBeVisible();
  expect(await video.evaluate(element => element.muted && element.loop && element.playsInline && element.controls)).toBe(true);
  await expect.poll(() => Boolean(releaseDemo)).toBe(true);
  await expect(page.locator('#still-slot img')).toBeVisible();
  await expect(page.locator('#broken-slot img')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(true);
  releaseDemo();
  await expect(page.locator('#video-slot img')).toBeVisible();
});
