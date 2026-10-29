import { test, expect } from './browser-test.js';

test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, channel: undefined });

test('project dropdown matches the custom menu and Back preserves each project category', async ({ page }) => {
  await page.goto('/projects');
  const toggle = page.locator('.mobile-filter-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.mobile-filter-options')).toHaveCSS('width', '136px');
  await page.locator('.mobile-filter-options button').last().click();
  await expect(page.locator('.project-grid')).toHaveAttribute('data-category', 'Branding');
  await page.reload();
  await expect(page.locator('.project-grid')).toHaveAttribute('data-category', 'Branding');
  for (const [id, category] of [['beacon-trust', 'Branding'], ['lumis-brand', 'Branding'], ['lumis', 'UI/UX']]) {
    await page.goto(`/projects/${id}`);
    await expect(page.locator('aside nav')).toBeVisible();
    await page.locator('aside > a').click();
    await expect(page.locator('.project-grid')).toHaveAttribute('data-category', category);
  }
});

test('mobile contact videos play inline and pause when offscreen', async ({ page }) => {
  for (const route of ['/', '/about', '/contact']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const video = page.locator('video.contact-image');
    await video.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(() => video.evaluate(node => !node.paused && node.currentTime > 0 && node.muted && node.playsInline), { timeout: 30000 }).toBe(true);
    // A shorter viewport puts the contact page's video completely below the form.
    await page.setViewportSize({ width: 393, height: 500 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => video.evaluate(node => node.getBoundingClientRect().top >= innerHeight)).toBe(true);
    await expect.poll(() => video.evaluate(node => node.paused)).toBe(true);
    await page.setViewportSize({ width: 393, height: 852 });
  }
});

test('About keeps a vertical pinned story with complete touch transitions and an undistorted portrait', async ({ page }) => {
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);
  const portrait = page.locator('.about-portrait');
  await expect(portrait).toHaveCSS('object-fit', 'cover');
  await expect(portrait).toHaveCSS('object-position', '50% 0%');
  const story = page.locator('.about-story');
  await expect(story).toHaveAttribute('data-mode', 'pinned');
  await expect(story.locator('.story-visual-image')).toHaveCount(3);
  await story.evaluate(node => scrollTo({ top: node.offsetTop, behavior: 'instant' }));
  const text = await story.locator('.story-text-window').boundingBox();
  const image = await story.locator('.story-image-window').boundingBox();
  expect(text.y + text.height).toBeLessThan(image.y);
  const session = await page.context().newCDPSession(page);
  const swipe = async direction => {
    const start = direction > 0 ? 650 : 250;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: start }] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: start - direction * step * 35 }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  for (const stage of [2, 3]) {
    await swipe(1);
    await expect(story).toHaveAttribute('data-stage', String(stage));
    await expect(story).toHaveAttribute('data-transitioning', 'false');
  }
  await swipe(1);
  await expect.poll(() => story.evaluate(node => scrollY > node.offsetTop + node.offsetHeight - innerHeight)).toBe(true);
  await session.detach();
});

test('Lumis treatment variants stay centered through a smooth crossfade', async ({ page }) => {
  await page.goto('/projects/lumis');
  await page.evaluate(() => document.fonts.ready);
  const artwork = page.locator('.tp-artwork');
  await artwork.scrollIntoViewIfNeeded();
  const frames = artwork.locator('.tp-frame');
  for (let index = 0; index < 2; index++) {
    await expect(frames.nth(index)).toHaveCSS('opacity', '1', { timeout: 15000 });
    const geometry = await artwork.evaluate((root, index) => {
      const container = root.getBoundingClientRect();
      const frame = root.querySelectorAll('.tp-frame')[index].getBoundingClientRect();
      return { offset: Math.abs(frame.y + frame.height / 2 - container.y - container.height / 2), contained: frame.top > container.top && frame.bottom < container.bottom };
    }, index);
    expect(geometry.offset).toBeLessThan(1);
    expect(geometry.contained).toBe(true);
  }
});
