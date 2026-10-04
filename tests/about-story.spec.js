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
    return { start: box.top + scrollY - inset, inset, height: frameBox.height };
  });
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
      stage: section.dataset.stage,
      frame: rectangle(section.querySelector('.story-sticky')),
      copyHeight: panels[0].getBoundingClientRect().height,
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
      animationCount: section.getAnimations({ subtree: true }).length,
    };
  });
}

async function waitForScene(page, stage) {
  await expect.poll(async () => {
    const current = await scene(page);
    const masks = [0, stage >= 2 ? 0 : 100, stage === 3 ? 0 : 100];
    return current.stage === String(stage)
      && Math.abs(current.textY + (stage - 1) * current.copyHeight) < .05
      && current.visiblePanels.length === 1 && current.visiblePanels[0] === stage
      && current.images.every((image, index) => Math.abs(image.mask - masks[index]) < .01);
  }, { timeout: 5000, intervals: [20, 50, 100] }).toBe(true);
  await expect(page.locator('#about-story')).toHaveAttribute('data-transitioning', 'false');
  return scene(page);
}

async function pinFirstScene(page) {
  await expect(page.locator('#about-story')).toHaveAttribute('data-mode', 'pinned');
  const geometry = await pinnedGeometry(page);
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), geometry.start + 2);
  const first = await waitForScene(page, 1);
  await expect.poll(async () => (await scene(page)).frame.y).toBeCloseTo(geometry.inset, 0);
  await page.mouse.move(first.images[0].box.x + first.images[0].box.width / 2,
    first.images[0].box.y + first.images[0].box.height / 2);
  return { geometry, first };
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

async function sampleFrames(page, count = 54) {
  return page.evaluate(async frames => {
    const section = document.querySelector('#about-story');
    const track = section.querySelector('.story-text-track');
    const frame = section.querySelector('.story-sticky');
    const image = section.querySelectorAll('.story-visual-image')[1];
    const values = [];
    for (let index = 0; index < frames; index++) {
      await new Promise(requestAnimationFrame);
      values.push({ y: new DOMMatrixReadOnly(getComputedStyle(track).transform).m42,
        mask: parseFloat(getComputedStyle(image).clipPath.match(/inset\(([^ ]+)/)[1]),
        frameY: frame.getBoundingClientRect().y });
    }
    return values;
  }, count);
}

function expectSmoothFirstTransition(frames, direction, copyHeight, pinnedY) {
  expect(frames.filter(frame => frame.y < -1 && frame.y > -copyHeight + 1).length).toBeGreaterThanOrEqual(3);
  for (let index = 0; index < frames.length; index++) {
    expect(frames[index].frameY).toBeCloseTo(pinnedY, 1);
    expect(frames[index].y).toBeGreaterThanOrEqual(-copyHeight - .1);
    expect(frames[index].y).toBeLessThanOrEqual(.1);
    expect(frames[index].mask).toBeCloseTo(100 * (1 + frames[index].y / copyHeight), 1);
    if (index > 0) {
      const delta = frames[index].y - frames[index - 1].y;
      expect(direction * delta).toBeGreaterThanOrEqual(-1);
      expect(Math.abs(delta)).toBeLessThan(copyHeight * .5);
    }
  }
}

test('one small wheel gesture completes the next pair smoothly without a second scroll and reverses completely', async ({ page }) => {
  const viewport = { width: 1440, height: 1000 };
  await page.setViewportSize(viewport);
  await openAbout(page);
  await expect(page.locator('.story-sticky')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.story-visual-image')).toHaveCount(3);
  await expect(page.locator('#about-story').getByRole('img')).toHaveCount(3);
  const { first } = await pinFirstScene(page);
  expectSingleRestingScene(first, 1, viewport);

  await page.mouse.wheel(0, 10);
  expectSmoothFirstTransition(await sampleFrames(page), -1, first.copyHeight, first.frame.y);
  const second = await waitForScene(page, 2);
  expectSingleRestingScene(second, 2, viewport);
  expect(second.frame).toEqual(first.frame);
  for (let index = 0; index < 3; index++) {
    expect(second.images[index].box).toEqual(first.images[index].box);
    expect(second.images[index].transform).toBe('none');
  }
  await page.screenshot({ path: '.tools/about-story-gesture-second-pair.png' });

  await page.mouse.wheel(0, -10);
  expectSmoothFirstTransition(await sampleFrames(page), 1, first.copyHeight, first.frame.y);
  expectSingleRestingScene(await waitForScene(page, 1), 1, viewport);
});

test('a large wheel gesture and its continuing momentum advance one pair without queuing or skipping scenes', async ({ page }) => {
  const viewport = { width: 1440, height: 600 };
  await page.setViewportSize(viewport);
  await openAbout(page);
  const { first } = await pinFirstScene(page);
  await page.mouse.wheel(0, 5000);
  // Keep feeding the same wheel burst after the transition can have finished.
  for (let index = 0; index < 24; index++) {
    await page.mouse.wheel(0, 10);
    await page.waitForTimeout(40);
  }
  const second = await waitForScene(page, 2);
  expectSingleRestingScene(second, 2, viewport);
  expect(second.frame).toEqual(first.frame);
  await page.waitForTimeout(240);
  expectSingleRestingScene(await scene(page), 2, viewport);
  await page.mouse.wheel(0, 10);
  expectSingleRestingScene(await waitForScene(page, 3), 3, viewport);
});

test('the third pair arrives while pinned, can reverse, and allows the next forward gesture to leave the section', async ({ page }) => {
  const viewport = { width: 1440, height: 600 };
  await page.setViewportSize(viewport);
  await openAbout(page);
  const { first } = await pinFirstScene(page);
  await page.mouse.wheel(0, 10);
  await waitForScene(page, 2);
  await page.mouse.wheel(0, 10);
  const frames = await sampleFrames(page);
  for (const frame of frames) expect(frame.frameY).toBeCloseTo(first.frame.y, 1);
  const third = await waitForScene(page, 3);
  expectSingleRestingScene(third, 3, viewport);
  expect(third.frame).toEqual(first.frame);

  await page.mouse.wheel(0, -10);
  expectSingleRestingScene(await waitForScene(page, 2), 2, viewport);
  await page.mouse.wheel(0, 10);
  expectSingleRestingScene(await waitForScene(page, 3), 3, viewport);
  await page.screenshot({ path: '.tools/about-story-gesture-third-pair.png' });
  await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(first.frame.y - 1);
  await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(first.frame.y - 60);
  await page.locator('#experience-heading').scrollIntoViewIfNeeded();
  await expect(page.locator('#experience-heading')).toBeInViewport();
});

test('keyboard scroll keys complete one pair at a time and reverse without partial resting scenes', async ({ page }) => {
  const viewport = { width: 1440, height: 600 };
  await page.setViewportSize(viewport);
  await openAbout(page);
  const { first } = await pinFirstScene(page);
  for (const [key, stage] of [['ArrowDown', 2], ['PageUp', 1], ['Space', 2], ['PageDown', 3]]) {
    await page.keyboard.press(key);
    const current = await waitForScene(page, stage);
    expectSingleRestingScene(current, stage, viewport);
    expect(current.frame).toEqual(first.frame);
  }
});

for (const viewport of [
  { width: 1366, height: 650 }, { width: 1440, height: 600 },
  { width: 390, height: 667 }, { width: 320, height: 568 }, { width: 320, height: 360 },
]) {
  test(`short ${viewport.width}×${viewport.height} screens keep one full pair visible after each small gesture`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openAbout(page);
    const { geometry, first } = await pinFirstScene(page);
    expect(geometry.height).toBeLessThanOrEqual(viewport.height);
    expectSingleRestingScene(first, 1, viewport);
    for (const [direction, stage] of [[1, 2], [1, 3], [-1, 2], [-1, 1]]) {
      await page.mouse.wheel(0, direction * 10);
      const current = await waitForScene(page, stage);
      expectSingleRestingScene(current, stage, viewport);
      expect(current.frame).toEqual(first.frame);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (stage === 3 && (viewport.width === 1440 || viewport.height === 360)) {
        await page.screenshot({ path: `.tools/about-story-gesture-fitted-${viewport.width}-${viewport.height}.png` });
      }
    }
  });
}

test('reduced motion swaps the full pair immediately for a small gesture without intermediate partial scenes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 1440, height: 600 }, { width: 768, height: 568 }, { width: 390, height: 667 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport);
    await openAbout(page);
    const { first } = await pinFirstScene(page);
    await page.mouse.wheel(0, 10);
    const frames = await sampleFrames(page, 16);
    expect(frames.every(frame => Math.abs(frame.y) < .05 || Math.abs(frame.y + first.copyHeight) < .05)).toBe(true);
    const second = await waitForScene(page, 2);
    expectSingleRestingScene(second, 2, viewport);
    expect(second.animationCount).toBe(0);
    await page.mouse.wheel(0, -10);
    expectSingleRestingScene(await waitForScene(page, 1), 1, viewport);
    await expect(page.locator('#about-story').getByRole('img')).toHaveCount(3);
  }
});

