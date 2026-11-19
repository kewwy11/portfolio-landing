import { test, expect } from './browser-test.js';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-clarity-consent', 'denied'));
});

test('experience pairs each role with its details and opens one row at a time', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const experience = page.getByRole('region', { name: 'Experience', exact: true });
  for (const [title, detail] of [
    ['Visual Designer', 'Worked with businesses'],
    ['Careerontrack AI', 'résumé scanner'],
    ['Beacon Trust', 'visual identity system'],
    ['Software Business Solution Consulting', 'business management tools'],
  ]) {
    await experience.getByRole('button', { name: `Details for ${title}` }).click();
    await expect(experience.getByRole('button', { expanded: true })).toHaveCount(1);
    await expect(experience.getByRole('region', { name: title })).toContainText(detail);
  }
  await experience.getByRole('button', { expanded: true }).click();
  await expect(experience.getByRole('button', { expanded: true })).toHaveCount(0);
  await expect(experience.getByRole('link', { name: 'Careerontrack AI' })).toHaveAttribute('href', 'https://www.careerontrack.ai/');
  await expect(experience.getByRole('link', { name: 'Software Business Solution Consulting' })).toHaveAttribute('href', 'https://www.quick-retail.com/');
});

test('View Resume opens the public PDF without a forced download', async ({ page, request }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'View Resume' });
  await expect(link).toHaveAttribute('href', '/resume.pdf');
  await expect(link).toHaveAttribute('target', '_blank');
  expect(await link.getAttribute('download')).toBeNull();

  const response = await request.get('/resume.pdf');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect(response.headers()['content-disposition'] || '').not.toContain('attachment');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('mobile Experience places the role under the row header and expands into a vertical skills list', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const experience = page.getByRole('region', { name: 'Experience', exact: true });
  await expect(experience.getByRole('link', { name: 'My Resume' })).toHaveAttribute('target', '_blank');
  const row = experience.locator('.experience-row').first();
  await expect(row.locator('.experience-row-header')).toHaveCSS('grid-template-areas', '"title date toggle" "role role role"');
  await expect(row.locator('.experience-job-title')).toHaveCSS('font-size', '14px');
  await row.getByRole('button', { name: 'Details for Visual Designer' }).click();
  await expect(row).toHaveCSS('border-top-width', '6px');
  await expect(row.locator('.experience-description p')).toHaveCount(2);
  await expect(row.locator('.experience-skills')).toHaveCSS('flex-direction', 'column');
});
