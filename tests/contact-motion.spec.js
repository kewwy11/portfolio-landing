import { test, expect } from '@playwright/test';

const geometry = heading => heading.evaluate(node => {
  const box = node.getBoundingClientRect();
  const form = node.parentElement.querySelector('form').getBoundingClientRect();
  return { height: box.height, formOffset: form.top - box.top };
});

for (const width of [1440, 390]) {
  test(`contact reveals its natural lines in order without moving the form at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 930 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator('#contact-heading');
    await expect(heading).not.toHaveClass(/is-revealed/);
    const original = await geometry(heading);
    expect(await heading.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await heading.locator('.typewriter-character').count()).toBe(0);
    await expect.poll(() => heading.locator('.line-reveal-text').count()).toBeGreaterThan(1);
    const lineCount = await heading.locator('.line-reveal-text').count();
    expect(lineCount).toBe(width === 1440 ? 4 : 8);
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toHaveClass(/is-revealed/);
    const timings = await heading.evaluate(node => {
      const animations = node.getAnimations({ subtree: true });
      animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
      return animations.map(animation => {
        const { duration, delay } = animation.effect.getTiming();
        return { duration, delay, easing: getComputedStyle(animation.effect.target).animationTimingFunction };
      });
    });
    expect(timings.length).toBe(lineCount);
    timings.forEach((timing, index) => {
      expect(timing).toEqual({ duration: 400, delay: index * 140, easing: 'cubic-bezier(0.12, 0.23, 0.5, 1)' });
    });
    await expect(heading.locator('.line-reveal-text').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 32)');
    expect(await geometry(heading)).toEqual(original);
    await heading.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
    await expect(heading).toHaveClass(/is-settled/);
    await expect(heading.locator('.line-reveal-source')).toHaveCSS('opacity', '1');
    expect(await geometry(heading)).toEqual(original);
    await expect(heading).toHaveAccessibleName(await heading.locator('.line-reveal-source').textContent());
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(heading).not.toHaveClass(/is-revealed/);
    await expect(heading).not.toHaveClass(/is-settled/);
    await expect(heading.locator('.line-reveal-source')).toHaveCSS('opacity', '0');
    expect(await heading.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toHaveClass(/is-revealed/);
    expect(await heading.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(lineCount);
    await heading.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => {
      animation.pause();
      animation.currentTime = 0;
    }));
    await expect(heading.locator('.line-reveal-text').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 32)');
    expect(await geometry(heading)).toEqual(original);
    await heading.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
    await expect(heading).toHaveClass(/is-settled/);
    await page.setViewportSize({ width: width === 1440 ? 390 : 1440, height: 930 });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toHaveClass(/is-revealed/);
    await heading.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
    await expect(heading.locator('.line-reveal-source')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('contact keeps its completed copy while partially visible and restarts only after exiting', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 300 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('#contact-heading');
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  await heading.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
  await expect(heading).toHaveClass(/is-settled/);
  await heading.evaluate(node => {
    const box = node.getBoundingClientRect();
    scrollTo({ top: scrollY + box.bottom - 2, behavior: 'instant' });
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await heading.evaluate(node => node.getBoundingClientRect().bottom)).toBeCloseTo(2, 0);
  await expect(heading).toHaveClass(/is-settled/);
  await expect(heading.locator('.line-reveal-source')).toHaveCSS('opacity', '1');
  await heading.evaluate(node => {
    const box = node.getBoundingClientRect();
    scrollTo({ top: scrollY + box.bottom + 2, behavior: 'instant' });
  });
  await expect(heading).not.toHaveClass(/is-revealed/);
  await expect(heading).not.toHaveClass(/is-settled/);
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  expect(await heading.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(4);
});

test('contact copy is immediately readable for reduced motion or without viewport observation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const heading = page.locator('#contact-heading');
  await expect(heading.locator('.line-reveal-source')).toHaveCSS('opacity', '1');
  expect(await heading.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => { delete window.IntersectionObserver; });
  await page.reload();
  await expect(heading.locator('.line-reveal-source')).toHaveCSS('opacity', '1');
  expect(await heading.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});
