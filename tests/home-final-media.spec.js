import { test, expect } from './browser-test.js';

test('the supplied videos play in the right slots, loop continuously, and pause offscreen', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.hero-line').first().locator('video');
  const last = page.locator('.hero-line').nth(3).locator('video');
  await expect(first).toHaveAttribute('src', '/assets/videos/pink-reel.mp4');
  await expect(last).toHaveAttribute('src', '/assets/videos/visual-reel.mp4');
  await expect(page.locator('video.contact-image')).toHaveAttribute('src', '/assets/videos/visual-reel.mp4');
  await expect.poll(() => first.evaluate(video => video.readyState >= 2 && !video.paused)).toBe(true);
  expect(await first.evaluate(video => video.muted && video.playsInline && video.loop && !video.controls)).toBe(true);
  await first.evaluate(video => { video.currentTime = video.duration - .1; });
  await expect.poll(() => first.evaluate(video => !video.paused && video.currentTime < 1), { timeout: 10000 }).toBe(true);
  await page.locator('#proof').evaluate(node => node.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => first.evaluate(video => video.paused)).toBe(true);
  await page.locator('video.contact-image').evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect.poll(() => page.locator('video.contact-image').evaluate(video => video.readyState >= 2 && !video.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('video.contact-image')).toHaveJSProperty('paused', true);
  await expect(page.locator('video.contact-image')).toHaveJSProperty('controls', true);
  await page.goto('/contact');
  await expect(page.locator('video.contact-image')).toHaveAttribute('src', '/assets/videos/visual-reel.mp4');
});

test('project hover images crossfade and keyboard focus previews the same designs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.project')).toHaveCount(3);
  await expect(page.locator('.project-caption h3')).toHaveText(['Coming soon', 'Lumis Dermatologists', 'Piggyvest']);
  for (const id of ['lumis', 'piggyvest']) {
    const card = page.locator(`[data-project="${id}"]`);
    const preview = card.locator('.project-hover-image');
    await expect.poll(() => preview.evaluate(image => image.complete && image.naturalWidth > 0), { timeout: 60000 }).toBe(true);
    await page.mouse.move(0, 0);
    await expect(preview).toHaveCSS('opacity', '0');
    await card.hover();
    await expect(preview).toHaveCSS('opacity', '1');
    await card.screenshot({ path: `test-results/home-${id}-hover.png` });
    await page.mouse.move(0, 0);
    await expect(preview).toHaveCSS('opacity', '0');
    await card.locator('.project-image').focus();
    await page.keyboard.press('ArrowRight');
    await expect(preview).toHaveCSS('opacity', '1');
    await card.locator('.project-image').evaluate(node => node.blur());
    await expect(preview).toHaveCSS('opacity', '0');
  }
});

test('the filter slides through intermediate positions in both directions and loads branding video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.bringToFront();
  const filter = page.locator('.filters');
  await filter.scrollIntoViewIfNeeded();
  const positions = await filter.evaluate(async node => {
    const indicator = node.querySelector('.filter-indicator');
    const x = () => indicator.getBoundingClientRect().left;
    const buttons = node.querySelectorAll('button');
    const start = x();
    buttons[1].click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise(resolve => setTimeout(resolve, 160));
    const middle = x();
    const dragScale = new DOMMatrixReadOnly(getComputedStyle(indicator, '::before').transform).a;
    const dragAnimation = getComputedStyle(indicator, '::before').animationName;
    await new Promise(resolve => setTimeout(resolve, 650));
    const right = x();
    buttons[0].click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise(resolve => setTimeout(resolve, 160));
    const reversed = x();
    await new Promise(resolve => setTimeout(resolve, 650));
    return { start, middle, right, reversed, end: x(), width: indicator.getBoundingClientRect().width, dragScale, dragAnimation };
  });
  expect(positions.middle).toBeGreaterThan(positions.start);
  expect(positions.middle).toBeLessThan(positions.start + positions.width);
  expect(positions.dragAnimation).toBe('filter-drag-right');
  expect(positions.dragScale).toBeGreaterThan(1.02);
  expect(positions.reversed).toBeGreaterThan(positions.start);
  expect(positions.reversed).toBeLessThan(positions.right);
  expect(positions.end).toBeCloseTo(positions.start, 1);
  await page.getByRole('button', { name: 'Branding', exact: true }).click();
  await expect(page.locator('.project')).toHaveCount(2);
  const video = page.locator('[data-project="lumis-brand"] video');
  await video.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(video).toHaveAttribute('src', '/assets/videos/lumis-brand-reel.mp4');
  await expect.poll(() => video.evaluate(node => node.readyState >= 2 && !node.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(filter.locator('.filter-indicator')).toHaveCSS('transition-duration', '0s');
});

test('updated homepage assets and service crops fit desktop, tablet, and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.review-author strong')).toHaveText(['Jesse A.', 'Samuel Olu', 'Ibrahim Adekunle']);
    for (const avatar of await page.locator('.review-avatar img').all()) {
      await avatar.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect.poll(() => avatar.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    }
    const services = page.locator('.service-accordion');
    for (const service of await services.all()) {
      await service.locator('button').click();
      const image = service.locator('.service-visual img');
      await image.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0), { timeout: 60000 }).toBe(true);
      const covered = await image.evaluate(node => {
        const image = node.getBoundingClientRect();
        const slot = node.parentElement.getBoundingClientRect();
        return image.left <= slot.left + .1 && image.right >= slot.right - .1 && image.top <= slot.top + .1 && image.bottom >= slot.bottom - .1;
      });
      expect(covered).toBe(true);
      if (width === 1440 || width === 390) await service.screenshot({ path: `test-results/home-service-${await image.getAttribute('src').then(src => src.split('/').pop().split('.')[0])}-${width}.png` });
    }
    await services.last().locator('button').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440 || width === 390) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `test-results/home-final-${width}.png`, fullPage: true });
    }
  }
});
