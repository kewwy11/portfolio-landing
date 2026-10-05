import { test, expect } from '@playwright/test';

async function openFooter(page, reducedMotion = 'no-preference', width = 1440) {
  await page.emulateMedia({ reducedMotion });
  await page.setViewportSize({ width, height: 930 });
  await page.goto('/contact');
  const masthead = page.locator('.footer-masthead');
  await masthead.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  return masthead;
}

test('wordmark reveals first, then one centered image grows and settles; switching never overlaps images', async ({ page }) => {
  test.setTimeout(180_000);
  const masthead = await openFooter(page);
  const wordmark = masthead.locator('.footer-wordmark');
  await expect(wordmark).toHaveClass(/is-revealed/, { timeout: 60_000 });
  await wordmark.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => {
    animation.pause(); animation.currentTime = 0;
  }));
  const first = masthead.locator('.footer-card-nommy');
  await first.hover();
  await expect(masthead.locator('.footer-card.is-active')).toHaveCount(0);
  await expect(first.locator('img')).toHaveCSS('opacity', '0');
  await wordmark.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
  await expect(masthead).toHaveClass(/images-ready/);
  await expect(first).toHaveClass(/is-active/, { timeout: 60_000 });
  await expect(first.locator('img')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const tilt = await first.evaluate(node => {
    const matrix = new DOMMatrix(getComputedStyle(node).transform);
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  });
  expect(tilt).toBeCloseTo(18.2, 1);
  await masthead.evaluate(node => {
    window.footerVisibleSamples = [];
    window.footerSampleRunning = true;
    const sample = () => {
      window.footerVisibleSamples.push([...node.querySelectorAll('img')].filter(image =>
        Number(getComputedStyle(image).opacity) > .001 && getComputedStyle(image).visibility !== 'hidden').length);
      if (window.footerSampleRunning) requestAnimationFrame(sample);
    };
    sample();
  });
  const second = masthead.locator('.footer-card-jewelry');
  await second.hover();
  await expect(second).toHaveClass(/is-active/, { timeout: 60_000 });
  await expect(second.locator('img')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const third = masthead.locator('.footer-card-lumis');
  const fourth = masthead.locator('.footer-card-piggyvest');
  await third.hover();
  await fourth.hover();
  await expect(fourth).toHaveClass(/is-active/, { timeout: 60_000 });
  await expect(fourth.locator('img')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  expect(await masthead.evaluate(() => {
    window.footerSampleRunning = false;
    return Math.max(...window.footerVisibleSamples);
  })).toBe(1);
  await expect(first.locator('img')).toHaveCSS('opacity', '0');
  await page.mouse.move(10, 10);
  await expect(masthead.locator('.footer-card.is-active')).toHaveCount(0);
  await expect(second.locator('img')).toHaveCSS('opacity', '0');
  await expect(fourth.locator('img')).toHaveCSS('opacity', '0');
  await masthead.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await second.hover();
  await expect(second).toHaveClass(/is-active/);
  await expect(second.locator('img')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.locator('.site-footer').screenshot({ path: 'test-results/footer-jewelry-revealed.png' });
});

test('reduced motion keeps the cards hidden until keyboard or touch activation and preserves Figma tilts', async ({ page }) => {
  test.setTimeout(180_000);
  const masthead = await openFooter(page, 'reduce', 390);
  await expect(masthead).toHaveClass(/images-ready/);
  await expect(masthead.locator('.footer-card.is-active')).toHaveCount(0);
  const positions = { nommy: [0, 8], jewelry: [367.353, 22.71], lumis: [723, 20], piggyvest: [1081.94, 28] };
  for (const [id, expected] of [['nommy', 18.2], ['jewelry', 12.94], ['lumis', -14.43], ['piggyvest', 11.91]]) {
    const card = masthead.locator(`.footer-card-${id}`);
    await card.focus();
    await expect(card).toHaveClass(/is-active/, { timeout: 60_000 });
    await expect(card.locator('img')).toHaveCSS('opacity', '1');
    expect(await card.evaluate(node => {
      const matrix = new DOMMatrix(getComputedStyle(node).transform);
      return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
    })).toBeCloseTo(expected, 1);
    const position = await card.evaluate(node => {
      const origin = node.closest('.footer-masthead').getBoundingClientRect();
      const box = node.getBoundingClientRect();
      const scale = origin.width / 1360;
      return [(box.left - origin.left) / scale, (box.top - origin.top) / scale];
    });
    position.forEach((value, index) => expect(Math.abs(value - positions[id][index])).toBeLessThan(.1));
    await expect(masthead.locator('.footer-card.is-active')).toHaveCount(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.site-footer').screenshot({ path: 'test-results/footer-piggyvest-mobile.png' });
});
