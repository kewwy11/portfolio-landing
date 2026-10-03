import { test, expect } from '@playwright/test';

async function openAbout(page, hash = '') {
  await page.goto(`/about${hash}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.story-flow-stage')).toHaveCount(3);
}

async function pinnedGeometry(page) {
  return page.locator('#about-story').evaluate(section => {
    const frame = section.querySelector('.story-sticky');
    const box = section.getBoundingClientRect();
    const frameBox = frame.getBoundingClientRect();
    const inset = parseFloat(getComputedStyle(frame).top);
    const range = box.height - frameBox.height;
    return { start: box.top + scrollY - inset, range, inset, height: frameBox.height };
  });
}

async function scrollProgress(page, progress) {
  const { start, range } = await pinnedGeometry(page);
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), start + range * progress);
  await expect.poll(async () => Number(await page.locator('#about-story').getAttribute('data-progress'))).toBeCloseTo(progress, 2);
}

async function scene(page) {
  return page.locator('#about-story').evaluate(section => {
    const rectangle = node => {
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const track = section.querySelector('.story-text-track');
    return {
      progress: Number(section.dataset.progress),
      stage: section.dataset.stage,
      frame: rectangle(section.querySelector('.story-sticky')),
      copyHeight: section.querySelector('.story-text-panel').getBoundingClientRect().height,
      textY: new DOMMatrixReadOnly(getComputedStyle(track).transform).m42,
      images: [...section.querySelectorAll('.story-visual-image')].map(image => {
        const style = getComputedStyle(image);
        return { box: rectangle(image), transform: style.transform,
          mask: style.clipPath === 'none' ? 0 : parseFloat(style.clipPath.match(/inset\(([^ ]+)/)?.[1]) };
      }),
      animations: section.getAnimations({ subtree: true }).filter(animation => animation.id.startsWith('about-story-'))
        .map(animation => ({ id: animation.id, time: animation.currentTime, state: animation.playState })),
    };
  });
}

test('the story pins all three pairs, rolls text vertically, and unveils stationary images upward', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openAbout(page);
  const section = page.locator('#about-story');
  await expect(section).toHaveAttribute('data-mode', 'pinned');
  await expect(page.locator('.story-sticky')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.story-visual-image')).toHaveCount(3);
  await expect(section.getByRole('img')).toHaveCount(3);
  const geometry = await pinnedGeometry(page);
  expect(geometry.height).toBeCloseTo(668, 1);
  expect(geometry.inset).toBe(166);
  expect(geometry.range).toBeCloseTo(2000, 1);
  await scrollProgress(page, 0.05);
  const first = await scene(page);
  expect(first.stage).toBe('1');
  expect(first.textY).toBeCloseTo(0, 1);
  expect(first.frame.y).toBeCloseTo(geometry.inset, 1);
  expect(first.images[0].box).toMatchObject({ x: 40, width: 670, height: 588 });
  expect(first.images.slice(1).map(image => image.mask)).toEqual([100, 100]);

  await scrollProgress(page, 0.25);
  const unveiling = await scene(page);
  expect(unveiling.textY).toBeLessThan(0);
  expect(unveiling.textY).toBeGreaterThan(-unveiling.copyHeight);
  expect(unveiling.images[1].mask).toBeGreaterThan(0);
  expect(unveiling.images[1].mask).toBeLessThan(100);
  expect(unveiling.images[2].mask).toBe(100);
  expect(unveiling.frame).toEqual(first.frame);
  for (let index = 0; index < 3; index++) {
    expect(unveiling.images[index].box).toEqual(first.images[index].box);
    expect(unveiling.images[index].transform).toBe('none');
  }
  expect(unveiling.animations.map(animation => animation.id).sort())
    .toEqual(['about-story-image-2', 'about-story-image-3', 'about-story-text']);
  for (const animation of unveiling.animations) {
    expect(animation.state).toBe('paused');
    expect(animation.time).toBeCloseTo(250, 0);
  }
  await page.screenshot({ path: '.tools/about-story-unveiling.png' });

  await scrollProgress(page, 0.5);
  const second = await scene(page);
  expect(second.stage).toBe('2');
  expect(second.textY).toBeCloseTo(-second.copyHeight, 1);
  expect(second.images[1].mask).toBe(0);
  expect(second.images[2].mask).toBe(100);
  expect(second.frame).toEqual(first.frame);

  await scrollProgress(page, 0.75);
  const finalReveal = await scene(page);
  expect(finalReveal.textY).toBeLessThan(-finalReveal.copyHeight);
  expect(finalReveal.textY).toBeGreaterThan(-2 * finalReveal.copyHeight);
  expect(finalReveal.images[2].mask).toBeGreaterThan(0);
  expect(finalReveal.images[2].mask).toBeLessThan(100);
  expect(finalReveal.frame).toEqual(first.frame);
  await scrollProgress(page, 0.95);
  const third = await scene(page);
  expect(third.stage).toBe('3');
  expect(third.textY).toBeCloseTo(-2 * third.copyHeight, 1);
  expect(third.images[2].mask).toBe(0);
  expect(third.frame).toEqual(first.frame);
  await page.screenshot({ path: '.tools/about-story-third-pair.png' });

  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), geometry.start + geometry.range + 80);
  await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(geometry.inset - 60);
  await scrollProgress(page, 0.95);
  expect((await scene(page)).frame).toEqual(first.frame);
  await scrollProgress(page, 0.5);
  expect((await scene(page)).stage).toBe('2');
  await scrollProgress(page, 0.05);
  const reversed = await scene(page);
  expect(reversed.stage).toBe('1');
  expect(reversed.textY).toBeCloseTo(0, 1);
  expect(reversed.images.slice(1).map(image => image.mask)).toEqual([100, 100]);
});

test('desktop wheel scrolling advances and reverses the pinned story without trapping document scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openAbout(page);
  const section = page.locator('#about-story');
  await expect(section).toHaveAttribute('data-mode', 'pinned');
  await scrollProgress(page, 0.05);
  const geometry = await pinnedGeometry(page);
  const first = await scene(page);
  await page.mouse.move(350, first.frame.y + first.frame.height / 2);
  await page.mouse.wheel(0, geometry.range * 0.45);
  await expect(section).toHaveAttribute('data-stage', '2');
  await expect.poll(async () => (await scene(page)).progress).toBeCloseTo(0.5, 2);
  expect((await scene(page)).frame.y).toBeCloseTo(first.frame.y, 1);
  await page.mouse.wheel(0, -geometry.range * 0.45);
  await expect(section).toHaveAttribute('data-stage', '1');
  await expect.poll(async () => (await scene(page)).progress).toBeCloseTo(0.05, 2);
  expect((await scene(page)).frame.y).toBeCloseTo(first.frame.y, 1);
  await page.mouse.wheel(0, geometry.range * 0.9);
  await expect(section).toHaveAttribute('data-stage', '3');
  await expect.poll(async () => (await scene(page)).progress).toBeCloseTo(0.95, 2);
  await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(first.frame.y - 60);
});

test('reduced motion presents all three story pairs in readable document flow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 568 });
    await openAbout(page);
    await expect(page.locator('#about-story')).toHaveAttribute('data-mode', 'flow');
    await expect(page.locator('.story-sticky')).toBeHidden();
    const images = page.locator('.story-flow img');
    await expect(page.locator('#about-story').getByRole('img')).toHaveCount(3);
    let previousBottom = -Infinity;
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute('alt', /\S/);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeInViewport();
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
      const box = await image.evaluate(node => {
        const rectangle = node.getBoundingClientRect();
        return { top: rectangle.top + scrollY, bottom: rectangle.bottom + scrollY,
          left: rectangle.left, right: rectangle.right, height: rectangle.height };
      });
      expect(box.top).toBeGreaterThanOrEqual(previousBottom - 1);
      expect(box.height).toBeGreaterThan(0);
      expect(box.left).toBeGreaterThanOrEqual(-1);
      expect(box.right).toBeLessThanOrEqual(width + 1);
      previousBottom = box.bottom;
    }
    expect(await page.locator('#about-story').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#experience-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('#experience-heading')).toBeInViewport();
  }
});

test('short viewports and missing animation support preserve the complete story in static flow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 360 });
  await openAbout(page);
  await expect(page.locator('#about-story')).toHaveAttribute('data-mode', 'flow');
  await expect(page.locator('.story-sticky')).toBeHidden();
  for (const pair of await page.locator('.story-flow-stage').all()) {
    await pair.scrollIntoViewIfNeeded();
    await expect(pair).toBeInViewport();
    expect(await pair.textContent()).toMatch(/\S/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addInitScript(() => { delete Element.prototype.animate; });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await expect(page.locator('#about-story')).toHaveAttribute('data-mode', 'flow');
  await expect(page.locator('.story-sticky')).toBeHidden();
  await expect(page.locator('#about-story').getByRole('img')).toHaveCount(3);
  for (const image of await page.locator('.story-flow img').all()) await expect(image).toBeVisible();
});

test.describe('touch scrolling', () => {
  test.use({ viewport: { width: 390, height: 1000 }, isMobile: true, hasTouch: true });

  test('mobile touch pans advance and reverse the pinned story', async ({ page }) => {
    await openAbout(page);
    const section = page.locator('#about-story');
    await expect(section).toHaveAttribute('data-mode', 'pinned');
    const session = await page.context().newCDPSession(page);
    const points = y => [{ x: 195, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }];
    const swipeWhileHeld = async (startY, endY) => {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(startY) });
      for (let index = 1; index <= 8; index++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(startY + (endY - startY) * index / 8) });
        await page.waitForTimeout(16);
      }
    };
    try {
      await scrollProgress(page, 0.1);
      const first = await scene(page);
      await swipeWhileHeld(850, 250);
      await expect.poll(async () => (await scene(page)).progress).toBeGreaterThan(0.2);
      const forward = await scene(page);
      expect(forward.frame.y).toBeCloseTo(first.frame.y, 1);
      expect(forward.textY).toBeLessThan(first.textY);
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      // A new contact stops fling momentum before testing the reverse gesture.
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(250) });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await scrollProgress(page, 0.5);
      const second = await scene(page);
      await swipeWhileHeld(250, 850);
      await expect.poll(async () => (await scene(page)).progress).toBeLessThan(0.4);
      const backward = await scene(page);
      expect(backward.frame.y).toBeCloseTo(second.frame.y, 1);
      expect(backward.textY).toBeGreaterThan(second.textY);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await session.detach();
    }
  });
});

test('direct About anchors reach the story, experience, and contact without a scroll trap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAbout(page, '#about-story');
  await expect(page.locator('#about-story')).toBeInViewport();
  await openAbout(page, '#experience-heading');
  await expect(page.locator('#experience-heading')).toBeInViewport();
  await openAbout(page, '#contact');
  await expect(page.getByLabel('Email Address')).toBeInViewport();
  await page.reload();
  await expect(page.getByLabel('Email Address')).toBeInViewport();
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about#about$/);
  await expect(page.locator('#about-heading')).toBeInViewport();
});
