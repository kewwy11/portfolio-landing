import { test, expect } from '@playwright/test';

test('footer matches Figma column positions and visible text gaps', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 930 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const footer = page.locator('.footer');
  await footer.scrollIntoViewIfNeeded();
  const geometry = await footer.evaluate(element => {
    const origin = element.getBoundingClientRect();
    const box = selector => element.querySelector(selector).getBoundingClientRect();
    const gaps = parent => {
      const nodes = [...parent.children].map(node => node.getBoundingClientRect());
      return nodes.slice(1).map((node, index) => node.top - nodes[index].bottom);
    };
    return {
      height: origin.height,
      headline: { x: box('.footer-heading').left - origin.left, y: box('.footer-heading').top - origin.top },
      columns: { x: box('.footer-columns').left - origin.left, y: box('.footer-columns').top - origin.top, width: box('.footer-columns').width },
      columnGaps: [...element.querySelectorAll('.footer-column')].flatMap(gaps),
      linkGaps: [...element.querySelectorAll('.footer-links')].flatMap(gaps),
      emailGap: gaps(element.querySelector('.footer-email'))[0],
      bottomAlignment: box('.footer-email a').bottom - box('.footer-right small').bottom,
      rightInset: origin.right - box('.footer-right small').right,
    };
  });
  expect(geometry.height).toBe(365);
  expect(geometry.headline.x).toBe(40);
  expect(geometry.headline.y).toBe(48);
  expect(geometry.columns).toEqual({ x: 844, y: 48, width: 524 });
  expect(geometry.rightInset).toBe(72);
  for (const gap of [...geometry.columnGaps, ...geometry.linkGaps]) expect(gap).toBeCloseTo(24, 0);
  expect(geometry.emailGap).toBeCloseTo(10, 0);
  expect(geometry.bottomAlignment).toBeCloseTo(0, 0);
  await expect(footer.getByRole('heading', { name: 'Quick links' })).toHaveCSS('font-size', '16px');
  await expect(footer.locator('.location h3')).toHaveCSS('font-size', '15px');
  await footer.screenshot({ path: '.tools/footer-final-desktop.png' });
});

test('footer preserves spacing and readable content on tablet and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 930 });
    const footer = page.locator('.footer');
    await footer.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await footer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const links = footer.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link');
    await expect(links).toHaveCount(5);
    for (const link of await links.all()) await expect(link).toBeVisible();
    const gaps = await footer.locator('.footer-links').evaluateAll(parents => parents.flatMap(parent => {
      const boxes = [...parent.children].map(node => node.getBoundingClientRect());
      return boxes.slice(1).map((box, index) => box.top - boxes[index].bottom);
    }));
    for (const gap of gaps) expect(gap).toBeCloseTo(24, 0);
    if (width > 760) {
      const bottomAlignment = await footer.evaluate(element =>
        element.querySelector('.footer-email a').getBoundingClientRect().bottom - element.querySelector('small').getBoundingClientRect().bottom);
      expect(bottomAlignment).toBeCloseTo(0, 0);
    }
    if (width === 390) await footer.screenshot({ path: '.tools/footer-final-mobile.png' });
  }
});
