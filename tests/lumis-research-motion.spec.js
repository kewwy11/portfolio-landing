import { test, expect } from '@playwright/test';

test('research board populates and skin-tone pairs grow in order once', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/lumis');

  const board = page.locator('.lumis-research-board');
  await expect(board).not.toHaveClass(/is-populating/);
  await board.evaluate(element => window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight / 3,
    behavior: 'instant',
  }));
  await expect(board).toHaveClass(/is-populating/);
  await expect(board.locator('.lumis-board-tile')).toHaveCount(10);
  await expect(board.locator('.lumis-board-tile-face').first()).toHaveCSS('animation-name', 'lumis-board-pop');
  await expect(board.locator('.lumis-board-tile-face').nth(1)).toHaveCSS('animation-delay', '0.34s');

  const tones = page.locator('.lumis-research-tones');
  await tones.evaluate(element => window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight / 3,
    behavior: 'instant',
  }));
  await expect(tones).toHaveClass(/is-sequencing/);
  const fitz = tones.locator('.lumis-fitzpatrick-swatches .lumis-tone-swatch');
  const monk = tones.locator('.lumis-monk-swatches .lumis-tone-swatch');
  await expect(fitz.first()).toHaveCSS('animation-delay', '0s');
  await expect(monk.first()).toHaveCSS('animation-delay', '0s');
  await expect(fitz.nth(1)).toHaveCSS('animation-delay', '0.25s');
  await expect(monk.nth(1)).toHaveCSS('animation-delay', '0.25s');
  await expect(tones.locator('.lumis-tone-note')).toHaveCSS('animation-delay', '1.79s');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(board).toHaveClass(/is-populating/);
  await expect(tones).toHaveClass(/is-sequencing/);
});
