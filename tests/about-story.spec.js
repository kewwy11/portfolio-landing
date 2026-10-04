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
    const textWindow = section.querySelector('.story-text-window');
    const textBounds = textWindow.getBoundingClientRect();
    const panels = [...section.querySelectorAll('.story-text-panel')];
    return {
      progress: Number(section.dataset.progress),
      stage: section.dataset.stage,
      frame: rectangle(section.querySelector('.story-sticky')),
      copyHeight: section.querySelector('.story-text-panel').getBoundingClientRect().height,
      textY: new DOMMatrixReadOnly(getComputedStyle(track).transform).m42,
      textWindow: rectangle(textWindow),
      visiblePanels: panels.flatMap((panel, index) => {
        const bounds = panel.getBoundingClientRect();
        const visibleHeight = Math.min(bounds.bottom, textBounds.bottom) - Math.max(bounds.top, textBounds.top);
        return visibleHeight > 1 ? [index + 1] : [];
      }),
      copy: rectangle(panels[Number(section.dataset.stage) - 1].querySelector('.story-copy')),
      semanticFlow: rectangle(section.querySelector('.story-flow')),
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

function expectSingleRestingScene(snapshot, stage, viewport) {
  expect(snapshot.stage).toBe(String(stage));
  expect(snapshot.visiblePanels).toEqual([stage]);
  expect(snapshot.textY).toBeCloseTo(-(stage - 1) * snapshot.copyHeight, 1);
  expect(snapshot.images.map(image => image.mask)).toEqual([0, stage >= 2 ? 0 : 100, stage === 3 ? 0 : 100]);
  expect(snapshot.frame.y).toBeGreaterThanOrEqual(-1);
  expect(snapshot.frame.y + snapshot.frame.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(snapshot.images[0].box.height).toBeGreaterThan(viewport.height <= 460 ? 40 : 90);
  expect(snapshot.copy.y).toBeGreaterThanOrEqual(snapshot.textWindow.y - 1);
  expect(snapshot.copy.y + snapshot.copy.height).toBeLessThanOrEqual(snapshot.textWindow.y + snapshot.textWindow.height + 1);
  expect(snapshot.semanticFlow.width).toBeLessThanOrEqual(1);
  expect(snapshot.semanticFlow.height).toBeLessThanOrEqual(1);
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

for (const viewport of [
  { width: 1366, height: 650 }, { width: 1440, height: 600 },
  { width: 390, height: 667 }, { width: 320, height: 568 }, { width: 320, height: 360 },
]) {
  test(`short ${viewport.width}×${viewport.height} screens pin one complete scene and replace it through all three stages`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openAbout(page);
    const section = page.locator('#about-story');
    await expect(section).toHaveAttribute('data-mode', 'pinned');
    await expect(page.locator('.story-sticky')).toBeVisible();
    const geometry = await pinnedGeometry(page);
    expect(geometry.height).toBeLessThanOrEqual(viewport.height);
    expect(geometry.range).toBeGreaterThanOrEqual(2 * viewport.height);
    let pinnedFrame;
    for (const [progress, stage] of [[0.05, 1], [0.5, 2], [0.95, 3], [0.5, 2], [0.05, 1]]) {
      await scrollProgress(page, progress);
      const current = await scene(page);
      expectSingleRestingScene(current, stage, viewport);
      if (pinnedFrame) expect(current.frame).toEqual(pinnedFrame);
      else pinnedFrame = current.frame;
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (stage === 3 && (viewport.width === 1440 || viewport.height === 360)) {
        await page.screenshot({ path: `.tools/about-story-fitted-${viewport.width}-${viewport.height}-stage-3.png` });
      }
    }
    await scrollProgress(page, 0.25);
    const transition = await scene(page);
    expect(transition.textY).toBeGreaterThan(-transition.copyHeight);
    expect(transition.textY).toBeLessThan(0);
    expect(transition.images[1].mask).toBeGreaterThan(0);
    expect(transition.images[1].mask).toBeLessThan(100);
    expect(transition.frame).toEqual(pinnedFrame);
    if (viewport.width === 1440 || viewport.width === 320) {
      await scrollProgress(page, 0.05);
      await page.screenshot({ path: `.tools/about-story-fitted-${viewport.width}-${viewport.height}.png` });
    }
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), geometry.start + geometry.range + 80);
    await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(geometry.inset - 60);
  });
}

test('reduced motion keeps one scene visible and swaps it immediately as scrolling advances or reverses', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 1440, height: 600 }, { width: 768, height: 568 }, { width: 390, height: 667 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport);
    await openAbout(page);
    const section = page.locator('#about-story');
    await expect(section).toHaveAttribute('data-mode', 'pinned');
    await expect(page.locator('.story-sticky')).toBeVisible();
    await expect(section.getByRole('img')).toHaveCount(3);
    for (const image of await page.locator('.story-flow img').all()) await expect(image).toHaveAttribute('alt', /\S/);
    for (const [progress, stage] of [[0.05, 1], [0.3, 2], [0.8, 3], [0.5, 2], [0.1, 1]]) {
      await scrollProgress(page, progress);
      const current = await scene(page);
      expectSingleRestingScene(current, stage, viewport);
      expect(current.animations).toHaveLength(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('#experience-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('#experience-heading')).toBeInViewport();
  }
});

test('missing animation support preserves one pinned scene and smooth reversible replacements', async ({ page }) => {
  await page.addInitScript(() => { delete Element.prototype.animate; });
  const viewport = { width: 1440, height: 600 };
  await page.setViewportSize(viewport);
  await openAbout(page);
  await expect(page.locator('#about-story')).toHaveAttribute('data-mode', 'pinned');
  await expect(page.locator('.story-sticky')).toBeVisible();
  for (const [progress, stage] of [[0.05, 1], [0.5, 2], [0.95, 3], [0.5, 2], [0.1, 1]]) {
    await scrollProgress(page, progress);
    const current = await scene(page);
    expectSingleRestingScene(current, stage, viewport);
    expect(current.animations).toHaveLength(0);
  }
  await scrollProgress(page, 0.25);
  const transition = await scene(page);
  expect(transition.textY).toBeGreaterThan(-transition.copyHeight);
  expect(transition.textY).toBeLessThan(0);
  expect(transition.images[1].mask).toBeGreaterThan(0);
  expect(transition.images[1].mask).toBeLessThan(100);
  expect(transition.animations).toHaveLength(0);
});

test.describe('touch scrolling', () => {
  test.use({ viewport: { width: 390, height: 667 }, isMobile: true, hasTouch: true });

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
      await swipeWhileHeld(550, 150);
      await expect.poll(async () => (await scene(page)).progress).toBeGreaterThan(0.2);
      const forward = await scene(page);
      expect(forward.frame.y).toBeCloseTo(first.frame.y, 1);
      expect(forward.textY).toBeLessThan(first.textY);
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      // A new contact stops fling momentum before testing the reverse gesture.
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(150) });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await scrollProgress(page, 0.5);
      const second = await scene(page);
      await swipeWhileHeld(150, 550);
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
