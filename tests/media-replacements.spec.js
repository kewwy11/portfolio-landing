import { test, expect } from './browser-test.js';

async function playing(video) {
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(v => v.readyState >= 2 && v.currentTime > .05 && !v.paused), { timeout:30000 }).toBe(true);
  expect(await video.evaluate(v => v.muted && v.loop && v.playsInline && !v.error)).toBe(true);
}

test('compatible animations occupy the hero, both Beacon covers and their mapped brand frames', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/');
  await expect(page.locator('.hero-inset').nth(1)).toHaveAttribute('src', /hero-design\.mp4$/);
  for (const route of ['/?category=branding', '/projects?category=branding']) {
    await page.goto(route);
    const cover=page.locator('[data-project="beacon-trust"] .project-image video').first();
    await expect(cover).toHaveAttribute('src', /beacon-cover\.mp4$/);
    await cover.scrollIntoViewIfNeeded();
    await expect.poll(() => cover.evaluate(e => e.readyState >= 2 && e.videoWidth > 0)).toBe(true);
  }
  for (const [route, slots] of [
    ['/projects/beacon-trust', [['120:299','beacon-idea.mp4'], ['115:241','beacon-logo.mp4']]],
    ['/projects/lumis-brand', [['250:1020','lumis-promise.mp4'], ['280:1559','lumis-logo.mp4'], ['287:1763','lumis-palette.mp4'], ['312:3981','lumis-care.mp4']]],
  ]) {
    await page.goto(route);
    for (const [node, file] of slots) {
      console.log('Checking',node,file);
      const slot=page.locator(`[data-node-id="${node}"]`);
      const image=slot.locator('video').or(slot.and(page.locator('video'))).first();
      await expect(image).toHaveAttribute('src',new RegExp(file.replaceAll('.','\\.')+'$'));
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(e => e.readyState >= 2 && e.videoWidth>0),{timeout:30000}).toBe(true);
      const box=await image.boundingBox();
      expect(box.width).toBeGreaterThan(100);
      expect(box.height).toBeGreaterThan(100);
      await image.screenshot({path:test.info().outputPath(file+'.png')});
    }
  }
});

test('core flow and comparison videos play muted and loop in the requested order', async ({ page }) => {
  await page.goto('/projects/lumis');
  const clips=['scan-review.mp4','design-for-disagreement.mp4','scan-screens.mp4','analytics.mp4'];
  for(let i=0;i<clips.length;i++) {
    const video=page.locator('.lumis-flow-video').nth(i);
    await expect(video).toHaveAttribute('src',new RegExp(clips[i].replaceAll('.','\\.')+'$'));
    await playing(video);
  }
  const compare=page.locator('.lumis-comparison-film');
  await expect(compare).toHaveAttribute('src',/compare-scan\.mp4$/);
  await playing(compare);
});

for(const width of [393,1440]) test(`carousel keeps its cursor and closes with each method at ${width}px`, async ({ page }) => {
  await page.setViewportSize({width,height:900});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/projects/lumis');
  const section=page.locator('#supporting-screens');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveCSS('padding-left','0px');
  await expect(section).toHaveCSS('padding-right','0px');
  const files=['dashboard.mp4','treatment.mp4','appointment.mp4','overview.mp4'];
  for(let i=0;i<files.length;i++) {
    const frame=page.locator('.lumis-supporting-group').first().locator('button').nth(i);
    await expect(frame.locator('video')).toHaveAttribute('src',new RegExp(files[i].replaceAll('.','\\.')+'$'));
    // Keyboard focus brings the selected moving frame into view and pauses it.
    await frame.focus();
    await playing(frame.locator('video'));
    await frame.press('Enter');
    const dialog=page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    const video=dialog.locator('video');
    await expect(video).toHaveAttribute('src',new RegExp(files[i].replaceAll('.','\\.')+'$'));
    await playing(video);
    // The custom cursor must render in the dialog's top layer and stay clickable through.
    await page.mouse.move(width-40,36);
    await expect(dialog.locator('.eyes-cursor')).toBeVisible();
    await expect(dialog).toHaveCSS('cursor','none');
    await expect(dialog.locator('.eyes-cursor')).toHaveCSS('pointer-events','none');
    if(i===0) await page.getByRole('button',{name:'Close full view'}).click();
    else if(i===1) await page.mouse.click(2,100);
    else await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.mouse.move(100,100);
    await expect(page.locator('body > .eyes-cursor')).toBeVisible();
    await expect(frame).toBeFocused();
    expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  }
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
