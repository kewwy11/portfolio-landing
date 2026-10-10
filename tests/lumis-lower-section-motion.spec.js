import { test, expect } from '@playwright/test';

test('board has no waiting card boxes, decision questions wrap deliberately, and lower rows rise once', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/lumis');

  const board = page.locator('.lumis-research-board');
  await expect(board.locator('.lumis-board-tile').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.lumis-research-board > img')).toHaveCSS('opacity', '0');

  const researchSubheading = page.locator('.lumis-research-tones h3');
  const decisionSubheading = page.locator('.lumis-decision-heading h3').first();
  await expect(decisionSubheading.locator('br')).toHaveCount(1);
  for (const property of ['font-family', 'font-size', 'font-weight', 'line-height', 'color']) {
    expect(await decisionSubheading.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property))
      .toBe(await researchSubheading.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property));
  }

  const consideration = page.locator('.lumis-consideration').first();
  await consideration.evaluate(element => window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight / 3,
    behavior: 'instant',
  }));
  await expect(consideration).toHaveClass(/is-revealed/);
  await expect(consideration.locator('figure')).toHaveCSS('animation-name', 'lumis-paired-rise');
  await expect(consideration.locator(':scope > div')).toHaveCSS('animation-delay', '0.11s');

  const rows = page.locator('.lumis-lesson-row');
  await expect(rows).toHaveCount(2);
  await rows.last().evaluate(element => window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight / 3,
    behavior: 'instant',
  }));
  await expect(rows.last()).toHaveClass(/is-revealed/);
  await expect(rows.last().locator('.lumis-lesson').first()).toHaveCSS('animation-delay', '0.18s');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(consideration).toHaveClass(/is-revealed/);
  await expect(rows.last()).toHaveClass(/is-revealed/);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
