import { test, expect } from '@playwright/test';

test('case-study headings reveal on entry and removed menu items stay absent', async ({ page }) => {
  await page.goto('/projects/lumis');
  const menu = page.getByRole('navigation', { name: 'Case study sections' });
  await expect(menu.getByText('Opportunity', { exact: true })).toHaveCount(0);
  await expect(menu.getByText('Supporting Screens', { exact: true })).toHaveCount(0);
  await expect(page.locator('#opportunity')).toBeVisible();
  await expect(page.locator('.lumis-opportunity-intro .typewriter-text')).toHaveCount(0);
  await expect(page.locator('.lumis-workflow-intro .typewriter-text')).toHaveCount(0);

  const section = page.locator('#research');
  await section.locator('.lumis-animated-heading').evaluate(element => {
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 120, behavior: 'instant' });
  });
  await expect(section.locator('.typewriter-text')).toHaveClass(/is-revealed/);
  await expect(section.locator('#research-title')).toHaveClass(/is-revealed/);
  await expect(section.locator('.typewriter-character').last()).toHaveCSS('animation-delay', /0\.5\d+s|0\.6\d+s/);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
