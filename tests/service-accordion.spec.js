import { test, expect } from '@playwright/test';

const openService = async (card) => {
  const button = card.locator('.service-toggle');
  if (await button.getAttribute('aria-expanded') === 'false') {
    await button.evaluate(element => element.click());
  }
};

const panelHeight = async (panel) => panel.evaluate(element => element.getBoundingClientRect().height);

test('five services expose the Figma content and keep only one keyboard-controlled panel open', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cards = page.locator('.service-accordion');
  await expect(cards).toHaveCount(5);
  const expectations = [
    { name: /strategy/i, title: /creative direction/i, milestone: /competitor research/i, paragraphs: 2 },
    { name: /branding/i, title: /brand & visual identity/i, milestone: /brand guidelines/i, paragraphs: 2 },
    { name: /product design/i, title: /websites, apps & dashboards/i, milestone: /prototype/i, paragraphs: 3 },
    { name: /development/i, title: /from design to live product/i, milestone: /hand-off documentation/i, paragraphs: 2 },
    { name: /graphics/i, title: /posters & personal work/i, milestone: /photography exploration/i, paragraphs: 2 },
  ];

  for (let index = 0; index < expectations.length; index += 1) {
    const card = cards.nth(index);
    const item = expectations[index];
    const button = card.getByRole('button', { name: item.name });
    const panel = card.locator('.service-panel');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(await panel.evaluate(element => element.inert)).toBe(true);
    expect(await panelHeight(panel)).toBe(0);
    expect(await button.getAttribute('aria-controls')).toBe(await panel.getAttribute('id'));

    await button.focus();
    await button.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.service-toggle[aria-expanded="true"]')).toHaveCount(1);
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect(card.getByRole('heading', { name: item.title })).toBeVisible();
    await expect(card.locator('.service-paragraphs p')).toHaveCount(item.paragraphs);
    await expect(card.locator('.service-milestones li')).toHaveCount(4);
    await expect(card.locator('.service-milestones li').filter({ hasText: item.milestone })).toBeVisible();
    if (index > 0) {
      const previous = cards.nth(index - 1);
      await expect(previous.locator('button')).toHaveAttribute('aria-expanded', 'false');
      await expect(previous.locator('.service-panel')).toHaveAttribute('aria-hidden', 'true');
      expect(await previous.locator('.service-panel').evaluate(element => element.inert)).toBe(true);
      expect(await panelHeight(previous.locator('.service-panel'))).toBe(0);
    }
  }

  await cards.last().locator('button').press('Space');
  await expect(cards.last().locator('button')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.service-toggle[aria-expanded="true"]')).toHaveCount(0);
  await expect(cards.last().locator('.service-panel')).toHaveCSS('visibility', 'hidden');
});

test('rollout and closing interpolate height and recover from rapid reversals', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator('.service-accordion').first();
  await card.scrollIntoViewIfNeeded();

  const sampleTransition = (opening) => card.evaluate(async (element, isOpening) => {
    const panel = element.querySelector('.service-panel');
    element.querySelector('button').click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const transition = panel.getAnimations().find(animation => animation.transitionProperty === 'grid-template-rows');
    if (!transition) throw new Error(`Missing ${isOpening ? 'opening' : 'closing'} rollout transition`);
    transition.pause();
    const duration = transition.effect.getComputedTiming().duration;
    const heights = [];
    for (const fraction of [0, .35, 1]) {
      transition.currentTime = duration * fraction;
      heights.push(panel.getBoundingClientRect().height);
    }
    const easing = transition.effect.getTiming().easing;
    transition.finish();
    return { duration, easing, heights };
  }, opening);

  const opening = await sampleTransition(true);
  expect(opening.duration).toBe(450);
  expect(opening.easing).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  expect(opening.heights[0]).toBe(0);
  expect(opening.heights[1]).toBeGreaterThan(0);
  expect(opening.heights[1]).toBeLessThan(opening.heights[2]);
  expect(opening.heights[2]).toBeGreaterThan(250);
  await expect(card.locator('h3')).toHaveClass(/is-revealed/);

  const closing = await sampleTransition(false);
  expect(closing.heights[0]).toBeGreaterThan(closing.heights[1]);
  expect(closing.heights[1]).toBeGreaterThan(0);
  expect(closing.heights[2]).toBe(0);
  await expect(card.locator('button')).toHaveAttribute('aria-expanded', 'false');

  await card.evaluate(async element => {
    const button = element.querySelector('button');
    button.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    button.click();
    await new Promise(resolve => setTimeout(resolve, 80));
    button.click();
  });
  await expect(card.locator('button')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => card.evaluate(element => {
    const panel = element.querySelector('.service-panel');
    const content = element.querySelector('.service-content');
    return Math.abs(panel.getBoundingClientRect().height - content.getBoundingClientRect().height);
  })).toBeLessThan(.5);
  await card.locator('button').evaluate(element => element.click());
  await expect.poll(() => panelHeight(card.locator('.service-panel'))).toBe(0);
});

