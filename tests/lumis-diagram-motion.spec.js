import { test, expect } from '@playwright/test';

test('diagrams draw in order only once per page load', async ({ page }) => {
  await page.goto('/projects/lumis');
  const problem = page.locator('.lumis-bias-diagram');
  const solution = page.locator('.lumis-workflow-diagram');

  await expect(problem).not.toHaveClass(/is-drawing/);
  await expect(solution).not.toHaveClass(/is-drawing/);

  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toHaveClass(/is-drawing/);
  await expect(problem.locator('.bias-teaching')).toHaveCSS('animation-name', 'lumis-card-draw');
  await expect(problem.locator('.arrow-left-down')).toHaveCSS('animation-name', 'lumis-draw-down');

  await solution.scrollIntoViewIfNeeded();
  await expect(solution).toHaveClass(/is-drawing/);
  await expect(solution.locator('.workflow-upload')).toHaveCSS('animation-delay', '0s');
  await expect(solution.locator('.workflow-right-one')).toHaveCSS('animation-delay', '0.195s');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(solution).toHaveClass(/is-drawing/);
  await solution.scrollIntoViewIfNeeded();
  await expect(solution).toHaveClass(/is-drawing/);
});
