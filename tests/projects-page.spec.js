import { test, expect } from './browser-test.js';

const uiProjects = [
  { name: 'The French Cake Company', tags: ['Responsive', 'Landing page'], video: '/assets/videos/french-cake-project.mp4' },
  { name: 'Lumis Dermatologists', tags: ['Web', 'Dashboard'], image: 'home/project-lumis.jpg' },
  { name: 'Piggyvest', tags: ['App', 'Mobile', 'Dashboard'], image: 'home/project-piggyvest.jpg' },
  { name: 'Coming soon', tags: [], image: 'home/project-coming-soon.jpg' },
];
const brandProjects = [
  { name: 'Lumis', tags: ['Brand Identity & Strategy', 'Visual Direction'], video: '/assets/videos/lumis-brand-reel.mp4' },
  { name: 'Beacon Trust', tags: ['Brand Identity', 'Visual Direction'], video: '/assets/videos/beacon-cover.mp4' },
];
const piggyvestCaseStudy = 'https://www.behance.net/gallery/231953873/Piggyvest-Case-Study';

test('Piggyvest image and title open the Behance case study from both galleries', async ({ page }) => {
  for (const route of ['/', '/projects']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const card = page.locator('[data-project="piggyvest"]');
    await expect(card.locator('.project-image')).toHaveAttribute('href', piggyvestCaseStudy);
    await expect(card.locator('.project-caption h3 a')).toHaveAttribute('href', piggyvestCaseStudy);
    await expect(card.locator('.project-image')).toHaveAttribute('target', '_blank');
  }
});

async function expectGallery(page, category) {
  const expected = category === 'Branding' ? brandProjects : uiProjects;
  const cards = page.locator('.project-grid .project');
  await expect(cards).toHaveCount(expected.length);
  await expect(page.getByRole('button', { name: category, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: category === 'Branding' ? 'UI/UX' : 'Branding', exact: true })).toHaveAttribute('aria-pressed', 'false');
  for (let index = 0; index < expected.length; index++) {
    const card = cards.nth(index);
    await expect(card.locator('.project-caption h3')).toHaveText(expected[index].name);
    await expect(card.locator('.tags li')).toHaveText(expected[index].tags);
    if (expected[index].image) {
      const image = card.locator('.project-image img:not(.project-hover-image)');
      await expect(image).toHaveAttribute('src', new RegExp('/assets/' + expected[index].image.replaceAll('.', '\\.') + '$'));
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0), {
        message: `Load ${expected[index].image}`,
      }).toBe(true);
      await expect(image).toHaveAttribute('alt', /\S/);
    } else if (expected[index].video) {
      await expect(card.locator('video')).toHaveAttribute('src', expected[index].video);
    } else {
      await expect(card.locator('.project-placeholder')).toHaveCount(1);
    }
  }
  await expect(page.locator('.empty-projects')).toHaveCount(0);
}

test('Projects matches the desktop layout and includes both populated project categories and the shared footer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/projects');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveTitle('Projects — Grateful Erhis');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('My projects');
  await expect(page.locator('.projects-page')).toHaveCount(1);
  await expect(page.locator('main#projects')).toHaveCount(1);
  await expect(page.locator('.header')).toHaveCount(1);
  await expect(page.locator('.footer')).toHaveCount(1);
  await expect(page.locator('.contact, .hero, .about-page')).toHaveCount(0);
  await expectGallery(page, 'UI/UX');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('#projects-page-heading')).toHaveCSS('font-size', '96px');
  const geometry = await page.evaluate(() => {
    const box = selector => {
      const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect();
      return { x, y: y + scrollY, width, height };
    };
    const images = [...document.querySelectorAll('.project-image')].map(image => {
      const { x, y, width, height } = image.getBoundingClientRect();
      return { x, y: y + scrollY, width, height };
    });
    return { contentWidth: document.documentElement.clientWidth, wordmark: box('.wordmark'), heading: box('#projects-page-heading'), images,
      gridEnd: box('.project-grid').y + box('.project-grid').height, footer: box('.footer') };
  });
  expect(geometry.wordmark.x).toBeCloseTo(40, 1);
  expect(geometry.wordmark.y).toBeCloseTo(32, 1);
  expect(geometry.wordmark.height).toBeCloseTo(22, 1);
  expect(geometry.heading.y).toBeCloseTo(118, 1);
  expect(geometry.heading.height).toBeCloseTo(106, 1);
  const cardWidth = (geometry.contentWidth - 100) / 2;
  expect(geometry.images[0].x).toBe(40);
  expect(geometry.images[0].y).toBe(272);
  expect(geometry.images[0].width).toBeCloseTo(cardWidth, 1);
  expect(geometry.images[0].height).toBeCloseTo(cardWidth * 500 / 670, 1);
  expect(geometry.images[1].x).toBeCloseTo(60 + cardWidth, 1);
  expect(geometry.images[1].width).toBeCloseTo(cardWidth, 1);
  expect(geometry.images[2].height).toBeCloseTo(cardWidth * 500 / 670, 1);
  expect(geometry.images[2].y).toBeGreaterThan(geometry.images[0].y + geometry.images[0].height);
  expect(geometry.footer.y - geometry.gridEnd).toBeCloseTo(96, 1);
  await page.getByRole('button', { name: 'Branding', exact: true }).click();
  await expectGallery(page, 'Branding');
  const brandSizes = await page.locator('.project-image').evaluateAll(images => images.map(image => {
    const box = image.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  for (const [index, height] of [500, 500].entries()) {
    expect(brandSizes[index].width).toBeCloseTo(cardWidth, 1);
    expect(brandSizes[index].height).toBeCloseTo(cardWidth * height / 670, 1);
  }
  expect(errors).toEqual([]);
});

test('project filters work by keyboard on the home page and Projects page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/projects']) {
    await page.goto(route);
    await expectGallery(page, 'UI/UX');
    await page.getByRole('button', { name: 'Branding', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expectGallery(page, 'Branding');
    await page.getByRole('button', { name: 'UI/UX', exact: true }).focus();
    await page.keyboard.press('Space');
    await expectGallery(page, 'UI/UX');
  }
});

