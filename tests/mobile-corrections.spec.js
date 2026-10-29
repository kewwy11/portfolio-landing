import { test, expect } from './browser-test.js';

test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, channel: undefined });

test('project dropdown matches the custom menu and Back preserves each project category', async ({ page }) => {
  await page.goto('/projects');
  const toggle = page.locator('.mobile-filter-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.mobile-filter-options')).toHaveCSS('width', '136px');
  await expect(page.locator('.mobile-filter-options button').first()).toHaveText('UI/UX');
  await page.locator('.mobile-filter-options button').last().click();
  await expect(page.locator('.project-grid')).toHaveAttribute('data-category', 'Branding');
  await page.reload();
  await expect(page.locator('.project-grid')).toHaveAttribute('data-category', 'Branding');
  for (const [id, category] of [['beacon-trust', 'Branding'], ['lumis-brand', 'Branding'], ['lumis', 'UI/UX']]) {
    await page.goto(`/projects/${id}`);
    await expect(page.locator('aside nav')).toBeVisible();
    await page.locator('aside > a').click();
    await expect(page.locator('.project-grid')).toHaveAttribute('data-category', category);
  }
});

test('mobile contact videos play inline and pause when offscreen', async ({ page }) => {
  for (const route of ['/', '/about', '/contact']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const video = page.locator('video.contact-image');
    await video.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(() => video.evaluate(node => !node.paused && node.currentTime > 0 && node.muted && node.playsInline), { timeout: 30000 }).toBe(true);
    // A shorter viewport puts the contact page's video completely below the form.
    await page.setViewportSize({ width: 393, height: 500 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => video.evaluate(node => node.getBoundingClientRect().top >= innerHeight)).toBe(true);
    await expect.poll(() => video.evaluate(node => node.paused)).toBe(true);
    await page.setViewportSize({ width: 393, height: 852 });
  }
});

test('About keeps the authored portrait frame and a compact vertical pinned story with complete touch transitions', async ({ page }) => {
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);
  const portrait = page.locator('.about-portrait');
  await expect(portrait).toHaveCSS('object-fit', 'fill');
  await expect(portrait).toHaveCSS('object-position', '50% 100%');
  const story = page.locator('.about-story');
  await expect(story).toHaveAttribute('data-mode', 'pinned');
  await expect(story.locator('.story-visual-image')).toHaveCount(3);
  await story.evaluate(node => scrollTo({ top: node.offsetTop, behavior: 'instant' }));
  const text = await story.locator('.story-text-window').boundingBox();
  const image = await story.locator('.story-image-window').boundingBox();
  expect(text.y + text.height).toBeLessThan(image.y);
  expect(image.y - text.y - text.height).toBeCloseTo(16, 0);
  expect(await story.locator('.story-sticky').evaluate(node => parseFloat(getComputedStyle(node).top))).toBe(0);
  const session = await page.context().newCDPSession(page);
  const swipe = async direction => {
    const start = direction > 0 ? 650 : 250;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: start }] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: start - direction * step * 35 }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  for (const stage of [2, 3]) {
    await swipe(1);
    await expect(story).toHaveAttribute('data-stage', String(stage));
    await expect(story).toHaveAttribute('data-transitioning', 'false');
  }
  await swipe(1);
  await expect.poll(() => story.evaluate(node => scrollY > node.offsetTop + node.offsetHeight - innerHeight)).toBe(true);
  await session.detach();
});

test('Lumis treatment variants slide through the same frame and translate their active indicator', async ({ page }) => {
  await page.goto('/projects/lumis');
  await page.evaluate(() => document.fonts.ready);
  const artwork = page.locator('.tp-artwork');
  await artwork.scrollIntoViewIfNeeded();
  const frames = artwork.locator('.tp-frame');
  for (let index = 0; index < 2; index++) {
    await expect(artwork).toHaveAttribute('data-active-ui', String(index), { timeout: 15000 });
    const geometry = await artwork.evaluate((root, index) => {
      const container = root.getBoundingClientRect();
      const frame = root.querySelectorAll('.tp-frame')[index].getBoundingClientRect();
      return { offset: Math.abs(frame.y + frame.height / 2 - container.y - container.height / 2), contained: frame.top > container.top && frame.bottom < container.bottom };
    }, index);
    expect(geometry.offset).toBeLessThan(1);
    expect(geometry.contained).toBe(true);
    const size = await frames.nth(index).evaluate(node => [node.offsetWidth,node.offsetHeight]);
    expect(size).toEqual([371,377]);
    expect(await frames.nth(index).locator('.tp-card').evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
    await expect.poll(() => artwork.locator('.tp-active-indicator').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42)).toBe(index * 35);
  }
});

