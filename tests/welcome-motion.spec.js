import { test, expect } from '@playwright/test';

test('welcome types only when scrolled into view, while the arrow bounces subtly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto('/');
  const text = page.locator('.work-link .typewriter-text');
  await expect(text).not.toHaveClass(/is-revealed/);
  expect(await text.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  const arrow = page.locator('.welcome-arrow');
  const bounce = await arrow.evaluate(node => {
    const animation = node.getAnimations()[0];
    animation.pause();
    const timing = animation.effect.getTiming();
    return { duration: timing.duration, iterations: timing.iterations === Infinity,
      offsets: [0, 1200, 2400].map(time => {
        animation.currentTime = time;
        return new DOMMatrixReadOnly(getComputedStyle(node).transform).m42;
      }) };
  });
  expect(bounce).toEqual({ duration: 2400, iterations: true, offsets: [0, 5, 0] });
  await text.scrollIntoViewIfNeeded();
  await expect(text).toHaveClass(/is-revealed/);
  const timing = await text.evaluate(node => {
    const animations = node.getAnimations({ subtree: true });
    animations.forEach(animation => { animation.pause(); animation.currentTime = 800; });
    const last = animations.at(-1).effect.getTiming();
    return { total: last.delay + last.duration,
      firstOpacity: getComputedStyle(node.querySelector('.typewriter-character')).opacity,
      lastOpacity: getComputedStyle([...node.querySelectorAll('.typewriter-character')].at(-1)).opacity };
  });
  expect(timing.total).toBeCloseTo(1800, 0);
  expect(timing.firstOpacity).toBe('1');
  expect(timing.lastOpacity).toBe('0');
  await text.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
  await page.getByRole('link', { name: 'Go to projects' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await text.scrollIntoViewIfNeeded();
  expect(await text.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
});

test('reduced motion shows the welcome immediately and stops the arrow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.work-link .typewriter-character').last()).toHaveCSS('opacity', '1');
  expect(await page.locator('.welcome-arrow').evaluate(node => node.getAnimations().length)).toBe(0);
});
