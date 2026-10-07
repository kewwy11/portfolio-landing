import { test, expect } from './browser-test.js';

const viewports = [
  { width: 320, height: 568 }, { width: 390, height: 844 },
  { width: 768, height: 1024 }, { width: 1280, height: 720 },
  { width: 1920, height: 1080 }, { width: 844, height: 390 },
];

for (const route of ['/', '/about', '/projects', '/contact']) {
  test(`${route} fits portrait, landscape, tablet, and desktop screens`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const footerGap = await page.evaluate(() => {
        const last = document.querySelector('main').lastElementChild;
        const contents = last.matches('.contact') ? [...last.children]
          : [last.querySelector('.project-grid') || last];
        const contentBottom = Math.max(...contents.map(node => node.getBoundingClientRect().bottom));
        return document.querySelector('.footer').getBoundingClientRect().top - contentBottom;
      });
      expect(footerGap).toBeCloseTo(96, 1);
      for (const image of await page.locator('.project-image').all()) {
        const ratio = await image.evaluate(node => {
          const box = node.getBoundingClientRect();
          const [width, height] = getComputedStyle(node).aspectRatio.split('/').map(Number);
          return { actual: box.width / box.height, expected: width / height };
        });
        expect(ratio.actual).toBeCloseTo(ratio.expected, 2);
      }
      if (route === '/contact') {
        await expect(page.locator('.faq-toggle').first()).toHaveCSS('color', 'rgb(96, 77, 83)');
        await expect(page.locator('.faq-answer').first()).toHaveCSS('color', 'rgb(127, 108, 114)');
        for (const item of await page.locator('.faq-item').all()) {
          await item.locator('.faq-toggle').click();
          const boxes = await item.evaluate(node => {
            const question = node.querySelector('.faq-toggle > span').getBoundingClientRect();
            const answer = node.querySelector('.faq-answer').getBoundingClientRect();
            const row = node.getBoundingClientRect();
            return { gap: answer.top - question.bottom, answerWidth: answer.width,
              rowWidth: row.width, right: answer.right, rowRight: row.right };
          });
          expect(boxes.gap).toBeGreaterThanOrEqual(24);
          const widths = { cost: 529, timeline: 529, 'design-build': 504, ai: 529,
            'getting-started': 508, payments: 513, international: 501, revisions: 506 };
          const expectedWidth = widths[await item.getAttribute('data-faq')];
          expect(boxes.answerWidth).toBeCloseTo(Math.min(boxes.rowWidth - 20, expectedWidth), 1);
          expect(boxes.right).toBeLessThanOrEqual(boxes.rowRight);
        }
        await page.screenshot({ path: `test-results/faq-responsive-${viewport.width}-${viewport.height}.png`, fullPage: true });
      }
    }
  });
}