test('without native animation support a small gesture still completes a smooth full replacement', async ({ page }) => {
  await page.addInitScript(() => { delete Element.prototype.animate; });
  const viewport = { width: 1440, height: 600 };
  await page.setViewportSize(viewport);
  await openAbout(page);
  const { first } = await pinFirstScene(page);
  await page.mouse.wheel(0, 10);
  expectSmoothFirstTransition(await sampleFrames(page), -1, first.copyHeight, first.frame.y);
  const second = await waitForScene(page, 2);
  expectSingleRestingScene(second, 2, viewport);
  expect(second.animationCount).toBe(0);
  await page.mouse.wheel(0, -10);
  expectSmoothFirstTransition(await sampleFrames(page), 1, first.copyHeight, first.frame.y);
  expectSingleRestingScene(await waitForScene(page, 1), 1, viewport);
});

test.describe('touch scrolling', () => {
  test.use({ viewport: { width: 390, height: 667 }, isMobile: true, hasTouch: true });

  test('one short touch pan completes a pair, reverses, and releases document scrolling after the third arrival', async ({ page }) => {
    const viewport = { width: 390, height: 667 };
    await openAbout(page);
    const { first } = await pinFirstScene(page);
    const session = await page.context().newCDPSession(page);
    const points = y => [{ x: 195, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }];
    let touchActive = false;
    const swipe = async (startY, endY) => {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(startY) });
      touchActive = true;
      for (let index = 1; index <= 8; index++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(startY + (endY - startY) * index / 8) });
        await page.waitForTimeout(16);
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      touchActive = false;
    };
    try {
      await swipe(550, 480);
      const second = await waitForScene(page, 2);
      expectSingleRestingScene(second, 2, viewport);
      expect(second.frame).toEqual(first.frame);
      await swipe(480, 550);
      expectSingleRestingScene(await waitForScene(page, 1), 1, viewport);
      await swipe(550, 480);
      await waitForScene(page, 2);
      await swipe(550, 480);
      const third = await waitForScene(page, 3);
      expectSingleRestingScene(third, 3, viewport);
      expect(third.frame).toEqual(first.frame);
      await swipe(550, 150);
      await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(first.frame.y - 1);
      await swipe(550, 150);
      await expect.poll(async () => (await scene(page)).frame.y).toBeLessThan(first.frame.y - 30);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      if (touchActive) await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
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
