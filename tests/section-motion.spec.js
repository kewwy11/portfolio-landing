import { test, expect } from '@playwright/test';

test('section headings wait for the viewport and replay the hero text reveal on each entry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 930 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const heading of await page.locator('main h2:not(#contact-heading), main h3, footer h3, .footer-heading').all()) {
    await expect(heading).toHaveClass(/scroll-heading/);
  }
  await expect(page.locator('.scroll-heading.is-revealed')).toHaveCount(0);
  expect(await page.locator('.scroll-heading').evaluateAll(elements => elements.every(element =>
    element.getAnimations({ subtree: true }).length === 0))).toBe(true);
  await page.reload();
  await expect(page.locator('.scroll-heading.is-revealed')).toHaveCount(0);
  const heading = page.locator('#projects-heading');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveClass(/is-revealed/);
  const timing = await heading.locator('.heading-text').evaluate(element => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    const hero = document.querySelector('.hero-text').getAnimations()[0].effect.getTiming();
    const local = animation.effect.getTiming();
    return { duration: local.duration, easing: local.easing, delay: local.delay,
      heroDuration: hero.duration, heroEasing: hero.easing };
  });
  expect(timing.duration).toBe(timing.heroDuration);
  expect(timing.easing).toBe(timing.heroEasing);
  expect(timing.delay).toBe(0);
  await expect(heading.locator('.heading-text')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 32)');
  await heading.locator('.heading-text').evaluate(element => element.getAnimations()[0].finish());

  await heading.evaluate(element => {
    const box = element.getBoundingClientRect();
    scrollTo({ top: scrollY + box.bottom - 2, behavior: 'instant' });
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await heading.evaluate(element => element.getBoundingClientRect().bottom)).toBeCloseTo(2, 0);
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text')).toHaveCSS('opacity', '1');

  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(heading).not.toHaveClass(/is-revealed/);
  expect(await heading.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveClass(/is-revealed/);
  expect(await heading.evaluate(element => element.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(1);
  await heading.locator('.heading-text').evaluate(element => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
  });
  await expect(heading.locator('.heading-text')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 32)');

  const services = page.locator('#services-heading');
  await services.scrollIntoViewIfNeeded();
  await expect(services).toHaveClass(/is-revealed/);
  const multiline = await services.evaluate(element => {
    const animations = element.getAnimations({ subtree: true });
    const delays = animations.map(animation => animation.effect.getTiming().delay);
    animations.forEach(animation => animation.finish());
    const lines = [...element.querySelectorAll('.heading-text')].map(line => line.getBoundingClientRect());
    return { delays, baselineDistance: lines[1].top - lines[0].top, lineHeight: parseFloat(getComputedStyle(element).lineHeight) };
  });
  expect(multiline.delays).toEqual([0, 200]);
  expect(multiline.baselineDistance).toBeCloseTo(multiline.lineHeight, 0);
});

test('headings stay revealed while partly visible, then reset only after leaving the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('#services-heading');
  await heading.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  await heading.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.finish()));

  await heading.evaluate(element => {
    const box = element.getBoundingClientRect();
    scrollTo({ top: scrollY + box.top - innerHeight + 2, behavior: 'instant' });
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await heading.evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(498, 0);
  await expect(heading).toHaveClass(/is-revealed/);
  await heading.evaluate(element => {
    const box = element.getBoundingClientRect();
    scrollTo({ top: scrollY + box.top - innerHeight - 2, behavior: 'instant' });
  });
  await expect(heading).not.toHaveClass(/is-revealed/);
  await heading.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  expect(await heading.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(2);
});

test('service content headings replay after their panel closes and opens again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 930 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const service = page.locator('.service-accordion').first();
  const toggle = service.locator('.service-toggle');
  const heading = service.locator('.service-content-title');
  await toggle.scrollIntoViewIfNeeded();
  await expect(heading).not.toHaveClass(/is-revealed/);
  await toggle.click();
  await expect(heading).toHaveClass(/is-revealed/);
  await heading.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(heading).not.toHaveClass(/is-revealed/);
  await toggle.click();
  await expect(heading).toHaveClass(/is-revealed/);
  expect(await heading.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(2);
});

test('review cards unveil upward through a mask without moving the card', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.testimonial').first();
  await expect(card).not.toHaveClass(/is-revealed/);
  await expect(card).toHaveCSS('clip-path', 'inset(100% 0px 0px)');
  await page.locator('.testimonial-slot').first().scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-revealed/);
  const samples = await card.evaluate(element => {
    const animation = element.getAnimations()[0];
    animation.pause();
    const duration = animation.effect.getTiming().duration;
    return [0, duration / 2, duration].map(time => {
      animation.currentTime = time;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return { mask: parseFloat(style.clipPath.match(/inset\(([^ ]+)/)[1]),
        y: box.y, height: box.height, transform: style.transform };
    });
  });
  expect(samples[0].mask).toBe(100);
  expect(samples[1].mask).toBeGreaterThan(0);
  expect(samples[1].mask).toBeLessThan(100);
  expect(samples[2].mask).toBe(0);
  for (const sample of samples) {
    expect(sample.transform).toBe('none');
    expect(sample.y).toBe(samples[0].y);
    expect(sample.height).toBe(samples[0].height);
  }
  await page.screenshot({ path: 'test-results/reviews-unveiled.png' });
});

test('mobile reviews wait for each card to enter view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/');
  const cards = page.locator('.testimonial');
  await page.locator('.testimonial-slot').first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveClass(/is-revealed/);
  expect(await cards.last().evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThan(600);
  await expect(cards.last()).not.toHaveClass(/is-revealed/);
  await page.locator('.testimonial-slot').last().scrollIntoViewIfNeeded();
  await expect(cards.last()).toHaveClass(/is-revealed/);
  await expect(cards.last()).toHaveCSS('animation-delay', '0s');
});

test('reduced motion shows all headings and review cards immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const line of await page.locator('.heading-text').all()) {
    await expect(line).toHaveCSS('opacity', '1');
    await expect(line).toHaveCSS('transform', 'none');
    expect(await line.evaluate(element => element.getAnimations().length)).toBe(0);
  }
  for (const card of await page.locator('.testimonial').all()) await expect(card).toHaveCSS('clip-path', 'none');
});
