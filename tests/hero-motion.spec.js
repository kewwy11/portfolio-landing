import { test, expect } from '@playwright/test';

test('hero boxes finish scaling before text reveals, with stable centered layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveClass(/hero-ready/);
  const sequence = await page.locator('.hero-heading').evaluate(element => {
    const animations = element.getAnimations({ subtree: true });
    for (const animation of animations) animation.pause();
    return animations.map(animation => {
      const { delay, duration } = animation.effect.getTiming();
      return { name: animation.animationName, delay, duration };
    });
  });
  const boxes = sequence.filter(animation => animation.name === 'hero-box-enter');
  const text = sequence.filter(animation => animation.name === 'hero-text-enter');
  expect(boxes).toHaveLength(3);
  expect(text).toHaveLength(6);
  expect(Math.max(...boxes.map(animation => animation.delay + animation.duration)))
    .toBeLessThan(Math.min(...text.map(animation => animation.delay)));
  const setTime = time => page.locator('.hero-heading').evaluate((element, time) => {
    for (const animation of element.getAnimations({ subtree: true })) animation.currentTime = time;
  }, time);
  await setTime(0);
  await expect(page.locator('.hero-inset').first()).toHaveCSS('transform', 'matrix(0.5, 0, 0, 0.5, 0, 0)');
  await expect(page.locator('.hero-text').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 32)');
  await expect(page.locator('.hero-text').first()).toHaveCSS('opacity', '0.001');
  await setTime(800);
  for (const box of await page.locator('.hero-inset').all()) {
    await expect(box).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(box).toHaveCSS('opacity', '1');
  }
  await expect(page.locator('.hero-text').first()).toHaveCSS('opacity', '0.001');
  await page.screenshot({ path: 'test-results/hero-boxes-first.png' });
  await setTime(1050);
  const textState = await page.locator('.hero-text').first().evaluate(element => {
    const style = getComputedStyle(element);
    return { y: new DOMMatrixReadOnly(style.transform).m42, opacity: Number(style.opacity) };
  });
  expect(textState.y).toBeGreaterThan(0);
  expect(textState.y).toBeLessThan(32);
  expect(textState.opacity).toBeGreaterThan(.001);
  expect(textState.opacity).toBeLessThan(1);
  await page.screenshot({ path: 'test-results/hero-text-rising.png' });
  await page.locator('.hero-heading').evaluate(element => {
    for (const animation of element.getAnimations({ subtree: true })) animation.finish();
  });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 930 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const rows = await page.locator('.hero-line').evaluateAll(elements => elements.map(element =>
      [...element.children].map(child => {
        const box = child.getBoundingClientRect();
        return box.y + box.height / 2;
      })));
    for (const centers of rows) expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(1);
    await page.screenshot({ path: `test-results/hero-motion-${width}.png` });
  }
});

test('reduced motion shows the complete hero without entrance animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveClass(/hero-ready/);
  await expect(page.locator('.hero-inset').first()).toHaveCSS('transform', 'none');
  await expect(page.locator('.hero-inset').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.hero-text').first()).toHaveCSS('transform', 'none');
  expect(await page.locator('.hero-heading').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});
