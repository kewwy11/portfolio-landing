import { test, expect } from '@playwright/test';

test('tools scroll at constant speed and loop without a gap or position jump', async ({ page }) => {
  await page.goto('/');
  const track = page.locator('.tools-track');
  const groups = page.locator('.tools-group');
  await expect(groups).toHaveCount(3);
  await expect(groups.nth(1)).toHaveAttribute('aria-hidden', 'true');
  await expect(groups.last()).toHaveAttribute('aria-hidden', 'true');
  await expect(track).toHaveCSS('animation-timing-function', 'linear');
  await expect(track).toHaveCSS('animation-iteration-count', 'infinite');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 930 });
    const geometry = await track.evaluate(element => {
      const animation = element.getAnimations()[0];
      animation.pause();
      const duration = animation.effect.getTiming().duration;
      animation.currentTime = 0;
      const first = element.children[0].getBoundingClientRect();
      const second = element.children[1].getBoundingClientRect();
      const cards = [...element.children[0].children].map(card => card.getBoundingClientRect());
      return { duration, trackWidth: element.getBoundingClientRect().width, firstWidth: first.width,
        secondWidth: second.width, initialX: first.x, period: second.x - first.x,
        gap: cards[1].x - cards[0].right,
        seamGap: element.children[1].children[0].getBoundingClientRect().x - cards.at(-1).right };
    });
    expect(geometry.secondWidth).toBeCloseTo(geometry.firstWidth);
    expect(geometry.trackWidth).toBeCloseTo(geometry.firstWidth * 3);
    expect(geometry.seamGap).toBeCloseTo(geometry.gap);
    const sample = time => track.evaluate((element, time) => {
      element.getAnimations()[0].currentTime = time;
      return new DOMMatrixReadOnly(getComputedStyle(element).transform).m41;
    }, time);
    expect(await sample(geometry.duration / 4)).toBeCloseTo(-geometry.period / 4, 1);
    expect(await sample(geometry.duration / 2)).toBeCloseTo(-geometry.period / 2, 1);
    const beforeWrap = await track.evaluate((element, duration) => {
      element.getAnimations()[0].currentTime = duration - .1;
      return {
        nextCopyX: element.children[1].getBoundingClientRect().x,
        lastCardRight: element.lastElementChild.lastElementChild.getBoundingClientRect().right,
        viewportRight: element.parentElement.getBoundingClientRect().right,
      };
    }, geometry.duration);
    expect(beforeWrap.nextCopyX).toBeCloseTo(geometry.initialX, 1);
    expect(beforeWrap.lastCardRight).toBeGreaterThanOrEqual(beforeWrap.viewportRight);
    expect(await sample(geometry.duration)).toBeCloseTo(0, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('reduced motion keeps the toolkit stationary', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.tools-track')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.tools-track')).toHaveCSS('transform', 'none');
});
