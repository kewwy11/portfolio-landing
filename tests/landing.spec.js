import { test, expect } from '@playwright/test';

test('the Gind display font is served and loaded for visitors', async ({ page }) => {
  const fontResponse = await page.request.get('/assets/fonts/Gind.otf');
  expect(fontResponse.ok()).toBe(true);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('100px Gind'))).toBe(true);
  expect(await page.locator('.hero-heading').evaluate(element => getComputedStyle(element).fontFamily)).toBe('Gind');
});

for (const width of [1440, 768, 390, 320]) {
  test(`page renders without overflow or broken assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img[loading="lazy"]').all()) {
      await image.evaluate(img => img.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0), {
        message: `Load ${await image.getAttribute('src')}`,
        timeout: 30_000,
      }).toBe(true);
    }
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), { timeout: 30_000 }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `test-results/landing-${width}.png`, fullPage: true });
  });
}

test('navigation, project filters, services, and inquiry form work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const menu = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link')).toHaveCount(6);
  await expect(menu.getByRole('link', { name: 'Proof' })).toHaveAttribute('href', '#proof');
  await expect(menu.getByRole('link', { name: 'Let’s Talk' })).toHaveAttribute('href', '/contact');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await menu.getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await expect(page.locator('.project')).toHaveCount(4);
  await page.getByRole('button', { name: 'Branding', exact: true }).click();
  await expect(page.locator('.project')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Beacon Trust', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'UI/UX', exact: true }).click();
  await expect(page.locator('.project')).toHaveCount(4);
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/#services$/);
  await page.getByRole('button', { name: '01 Strategy' }).click();
  await expect(page.getByText('Before I design anything, I define the structure', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '01 Strategy' }).click();
  await expect(page.getByRole('button', { name: '01 Strategy' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByLabel('Email Address').fill('visitor@example.com');
  await page.getByLabel('Name', { exact: true }).fill('Portfolio Visitor');
  await page.getByLabel('Inquiry').fill('I need a website for my business.');
  await page.getByRole('button', { name: 'Let’s talk' }).click();
  await expect(page.getByRole('status')).toContainText('Your email app will open');
});

test('right-side menu and hero arrow work at desktop and narrow viewports', async ({ page }) => {
  // Layout is checked at rest; the next test inspects both animated edges.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 930 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const overlay = page.getByRole('dialog', { name: 'Site menu' });
  await expect(overlay).toBeVisible();
  await expect(page.locator('.menu-panel')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('.menu-backdrop')).toHaveCSS('backdrop-filter', 'blur(20px)');
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();
  expect(await overlay.evaluate(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  })).toEqual({ x: 961, y: 0, width: 479, height: 930 });
  await page.screenshot({ path: 'test-results/menu-desktop-1440.png' });
  const heroBefore = await page.locator('.hero-heading').boundingBox();
  await page.mouse.move(300, 400);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.locator('.hero-heading').boundingBox()).toEqual(heroBefore);
  await page.locator('.menu-backdrop').click({ position: { x: 100, y: 100 } });
  await expect(overlay).toHaveCount(0);
  await page.setViewportSize({ width: 433, height: 706 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(overlay).toBeVisible();
  await expect(page.locator('.menu-panel')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  expect(await overlay.evaluate(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  })).toEqual({ x: 0, y: 0, width: 433, height: 706 });
  await expect(overlay.locator('.menu-social')).toHaveCount(5);
  await page.screenshot({ path: 'test-results/menu-433.png' });
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(overlay).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  const prompt = page.locator('.work-link > .typewriter-text');
  await prompt.hover();
  await expect(prompt).toHaveCSS('text-decoration-line', 'none');
  await page.getByRole('link', { name: 'Go to projects' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(overlay).toBeVisible();
  await expect(page.locator('.menu-panel')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  expect(await overlay.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await overlay.locator('.menu-overlay-inner').evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeInViewport();
});

test('menu unfolds a curved edge on opening and folds it back on closing', async ({ page }) => {
  await page.goto('/');
  const curve = page.locator('.menu-curve');
  const panel = page.locator('.menu-panel');
  const freezeCurve = async () => {
    await expect.poll(() => curve.evaluate(element => element.getAnimations().length)).toBeGreaterThan(0);
    await page.locator('.menu-layer').evaluate(element => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = 180;
      }
    });
    const width = await curve.evaluate(element => element.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(0);
    expect(width).toBeLessThan(100);
    await expect(page.locator('.menu-curve-shape')).toHaveCSS('border-top-left-radius', '60%');
  };
  const finish = () => page.locator('.menu-layer').evaluate(element => {
    for (const animation of element.getAnimations({ subtree: true })) animation.finish();
  });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await freezeCurve();
  await page.screenshot({ path: 'test-results/menu-unfolding.png' });
  await finish();
  await expect(curve).toHaveCSS('width', '0px');
  await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await freezeCurve();
  await page.screenshot({ path: 'test-results/menu-folding.png' });
  await finish();
  await expect(page.locator('.menu-layer')).toHaveCSS('visibility', 'hidden');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(curve).toHaveCSS('width', '0px');
  await expect(panel).toHaveCSS('transition-duration', '0s');
});

test('video slots are silent with continuous loops, while still images and failed videos retain their posters', async ({ page }) => {
  let releaseDemo;
  await page.route('**/assets/videos/demo.webm', async route => {
    await new Promise(resolve => { releaseDemo = resolve; });
    await route.fulfill({ status: 404 });
  });
  await page.route('**/assets/videos/broken.webm', route => route.fulfill({ status: 404 }));
  await page.goto('/tests/media-harness.html', { waitUntil: 'domcontentloaded' });
  const video = page.locator('#video-slot video');
  await expect(video).toBeVisible();
  expect(await video.evaluate(element => element.muted && element.loop && element.playsInline)).toBe(true);
  await expect.poll(() => Boolean(releaseDemo)).toBe(true);
  await expect(page.locator('#still-slot img')).toBeVisible();
  await expect(page.locator('#broken-slot img')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(true);
  releaseDemo();
  await expect(page.locator('#video-slot img')).toBeVisible();
});
