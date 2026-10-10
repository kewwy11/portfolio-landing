import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('the first core flow scrolls its tall dashboard inside a pinned viewport', async ({ page }) => {
  await page.goto('/projects/lumis');
  const scene = page.locator('.lumis-scroll-scene');
  const viewport = page.locator('.lumis-scroll-viewport');
  const image = viewport.locator('.lumis-dashboard-scroll-image');
  await image.waitFor({ state: 'visible' });

  const geometry = await scene.evaluate((node) => {
    const viewportNode = node.querySelector('.lumis-scroll-viewport');
    const imageNode = viewportNode.querySelector('.lumis-dashboard-scroll-image');
    return {
      sceneTop: node.getBoundingClientRect().top + window.scrollY,
      sceneHeight: node.offsetHeight,
      viewportHeight: viewportNode.offsetHeight,
      imageHeight: imageNode.offsetHeight,
      stickyTop: Number.parseFloat(getComputedStyle(viewportNode).top),
    };
  });

  expect(geometry.imageHeight).toBeGreaterThan(geometry.viewportHeight);
  expect(geometry.sceneHeight).toBeGreaterThan(geometry.viewportHeight);
  expect(geometry.viewportHeight).toBeCloseTo(geometry.imageHeight * 737 / 1038, 0);

  const travel = geometry.sceneHeight - geometry.viewportHeight;
  await page.evaluate((y) => window.scrollTo(0, y), geometry.sceneTop - geometry.stickyTop);
  await expect.poll(() => image.evaluate((node) => getComputedStyle(node).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  const initialTop = await viewport.evaluate((node) => node.getBoundingClientRect().top);
  await viewport.screenshot({ path: 'test-results/lumis-core-flow-top.png' });

  await page.evaluate((y) => window.scrollTo(0, y), geometry.sceneTop - geometry.stickyTop + travel / 2);
  await expect.poll(() => image.evaluate((node) => getComputedStyle(node).transform)).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  expect(await viewport.evaluate((node) => node.getBoundingClientRect().top)).toBeCloseTo(initialTop, 0);

  await page.evaluate((y) => window.scrollTo(0, y), geometry.sceneTop - geometry.stickyTop + travel);
  await expect.poll(() => image.evaluate((node) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
    return Math.abs(Math.round(matrix.m42) - Math.round(node.parentElement.parentElement.offsetHeight - node.offsetHeight));
  })).toBeLessThanOrEqual(2);
  await expect(viewport.locator('.lumis-dashboard-chrome')).toHaveCSS('transform', 'none');
  await viewport.screenshot({ path: 'test-results/lumis-core-flow-bottom.png' });
});
