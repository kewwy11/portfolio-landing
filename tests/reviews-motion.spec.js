import { test, expect } from './browser-test.js';

const expectSettled = async (element) => {
  const lines = element.locator('.heading-text');
  const targets = await lines.count() ? await lines.all() : [element];
  for (const target of targets) {
    await expect(target).toHaveCSS('opacity', '1');
    await expect.poll(() => target.evaluate(node => {
    const transform = getComputedStyle(node).transform;
    return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
    })).toBe(0);
  }
  if (!await lines.count()) await expect(element).toHaveCSS('clip-path', /^(none|inset\(0(?:px|%)?(?: 0(?:px|%)?){0,3}\))$/);
};

test('reviews reveal when scrolled into view and stay revealed after leaving', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 930 });
  await page.goto('/');
  const heading = page.locator('#proof-heading');
  const cards = page.locator('.testimonial');
  expect(await cards.count()).toBeGreaterThan(0);
  expect(await cards.first().evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThan(930);
  await expect(cards.first()).not.toHaveClass(/is-revealed/);
  await expect(cards.first()).toHaveCSS('clip-path', 'inset(100% 0px 0px)');

  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveClass(/is-revealed/);
  await expectSettled(heading);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-revealed/);
    await expectSettled(card);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(cards.first()).toHaveClass(/is-revealed/);
  await cards.first().scrollIntoViewIfNeeded();
  await expectSettled(cards.first());
  expect(await cards.first().evaluate(node => node.getAnimations().filter(animation =>
    animation.playState === 'running').length)).toBe(0);
});

test('review attribution keeps the name and position 10px apart', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 930 });
    await page.locator('.testimonial').first().scrollIntoViewIfNeeded();
    const gaps = await page.locator('.testimonial figcaption').evaluateAll(captions => captions.map(caption => {
      const name = caption.querySelector('strong');
      const role = name.nextElementSibling;
      return role.getBoundingClientRect().top - name.getBoundingClientRect().bottom;
    }));
    for (const gap of gaps) expect(gap).toBeCloseTo(10, 0);
  }
});

test('reduced motion reveals offscreen reviews immediately and responds to preference changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 930 });
  await page.goto('/');
  const cards = page.locator('.testimonial');
  await expect(cards.first()).not.toHaveClass(/is-revealed/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const card of await cards.all()) {
    await expect(card).toHaveClass(/is-revealed/);
    await expectSettled(card);
    expect(await card.evaluate(node => node.getAnimations().length)).toBe(0);
  }
  await page.reload();
  for (const card of await cards.all()) {
    await expect(card).toHaveClass(/is-revealed/);
    await expectSettled(card);
  }
});

test('reviews remain visible when IntersectionObserver is unavailable', async ({ page }) => {
  await page.addInitScript(() => { delete window.IntersectionObserver; });
  await page.goto('/');
  for (const card of await page.locator('.testimonial').all()) {
    await expect(card).toHaveClass(/is-revealed/);
    await expectSettled(card);
  }
});
