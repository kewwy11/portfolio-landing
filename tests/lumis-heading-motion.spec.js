import { test, expect } from '@playwright/test';

test('case-study labels and headings slide up together on entry', async ({ page }) => {
  await page.goto('/projects/lumis');
  const menu = page.getByRole('navigation', { name: 'Case study sections' });
  await expect(menu.getByText('Opportunity', { exact: true })).toHaveCount(0);
  await expect(menu.getByText('Supporting Screens', { exact: true })).toHaveCount(0);
  await expect(page.locator('#opportunity')).toBeVisible();
  await expect(page.locator('.lumis-content .typewriter-text')).toHaveCount(0);

  const section = page.locator('#research');
  await section.locator('.lumis-animated-heading').evaluate(element => {
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 120, behavior: 'instant' });
  });
  await expect(section.locator('.lumis-animated-heading')).toHaveClass(/is-revealed/);
  await expect(section.locator('.lumis-label-text')).toHaveCSS('animation-name', 'lumis-heading-rise');
  await expect(section.locator('#research-title .heading-text')).toHaveCSS('animation-name', 'lumis-heading-rise');
  await expect(section.locator('.lumis-label-text')).toHaveCSS('animation-delay', '0s');
  await expect(section.locator('#research-title .heading-text')).toHaveCSS('animation-delay', '0s');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
