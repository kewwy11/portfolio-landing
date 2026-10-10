import { test, expect } from '@playwright/test';

test('research follows the case study width and section spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/lumis');

  const research = page.locator('#research');
  const board = research.locator('.lumis-research-board > img');
  await research.scrollIntoViewIfNeeded();
  await expect.poll(() => board.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(research).toHaveCSS('width', '1127px');
  await expect(research).toHaveCSS('padding-top', '48px');
  await expect(research).toHaveCSS('padding-bottom', '48px');
  await expect(page.locator('.lumis-intro')).toHaveCSS('padding-bottom', '48px');

  for (const id of ['overview', 'problem', 'opportunity', 'solution', 'core-flows']) {
    await expect(page.locator(`#${id}`)).toHaveCSS('padding-top', '48px');
    await expect(page.locator(`#${id}`)).toHaveCSS('padding-bottom', '48px');
  }

  await expect(page.locator('.lumis-sidebar a[href="#research"]')).toHaveAttribute('aria-current', 'location');
  await research.screenshot({ path: 'test-results/lumis-research.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
