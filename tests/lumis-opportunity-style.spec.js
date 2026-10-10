import { test, expect } from '@playwright/test';

test('opportunity cards mask on view and error colors match the problem chart', async ({ page }) => {
  await page.goto('/projects/lumis');

  const cards = page.locator('.lumis-opportunity-cards article');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).not.toHaveClass(/is-revealed/);
  await cards.first().evaluate(element => window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight / 2,
    behavior: 'instant',
  }));
  await expect(cards.first()).toHaveClass(/is-revealed/);
  await expect(cards.first()).toHaveCSS('animation-name', 'review-unveil');

  const problemAlert = page.locator('.bias-alert').first();
  const solutionError = page.locator('.workflow-error');
  expect(await problemAlert.evaluate(element => getComputedStyle(element).backgroundColor))
    .toBe(await solutionError.evaluate(element => getComputedStyle(element).backgroundColor));
  expect(await problemAlert.evaluate(element => getComputedStyle(element).borderTopColor))
    .toBe(await solutionError.evaluate(element => getComputedStyle(element).borderTopColor));
  expect(await problemAlert.locator('strong').evaluate(element => getComputedStyle(element).color))
    .toBe(await solutionError.locator('strong').evaluate(element => getComputedStyle(element).color));

  await expect(page.locator('.lumis-research-comparison h3')).toHaveCSS('color', 'rgb(127, 108, 114)');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