test('expanded cards match desktop dimensions and resize without clipped content or overflow', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const cards = page.locator('.service-accordion');
  await openService(cards.first());
  const geometry = await cards.first().evaluate(element => {
    const visual = element.querySelector('.service-visual').getBoundingClientRect();
    const copy = element.querySelector('.service-content-copy').getBoundingClientRect();
    const milestones = [...element.querySelectorAll('.service-milestones li')].map(item => item.getBoundingClientRect());
    return { width: element.getBoundingClientRect().width, visualWidth: visual.width,
      visualHeight: visual.height, copyWidth: copy.width, gap: copy.left - visual.right,
      milestoneHeight: milestones[0].height, milestoneSpacing: milestones[1].top - milestones[0].top };
  });
  expect(geometry.width).toBe(1280);
  expect(geometry.visualWidth).toBe(269);
  expect(geometry.visualHeight).toBe(249);
  expect(geometry.copyWidth).toBe(508);
  expect(geometry.gap).toBe(48);
  expect(geometry.milestoneHeight).toBeCloseTo(12, 0);
  expect(geometry.milestoneSpacing).toBeCloseTo(28, 0);
  await expect(cards.first().locator('h3')).toHaveCSS('font-size', '40px');
  await expect(cards.first().locator('h3')).toHaveCSS('line-height', '44px');
  await expect(cards.nth(2).locator('.service-paragraphs p').nth(1)).toHaveCSS('white-space', 'pre-line');
  await cards.first().screenshot({ path: testInfo.outputPath('service-final-desktop.png') });
  await page.locator('#services').screenshot({ path: testInfo.outputPath('services-final-desktop.png') });

  for (const width of [1280, 1200, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 930 });
    for (const card of await cards.all()) {
      await openService(card);
      await expect(page.locator('.service-toggle[aria-expanded="true"]')).toHaveCount(1);
      const measurement = await card.evaluate(element => {
      const card = element.getBoundingClientRect();
      const panel = element.querySelector('.service-panel').getBoundingClientRect();
      const clip = element.querySelector('.service-panel-clip').getBoundingClientRect();
      const content = element.querySelector('.service-content').getBoundingClientRect();
      const paragraphs = [...element.querySelectorAll('.service-paragraphs p')];
      const list = element.querySelector('.service-milestones ul').getBoundingClientRect();
      return { panelHeight: panel.height, contentHeight: content.height,
        lowestCopy: Math.max(...paragraphs.map(paragraph => paragraph.getBoundingClientRect().bottom), list.bottom),
        clipBottom: clip.bottom, innerOverflow: element.scrollWidth - element.clientWidth,
        listRight: list.right, cardRight: card.right };
      });
      expect(Math.abs(measurement.panelHeight - measurement.contentHeight)).toBeLessThan(.5);
      expect(measurement.lowestCopy).toBeLessThanOrEqual(measurement.clipBottom);
      expect(measurement.innerOverflow).toBe(0);
      expect(measurement.listRight).toBeLessThanOrEqual(measurement.cardRight);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    if (width === 390) {
      await openService(cards.first());
      await cards.first().screenshot({ path: testInfo.outputPath('service-final-mobile.png') });
    }
  }
});

