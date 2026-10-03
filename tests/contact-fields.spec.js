import { test, expect } from '@playwright/test';

const inactiveBackground = 'rgba(0, 0, 0, 0)';
const activeBackground = 'rgb(244, 214, 233)';
const pink = 'rgb(239, 0, 112)';
const textColor = 'rgb(96, 77, 83)';
const placeholderColor = 'rgb(175, 156, 162)';

const placeholderStyle = (field) => field.evaluate(element => getComputedStyle(element, '::placeholder').color);
const expectInactive = async (field) => {
  await expect(field).toHaveCSS('background-color', inactiveBackground);
  await expect(field).toHaveCSS('border-bottom-color', pink);
  await expect(field).toHaveCSS('border-bottom-width', '1px');
  await expect(field).toHaveCSS('color', textColor);
  await expect.poll(() => placeholderStyle(field)).toBe(placeholderColor);
};
const expectActive = async (field) => {
  await expect(field).toBeFocused();
  await expect(field).toHaveCSS('background-color', activeBackground);
  await expect(field).toHaveCSS('color', textColor);
  await expect(field).toHaveCSS('outline-style', 'none');
  await expect(field).toHaveCSS('box-shadow', `${pink} 0px -1px 0px 0px inset`);
  await expect.poll(() => placeholderStyle(field)).toBe(textColor);
};

test('mouse focus and blur apply the Figma states to all three contact fields', async ({ page }) => {
  await page.goto('/');
  const fields = page.locator('.contact form input, .contact form textarea');
  await expect(fields).toHaveCount(3);
  for (const field of await fields.all()) {
    await expectInactive(field);
    await expect(field).toHaveCSS('font-size', '16px');
    await expect(field).toHaveCSS('line-height', '24px');
    await field.click();
    await expectActive(field);
    await page.locator('.talk-button').focus();
    await expectInactive(field);
  }
});

test('keyboard focus uses the same appearance and keeps entered values after blur', async ({ page }) => {
  await page.goto('/');
  const email = page.getByLabel('Email Address');
  const name = page.getByLabel('Name', { exact: true });
  const inquiry = page.getByLabel('Inquiry');
  await email.focus();
  await expectActive(email);
  await email.fill('hello@example.com');
  await email.press('Tab');
  await expectActive(name);
  await expectInactive(email);
  await name.fill('Grateful');
  await name.press('Tab');
  await expectActive(inquiry);
  await expectInactive(name);
  await inquiry.fill('I would like a website for my business.');
  await inquiry.press('Tab');
  await expect(page.locator('.talk-button')).toBeFocused();
  await expectInactive(inquiry);
  await expect(email).toHaveValue('hello@example.com');
  await expect(name).toHaveValue('Grateful');
  await expect(inquiry).toHaveValue('I would like a website for my business.');
});

test('focus keeps form geometry stable on desktop and mobile and preserves textarea resizing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const fields = page.locator('.contact form input, .contact form textarea');
  const formGeometry = () => page.locator('.contact form').evaluate(form =>
    [...form.querySelectorAll('label, input, textarea, button')].map(element => {
      const box = element.getBoundingClientRect();
      return { top: box.top + scrollY, left: box.left + scrollX, width: box.width, height: box.height };
    }));

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.talk-button').focus();
    const before = await formGeometry();
    for (const field of await fields.all()) {
      await field.focus();
      await expectActive(field);
      const after = await formGeometry();
      for (let index = 0; index < before.length; index += 1) {
        for (const property of ['top', 'left', 'width', 'height']) {
          expect(after[index][property]).toBeCloseTo(before[index][property], 2);
        }
      }
    }
  }

  const inquiry = page.getByLabel('Inquiry');
  await expect(inquiry).toHaveCSS('resize', 'vertical');
  const originalHeight = await inquiry.evaluate(element => element.getBoundingClientRect().height);
  await inquiry.evaluate(element => { element.style.height = `${element.getBoundingClientRect().height + 80}px`; });
  expect(await inquiry.evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(originalHeight + 80, 2);
});
