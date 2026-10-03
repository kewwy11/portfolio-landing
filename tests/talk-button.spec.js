import { test, expect } from '@playwright/test';

const pink = 'rgb(239, 0, 112)';
const palePink = 'rgb(244, 214, 233)';

async function openContact(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const button = page.getByRole('button', { name: 'Let’s talk', exact: true });
  await button.scrollIntoViewIfNeeded();
  return button;
}

async function read(button) {
  return button.evaluate(node => {
    const fill = getComputedStyle(node.querySelector('.talk-button-fill'));
    const label = node.querySelector('.talk-button-label');
    const style = getComputedStyle(label);
    const box = node.getBoundingClientRect();
    const glyph = label.getBoundingClientRect();
    const tracks = node.getAnimations({ subtree: true });
    return {
      opacity: Number(fill.opacity), sweep: parseFloat(fill.getPropertyValue('--talk-sweep')),
      color: style.color, labelX: glyph.x - box.x, labelY: glyph.y - box.y,
      width: box.width, height: box.height,
      times: tracks.map(animation => animation.currentTime),
      rates: tracks.map(animation => animation.playbackRate),
      ids: tracks.map(animation => animation.id),
    };
  });
}

async function sample(button, time) {
  await button.evaluate((node, milliseconds) => {
    node.getAnimations({ subtree: true }).forEach(animation => {
      animation.pause();
      animation.currentTime = milliseconds;
    });
  }, time);
  return read(button);
}

test('fill and label move continuously to the same Figma endpoints without changing button size', async ({ page }) => {
  const button = await openContact(page);
  await expect(button).toHaveAttribute('type', 'submit');
  await expect(button).toHaveAccessibleName('Let’s talk');
  expect(await read(button)).toMatchObject({ opacity: 0, sweep: 180, color: pink, width: 123, height: 43 });
  await button.hover();
  const clocks = await button.evaluate(node => node.getAnimations({ subtree: true }).map(animation => ({
    duration: animation.effect.getTiming().duration, start: animation.startTime,
  })));
  expect(clocks.every(clock => clock.duration === 650)).toBe(true);
  expect(clocks[0].start).toBe(clocks[1].start);
  const samples = [];
  for (const time of [0, 50, 120, 190, 260, 300, 330, 400, 500, 650]) {
    const state = await sample(button, time);
    samples.push(state);
    expect(state).toMatchObject({ width: 123, height: 43, labelX: 27.5 });
    if ([0, 120, 260, 300, 400, 650].includes(time)) {
      await button.screenshot({ path: '.tools/talk-button-smooth-' + time + '.png' });
    }
  }
  for (let index = 1; index < 8; index += 1) {
    expect(samples[index].sweep).toBeGreaterThan(samples[index - 1].sweep);
  }
  for (let index = 1; index <= 5; index += 1) {
    expect(samples[index].labelY).toBeGreaterThan(samples[index - 1].labelY);
  }
  for (let index = 6; index < samples.length; index += 1) {
    expect(samples[index].labelY).toBeLessThan(samples[index - 1].labelY);
  }
  expect(samples[5].labelY).toBeGreaterThan(43);
  expect(samples.at(-1)).toMatchObject({ opacity: 1, sweep: 360, color: palePink, labelY: 16 });
});

test('leaving and rapid reentry reverse the existing tracks at their current position', async ({ page }) => {
  const button = await openContact(page);
  await button.hover();
  await sample(button, 260);
  await button.evaluate(node => { window.talkTracks = node.getAnimations({ subtree: true }); });
  await page.mouse.move(0, 0);
  await expect(button).not.toHaveClass(/is-active/);
  const leaving = await read(button);
  expect(leaving.ids).toEqual(['talk-fill', 'talk-label']);
  expect(leaving.rates).toEqual([-1.25, -1.25]);
  expect(leaving.times[0]).toBeGreaterThan(150);
  expect(leaving.times[0]).toBeLessThanOrEqual(260);
  expect(leaving.times[0]).toBeCloseTo(leaving.times[1], 2);
  expect(leaving.opacity).toBe(1);
  expect(leaving.sweep).toBeGreaterThan(180);
  await sample(button, 180);
  await button.hover();
  await expect(button).toHaveClass(/is-active/);
  const reentering = await read(button);
  expect(reentering.times[0]).toBeGreaterThanOrEqual(180);
  expect(reentering.times[0]).toBeLessThan(300);
  expect(reentering.rates).toEqual([1, 1]);
  expect(await button.evaluate(node => node.getAnimations({ subtree: true })
    .every((animation, index) => animation === window.talkTracks[index]))).toBe(true);
  for (let index = 0; index < 3; index += 1) {
    await sample(button, 250);
    await page.mouse.move(0, 0);
    await expect(button).not.toHaveClass(/is-active/);
    await sample(button, 200);
    await button.hover();
    await expect(button).toHaveClass(/is-active/);
    expect((await read(button)).times[0]).toBeGreaterThanOrEqual(200);
  }
  expect(await sample(button, 650)).toMatchObject({ opacity: 1, sweep: 360, color: palePink });
  await page.mouse.move(0, 0);
  await expect(button.locator('.talk-button-label')).toHaveCSS('color', pink);
  await expect(button.locator('.talk-button-fill')).toHaveCSS('opacity', '0');
});

test('keyboard focus and live reduced-motion changes preserve readable, stable states', async ({ page }) => {
  const button = await openContact(page);
  await page.locator('#contact textarea').focus();
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveClass(/is-active/);
  expect(await sample(button, 650)).toMatchObject({ opacity: 1, color: palePink, labelY: 16 });
  await page.keyboard.press('Tab');
  await expect(button).not.toHaveClass(/is-active/);
  await button.focus();
  await expect(button).toBeFocused();
  await button.hover();
  await expect(button).toHaveClass(/is-active/);
  await sample(button, 260);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(button).toHaveClass(/motion-disabled/);
  expect(await read(button)).toMatchObject({ opacity: 1, sweep: 360, color: palePink, labelY: 16, times: [] });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(button).not.toHaveClass(/motion-disabled/);
  expect(await read(button)).toMatchObject({ opacity: 1, sweep: 360, color: palePink, labelY: 16 });
  await button.evaluate(node => node.blur());
  await page.mouse.move(0, 0);
  await expect(button.locator('.talk-button-fill')).toHaveCSS('opacity', '0');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reloaded = page.getByRole('button', { name: 'Let’s talk', exact: true });
  await reloaded.hover();
  await expect(reloaded).toHaveClass(/motion-disabled/);
  expect(await read(reloaded)).toMatchObject({ opacity: 1, color: palePink, times: [] });
});
