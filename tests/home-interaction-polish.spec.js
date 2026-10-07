import { test, expect } from './browser-test.js';

test('the stretched toggle keeps its position when a click reverses its travel', async ({ page }) => {
  await page.goto('/');
  const filter = page.locator('.filters');
  await filter.scrollIntoViewIfNeeded();
  const motion = await filter.evaluate(async node => {
    const indicator = node.querySelector('.filter-indicator');
    const [ui, brand] = node.querySelectorAll('button');
    const box = () => {
      const { x, width } = indicator.getBoundingClientRect();
      return { x, width };
    };
    const nextPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const initial = box();
    brand.click();
    await nextPaint();
    await new Promise(resolve => setTimeout(resolve, 160));
    const stretched = box();
    ui.click();
    await nextPaint();

    const reversedStart = box();
    await new Promise(resolve => setTimeout(resolve, 650));
    return { initial, stretched, reversedStart, settled: box() };
  });
  expect(motion.stretched.width).toBeGreaterThan(motion.initial.width * 1.15);
  expect(motion.stretched.x).toBeGreaterThan(motion.initial.x + 10);
  expect(Math.abs(motion.reversedStart.x - motion.stretched.x)).toBeLessThan(35);
  expect(motion.reversedStart.width).toBeGreaterThan(motion.initial.width * 1.1);
  expect(motion.settled.x).toBeCloseTo(motion.initial.x, 1);
  expect(motion.settled.width).toBeCloseTo(motion.initial.width, 1);
});

test('footer labels and service numbers roll on hover and all supplied social links are active', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.footer');
  await footer.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  const links = footer.locator('.footer-links a');
  await expect(links).toHaveCount(10);
  for (const link of await links.all()) {
    await link.hover();
    await expect(link.locator('.rolling-number')).toHaveCount(0);
    const label = link.locator('.footer-link-window');
    await expect.poll(() => label.evaluate(node => {
      const y = new DOMMatrixReadOnly(getComputedStyle(node.firstElementChild).transform).m42;
      return Math.abs(y + node.getBoundingClientRect().height);
    })).toBeLessThan(.1);
  }
  await footer.locator('.location').hover();
  await expect(links.last().locator('.footer-link-track')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await links.first().focus();
  await expect.poll(() => links.first().locator('.footer-link-track').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42)).toBeLessThan(-1);
  await links.first().evaluate(node => node.blur());
  const expected = {
    'X(Twitter)': 'https://x.com/des1gn_princess',
    LinkedIn: 'https://www.linkedin.com/in/grateful-erhis-343a9629a/?isSelfProfile=true',
    Instagram: 'https://www.instagram.com/erhisgrateful/',
    Pinterest: 'https://www.pinterest.com/Designgirlyyy/',
    Behance: 'https://www.behance.net/gratefulerhisoh',
  };
  for (const [label, url] of Object.entries(expected)) {
    await expect(footer.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', url);
  }
  const service = page.locator('.service-toggle').first();
  await service.hover();
  await expect(service.locator('.number-track')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -24)');
  await service.focus();
  await page.mouse.move(0, 0);
  await expect(service.locator('.number-track')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -24)');
  await service.evaluate(node => node.blur());
  await expect(service.locator('.number-track')).toHaveCSS('transform', 'none');
});

test('testimonial cards never start their reveal before their profile image is ready', async ({ page }) => {
  let release;
  await page.route('**/assets/home/review-samuel.png', async route => {
    await new Promise(resolve => { release = resolve; });
    await route.continue();
  });
  await page.addInitScript(() => {
    window.reviewImageSamples = [];
    new MutationObserver(records => {
      for (const { target } of records) {
        if (!target.matches?.('.testimonial.is-revealed')) continue;
        const image = target.querySelector('.review-avatar img');
        window.reviewImageSamples.push(image.complete && image.naturalWidth > 0 && target.dataset.imageReady === 'true');
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => typeof release).toBe('function');
  const card = page.locator('.testimonial').nth(1);
  await card.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(card).not.toHaveClass(/is-revealed/);
  await expect(card).toHaveAttribute('data-image-ready', 'false');
  release();
  await expect(card).toHaveClass(/is-revealed/);
  await expect(card).toHaveAttribute('data-image-ready', 'true');
  expect(await page.evaluate(() => reviewImageSamples.length > 0 && reviewImageSamples.every(Boolean))).toBe(true);
});

test('Lumis and Piggyvest have equal responsive heights and use compact hover images', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const lumis = await page.locator('[data-project="lumis"] .project-image').boundingBox();
    const piggyvest = await page.locator('[data-project="piggyvest"] .project-image').boundingBox();
    expect(piggyvest.height).toBeCloseTo(lumis.height, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  for (const image of await page.locator('.project-hover-image').all()) {
    await expect(image).toHaveAttribute('src', /\.jpg$/);
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    const response = await page.request.head(await image.getAttribute('src'));
    expect(Number(response.headers()['content-length'])).toBeLessThan(1000000);
  }
});