test('every mobile page leaves 64px between its final content and footer', async ({ page }) => {
  for (const [route, lastContent] of [['/', '.contact-image'], ['/about', '.contact-image'], ['/projects', '.project-gallery'], ['/contact', '.faq']]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const gap = await page.evaluate(selector => document.querySelector('.site-footer').getBoundingClientRect().top - document.querySelector(selector).getBoundingClientRect().bottom, lastContent);
    expect(gap, route).toBeCloseTo(64, 0);
  }
});

test('Lumis retains composed diagrams and comparison content across narrow widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/lumis');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320,393,430,760]) {
    await page.setViewportSize({ width, height: 852 });
    const layout = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      return { overflow:document.documentElement.scrollWidth-innerWidth,
        workflowRatio:box('.lumis-workflow-diagram').width/box('.lumis-workflow-diagram').height,
        biasRatio:box('.lumis-bias-diagram').width/box('.lumis-bias-diagram').height,
        comparison:box('.lumis-research-table').width <= box('.lumis-research-table-scroll').width + 1,
        tones:box('.lumis-monk-swatches').width <= box('.lumis-tone-scroll').width + 1 };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.workflowRatio).toBeCloseTo(361/249.704, 2);
    expect(layout.biasRatio).toBeCloseTo(352.804/160, 2);
    expect(layout.comparison).toBe(true);
    expect(layout.tones).toBe(true);
  }
  await expect(page.locator('.lumis-flow-item')).toHaveCount(5);
  await expect(page.locator('.lumis-lesson')).toHaveCount(4);
});

test('Beacon palette settles into the same colour order on mobile and desktop', async ({ page }) => {
  for (const width of [393,1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/projects/beacon-trust');
    await page.evaluate(() => document.fonts.ready);
    const palette = page.locator('.beacon-color-system');
    await palette.scrollIntoViewIfNeeded();
    await expect(palette.locator('.beacon-color-stack')).toHaveAttribute('data-palette','1');
    await expect(palette).toHaveAttribute('data-palette-transitioning','false');
    await expect.poll(() => palette.locator('.beacon-color-card').evaluateAll(nodes => nodes.map(node => ({
      y:new DOMMatrixReadOnly(getComputedStyle(node).transform).m42,color:node.dataset.color,
    })).sort((a,b)=>a.y-b.y).map(node=>node.color))).toEqual(['blue','lavender','mist']);
    await expect.poll(() => palette.locator('.beacon-color-card').evaluateAll(nodes => nodes.map(node=>getComputedStyle(node).backgroundColor).sort())).toEqual(['rgb(11, 11, 214)','rgb(232, 233, 255)','rgb(250, 250, 252)'].sort());
    if (width === 393) {
      await page.setViewportSize({ width:430, height:900 });
      for (const [index, expected] of [['2',['yellow','dark','mist']], ['3',['mist','blue','dark']], ['0',['dark','yellow','blue']]]) {
        await expect(palette.locator('.beacon-color-stack')).toHaveAttribute('data-palette',index,{timeout:10000});
        await expect(palette).toHaveAttribute('data-palette-transitioning','false');
        expect(await palette.locator('.beacon-color-card').evaluateAll(nodes=>nodes.map(node=>({color:node.dataset.color,y:new DOMMatrixReadOnly(getComputedStyle(node).transform).m42})).sort((a,b)=>a.y-b.y).map(node=>node.color))).toEqual(expected);
      }
    }
  }
});