test('Projects supports direct reload, a trailing slash, local links, and cross-page navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/');
  await page.reload();
  await expect(page).toHaveTitle('Projects — Grateful Erhis');
  await expect(page.getByRole('heading', { name: 'My projects', exact: true })).toBeVisible();
  const footer = page.getByRole('navigation', { name: 'Footer navigation' });
  await expect(footer.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('href', '#projects');
  await expect(footer.getByRole('link', { name: 'Resume', exact: true })).toHaveAttribute('href', '/resume');
  await expect(footer.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/#home');
  await expect(footer.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute('href', '/#services');
  await expect(footer.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/contact');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const menu = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(menu.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('href', '#projects');
  await expect(menu.getByRole('link', { name: 'Resume', exact: true })).toHaveAttribute('href', '/resume');
  await expect(menu.getByRole('link', { name: 'Let’s Talk', exact: true })).toHaveAttribute('href', '/contact');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Branding', exact: true }).click();
  await footer.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/#projects$/);
  await expect(page.getByRole('button', { name: 'Branding', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#projects-page-heading')).toBeInViewport();
  await page.reload();
  await expect(page.locator('#projects-page-heading')).toBeInViewport();
  await expectGallery(page, 'UI/UX');
  await footer.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL(/\/#home$/);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('.projects-page')).toBeVisible();
  await footer.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByLabel('Email Address')).toBeInViewport();
  await footer.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await footer.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL(/\/#home$/);
  await expect(page.locator('.hero')).toBeInViewport();
});

test('both project categories fit tablet and narrow screens without clipping captions or tags', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/projects');
    await page.evaluate(() => document.fonts.ready);
    for (const category of ['UI/UX', 'Branding']) {
      await page.getByRole('button', { name: category, exact: true }).click();
      await expectGallery(page, category);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const bounds = await page.locator('.project').evaluateAll(cards => cards.map(card => {
        const cardBox = card.getBoundingClientRect();
        const imageBox = card.querySelector('.project-image').getBoundingClientRect();
        const caption = card.querySelector('.project-caption');
        const children = [...caption.querySelectorAll('h3, li')];
        return { x: cardBox.x, right: cardBox.right, imageTop: imageBox.top + scrollY,
          imageWidth: imageBox.width, imageHeight: imageBox.height,
          captionFits: caption.scrollWidth <= caption.clientWidth && children.every(child => {
            const box = child.getBoundingClientRect();
            return box.left >= cardBox.left - 1 && box.right <= cardBox.right + 1;
          }) };
      }));
      for (const bound of bounds) {
        expect(bound.x).toBeGreaterThanOrEqual(0);
        expect(bound.right).toBeLessThanOrEqual(width);
        expect(bound.imageWidth).toBeGreaterThan(100);
        expect(bound.imageHeight).toBeGreaterThan(100);
        expect(bound.captionFits).toBe(true);
      }
      if (width <= 760) {
        await expect(page.locator('.project-grid')).toHaveCSS('row-gap', '20px');
        expect(bounds[0].x).toBe(bounds[1].x);
        expect(bounds[1].imageTop).toBeGreaterThan(bounds[0].imageTop + bounds[0].imageHeight);
      } else {
        expect(bounds[0].imageTop).toBe(bounds[1].imageTop);
        expect(bounds[1].x).toBeGreaterThan(bounds[0].x);
      }
    }
    await expect(page.locator('.footer')).toHaveCount(1);
    const footerGap = await page.evaluate(() => {
      const footer = document.querySelector('.footer').getBoundingClientRect();
      const gallery = document.querySelector('.project-grid').getBoundingClientRect();
      return footer.top - gallery.bottom;
    });
    expect(footerGap).toBeCloseTo(width <= 760 ? 64 : 96, 1);
  }
});

test('Projects headings replay their text reveal when they return into view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects');
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('#projects-page-heading');
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text')).toHaveCSS('animation-name', 'hero-text-enter');
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await expect(heading).not.toHaveClass(/is-revealed/);
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text')).toHaveCSS('animation-name', 'hero-text-enter');
});