test('plus morphs into minus and rapid service switching preserves a single open panel', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const cards = page.locator('.service-accordion');
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();

  const sampleIcon = () => card.evaluate(async element => {
    const vertical = element.querySelector('.service-icon-vertical');
    const horizontal = element.querySelector('.service-icon-horizontal');
    element.querySelector('button').click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const animations = vertical.getAnimations();
    const transform = animations.find(animation => animation.transitionProperty === 'transform');
    const opacity = animations.find(animation => animation.transitionProperty === 'opacity');
    if (!transform || !opacity) throw new Error('Missing plus-to-minus transition');
    animations.forEach(animation => animation.pause());
    const duration = transform.effect.getComputedTiming().duration;
    const samples = [0, .35, 1].map(fraction => {
      animations.forEach(animation => { animation.currentTime = duration * fraction; });
      const style = getComputedStyle(vertical);
      const horizontalBox = horizontal.getBoundingClientRect();
      return { scale: new DOMMatrixReadOnly(style.transform).m22, opacity: Number(style.opacity),
        horizontalWidth: horizontalBox.width, horizontalHeight: horizontalBox.height };
    });
    animations.forEach(animation => animation.finish());
    return { duration, samples };
  });

  const opening = await sampleIcon();
  expect(opening.duration).toBe(450);
  expect(opening.samples[0].scale).toBe(1);
  expect(opening.samples[1].scale).toBeGreaterThan(0);
  expect(opening.samples[1].scale).toBeLessThan(1);
  expect(opening.samples[1].opacity).toBeGreaterThan(0);
  expect(opening.samples[1].opacity).toBeLessThan(1);
  expect(opening.samples[2].scale).toBe(0);
  expect(opening.samples[2].opacity).toBe(0);
  for (const sample of opening.samples) {
    expect(sample.horizontalWidth).toBe(12);
    expect(sample.horizontalHeight).toBe(2);
  }
  const closing = await sampleIcon();
  expect(closing.samples[0].scale).toBe(0);
  expect(closing.samples[1].scale).toBeGreaterThan(0);
  expect(closing.samples[1].scale).toBeLessThan(1);
  expect(closing.samples[2].scale).toBe(1);
  expect(closing.samples[2].opacity).toBe(1);

  const expandedCounts = await page.locator('.service-list').evaluate(async element => {
    const buttons = [...element.querySelectorAll('.service-toggle')];
    const counts = [];
    for (const index of [0, 1, 2, 1]) {
      buttons[index].click();
      await new Promise(resolve => requestAnimationFrame(resolve));
      counts.push(buttons.filter(button => button.getAttribute('aria-expanded') === 'true').length);
      await new Promise(resolve => setTimeout(resolve, 70));
    }
    return counts;
  });
  expect(expandedCounts).toEqual([1, 1, 1, 1]);
  await expect(cards.nth(1).locator('button')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => cards.evaluateAll(elements => elements.filter(element =>
    element.querySelector('button').getAttribute('aria-expanded') === 'false').map(element =>
    element.querySelector('.service-panel').getBoundingClientRect().height))).toEqual([0, 0, 0, 0]);
  await expect(cards.nth(1).locator('.service-icon-vertical')).toHaveCSS('opacity', '0');
});

test('changing to reduced motion completes rollout immediately and removes closing motion', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.service-accordion').first();
  await card.scrollIntoViewIfNeeded();
  await card.locator('button').evaluate(element => element.click());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card.locator('.service-panel')).toHaveCSS('transition-duration', '0s');
  await expect.poll(() => card.evaluate(element => {
    const panel = element.querySelector('.service-panel');
    const content = element.querySelector('.service-content');
    return Math.abs(panel.getBoundingClientRect().height - content.getBoundingClientRect().height);
  })).toBeLessThan(.5);
  expect(await card.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  await card.locator('button').evaluate(element => element.click());
  await expect(card.locator('.service-panel')).toHaveCSS('visibility', 'hidden');
  expect(await panelHeight(card.locator('.service-panel'))).toBe(0);
  expect(await card.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});
