import { test, expect } from '@playwright/test';

test('About includes the three story pairs, experience, shared contact, and footer in the correct order', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveTitle('About — Grateful Erhis');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('More about me...');
  await expect(page.locator('.experience-row')).toHaveCount(4);
  await expect(page.locator('.experience-row').first()).toContainText('Software Business Solution Consulting (SBSC)');
  await expect(page.locator('.experience-row').last()).toContainText('2025-2026');
  await expect(page.locator('.contact')).toHaveCount(1);
  await expect(page.locator('.footer')).toHaveCount(1);
  await expect(page.locator('.header')).toHaveCount(1);
  await expect(page.locator('.hero')).toHaveCount(0);
  const geometry = await page.evaluate(() => {
    const box = selector => {
      const rectangle = document.querySelector(selector).getBoundingClientRect();
      return { x: rectangle.x, y: rectangle.y + scrollY, width: rectangle.width, height: rectangle.height };
    };
    return { heading: box('.about-heading'), title: box('#about-heading'), intro: box('.about-intro'),
      question: box('#about-question'), portrait: box('.about-portrait'), story: box('#about-story'),
      experience: box('.about-experience'), rows: box('.experience-list') };
  });
  expect(geometry.heading.width).toBe(1440);
  expect(geometry.heading.height).toBeCloseTo(240, 1);
  expect(geometry.intro.height).toBeCloseTo(817, 1);
  expect(geometry.portrait.width).toBeCloseTo(670, 1);
  expect(geometry.portrait.height).toBeCloseTo(721, 1);
  expect(Math.min(geometry.question.y, geometry.portrait.y) - geometry.title.y - geometry.title.height).toBeCloseTo(64, 1);
  expect(geometry.question.y + geometry.question.height).toBeCloseTo(geometry.portrait.y + geometry.portrait.height, 1);
  expect(geometry.story.x).toBe(0);
  expect(geometry.story.width).toBe(1440);
  expect(geometry.story.y).toBeGreaterThanOrEqual(geometry.heading.y + geometry.heading.height - 1);
  expect(geometry.experience.y).toBeGreaterThanOrEqual(geometry.story.y + geometry.story.height - 1);
  expect(geometry.experience.height).toBeCloseTo(556, 1);
  expect(geometry.rows.height).toBeGreaterThan(0);
  await expect(page.locator('.experience-row').first()).toHaveCSS('font-size', '16px');
  await expect(page.locator('.experience-row').first()).toHaveCSS('line-height', '24px');
  await expect(page.locator('#about-question .heading-mask')).toHaveCount(4);
  await expect(page.locator('#about-question')).toHaveCSS('font-size', '96px');
  await expect(page.locator('#about-question')).toHaveCSS('line-height', '90px');
  const copies = page.locator('.story-sticky .story-copy');
  await expect(copies.first()).toHaveCSS('font-size', '20px');
  await expect(copies.first()).toHaveCSS('line-height', '30px');
  expect(await copies.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width))).toEqual([538, 523, 523]);
  const storyImages = page.locator('.story-visual-image');
  await expect(storyImages).toHaveCount(3);
  for (const image of await storyImages.all()) {
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
  }
  await page.locator('.contact-image').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.contact-image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(errors).toEqual([]);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: '.tools/about-desktop.png', fullPage: true });
});

test('menu and footer link between About and the landing page, including direct reload and browser history', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('More about me...');
  await page.reload();
  await expect(page.locator('.about-page')).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Let’s Talk' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByLabel('Email Address')).toBeInViewport();
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('#projects')).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('.contact-page')).toBeVisible();
  await page.locator('.wordmark').click();
  await expect(page).toHaveURL(/\/#home$/);
  await expect(page.locator('.hero')).toHaveCount(1);
});

test('About adapts to tablet and narrow screens without overflow or missing content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/about/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { name: 'More about me...' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.experience-row')).toHaveCount(4);
    await expect(page.locator('.story-flow img')).toHaveCount(3);
    expect(await page.locator('.story-visual-image').evaluateAll(images => images.every(image => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.left >= -1 && box.right <= innerWidth + 1;
    }))).toBe(true);
    expect(await page.locator('.experience-row').evaluateAll(rows => rows.every(row => row.scrollWidth <= row.clientWidth))).toBe(true);
    const gap = await page.evaluate(() => {
      const title = document.querySelector('#about-heading').getBoundingClientRect();
      const question = document.querySelector('#about-question').getBoundingClientRect();
      const portrait = document.querySelector('.about-portrait').getBoundingClientRect();
      return Math.min(question.top, portrait.top) - title.bottom;
    });
    expect(gap).toBeCloseTo(width <= 760 ? 32 : 64, 1);
    await expect(page.locator('.experience-row').first()).toHaveCSS('font-size', width <= 760 ? '14px' : '16px');
    await expect(page.locator('.experience-row').first()).toHaveCSS('line-height', width <= 760 ? '21px' : '24px');
    if (width === 390) {
      await page.locator('.contact-image').scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator('.contact-image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: '.tools/about-mobile.png', fullPage: true });
    }
    await page.getByLabel('Email Address').fill('visitor@example.com');
    await page.getByLabel('Name', { exact: true }).fill('Portfolio Visitor');
    await page.getByLabel('Inquiry').fill('I would like a website.');
    await page.getByRole('button', { name: 'Let’s talk', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Your email app will open');
    expect(await page.locator('a').evaluateAll(links => links.every(link => getComputedStyle(link).textDecorationLine === 'none'))).toBe(true);
  }
});

test('About headings reveal on entry and repeat after leaving view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('#experience-heading');
  await expect(heading).not.toHaveClass(/is-revealed/);
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text')).toHaveCSS('animation-name', 'hero-text-enter');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(heading).not.toHaveClass(/is-revealed/);
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text')).toHaveCSS('animation-name', 'hero-text-enter');
});
