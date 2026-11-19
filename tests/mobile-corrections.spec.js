import { test, expect } from './browser-test.js';

test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, channel: undefined });

test('mobile project filter uses the segmented control and Back preserves each project category', async ({ page }) => {
  await page.goto('/projects');
  const filters = page.getByRole('group', { name: 'Filter projects' });
  await expect(filters).toHaveCSS('width', '154px');
  await expect(filters.getByRole('button', { name: 'UI/UX' })).toHaveAttribute('aria-pressed', 'true');
  await filters.getByRole('button', { name: 'Branding' }).click();
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
  for (const route of ['/', '/contact']) {
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
  for (const [route, lastContent] of [['/', '.contact-image'], ['/projects', '.project-gallery'], ['/contact', '.faq']]) {
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
