import { test, expect } from '@playwright/test';

const contactTitle = "No matter what stage of the process you're in, I highly recommend getting in touch.";

async function openContact(page, route = '/contact') {
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.contact-page')).toBeVisible();
}

test('Contact matches the desktop design with its own heading, shared form, FAQ, and footer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openContact(page);
  await expect(page).toHaveTitle('Contact — Grateful Erhis');
  await expect(page.locator('main#contact-page')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 }).locator('.heading-text')).toHaveText([
    'Have any question?', 'Don’t be a stranger...',
  ]);
  await expect(page.locator('.header')).toHaveCount(1);
  await expect(page.locator('.contact')).toHaveCount(1);
  await expect(page.locator('.contact form')).toHaveCount(1);
  await expect(page.locator('.footer')).toHaveCount(1);
  await expect(page.locator('.hero, .about-page, .projects-page')).toHaveCount(0);
  await expect(page.locator('#contact-heading')).toContainText(contactTitle);
  await expect(page.locator('#contact-page-heading')).toHaveCSS('font-size', '96px');
  await expect(page.locator('#contact-page-heading')).toHaveCSS('line-height', '106px');
  await expect(page.locator('#contact-heading')).toHaveCSS('font-size', '24px');
  await expect(page.locator('#contact-heading')).toHaveCSS('line-height', '34px');
  await expect(page.locator('#contact-heading')).toHaveCSS('letter-spacing', '-0.48px');
  await expect(page.locator('.faq-toggle')).toHaveCount(8);
  await expect(page.locator('.faq-toggle[aria-expanded="true"]')).toHaveCount(0);
  await page.locator('.contact-image').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.contact-image').evaluate(video => video.readyState >= 2 && video.videoWidth > 0)).toBe(true);
  const geometry = await page.evaluate(() => {
    const box = selector => {
      const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect();
      return { x, y: y + scrollY, width, height };
    };
    return { wordmark: box('.wordmark'), heading: box('#contact-page-heading'),
      image: box('.contact-image'), form: box('.contact form'),
      contactEnd: box('.contact').y + box('.contact').height,
      faqTop: box('.faq-item').y, footerTop: box('.footer').y };
  });
  expect(geometry.wordmark).toEqual({ x: 40, y: 32, width: geometry.wordmark.width, height: 22 });
  expect(geometry.heading.y).toBeCloseTo(118, 1);
  expect(geometry.heading.height).toBeCloseTo(212, 1);
  expect(geometry.image).toEqual({ x: 668, y: 378, width: 732, height: 602 });
  expect(geometry.form.width).toBeCloseTo(584, 1);
  expect(geometry.faqTop).toBeGreaterThan(geometry.contactEnd);
  expect(geometry.footerTop).toBeGreaterThan(geometry.faqTop);
  expect(errors).toEqual([]);
});

test('Contact navigation opens the new route from every page and keeps its form anchor local', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of ['/', '/projects']) {
    await page.goto(route);
    const footer = page.getByRole('navigation', { name: 'Footer navigation' });
    await expect(footer.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/contact');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Let’s Talk', exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('.contact-page')).toBeVisible();
  }
  await openContact(page, '/contact/');
  await page.reload();
  await expect(page).toHaveTitle('Contact — Grateful Erhis');
  const footer = page.getByRole('navigation', { name: 'Footer navigation' });
  await expect(footer.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '#contact');
  await expect(footer.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('href', '/projects');
  await expect(footer.getByRole('link', { name: 'Resume', exact: true })).toHaveAttribute('href', '/resume');
  await expect(footer.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute('href', '/#services');
  await page.getByLabel('Name', { exact: true }).fill('Contact Visitor');
  await footer.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/\/contact\/#contact$/);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Contact Visitor');
  await expect(page.getByLabel('Email Address')).toBeInViewport();
  await page.reload();
  await expect(page.locator('.contact')).toBeInViewport();
  await page.locator('.wordmark').click();
  await expect(page).toHaveURL(/\/#home$/);
  await expect(page.locator('.hero')).toBeInViewport();
});

test('the Contact form preserves shared focus states, native validation, and inquiry submission', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openContact(page);
  const email = page.getByLabel('Email Address');
  const name = page.getByLabel('Name', { exact: true });
  const inquiry = page.getByLabel('Inquiry');
  const submit = page.getByRole('button', { name: 'Let’s talk', exact: true });
  await submit.click();
  await expect(email).toBeFocused();
  expect(await email.evaluate(field => field.validity.valueMissing)).toBe(true);
  await expect(page.getByRole('status')).toBeEmpty();
  await email.fill('invalid-address');
  await submit.click();
  expect(await email.evaluate(field => field.validity.typeMismatch)).toBe(true);
  await expect(page.getByRole('status')).toBeEmpty();
  await email.fill('visitor@example.com');
  await email.press('Tab');
  await expect(name).toBeFocused();
  await expect(name).toHaveCSS('background-color', 'rgb(244, 214, 233)');
  await expect(email).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await name.fill('Portfolio Visitor');
  await name.press('Tab');
  await expect(inquiry).toBeFocused();
  await expect(inquiry).toHaveCSS('background-color', 'rgb(244, 214, 233)');
  await expect(name).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await inquiry.fill('I have a question about a website and brand project.');
  await inquiry.press('Tab');
  await expect(submit).toBeFocused();
  await expect(inquiry).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(inquiry).toHaveValue('I have a question about a website and brand project.');
  await submit.press('Enter');
  await expect(page.getByRole('status')).toContainText('Your email app will open');
});

test('FAQ exposes eight keyboard controls and only keeps one answer open', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openContact(page);
  const toggles = page.locator('.faq-toggle');
  await expect(toggles).toHaveCount(8);
  const relationships = await toggles.evaluateAll(buttons => buttons.map(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    return { label: button.textContent.trim(), associatedPanel: Boolean(panel?.classList.contains('faq-panel')) };
  }));
  expect(relationships.every(item => item.label.length > 0 && item.associatedPanel)).toBe(true);
  await toggles.first().focus();
  await page.keyboard.press('Enter');
  await expect(toggles.first()).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.faq-toggle[aria-expanded="true"]')).toHaveCount(1);
  const firstPanel = page.locator('.faq-item').first().locator('.faq-panel');
  await expect(firstPanel).toContainText('branding packages start at $1500');
  await expect(firstPanel.locator('.faq-answer')).toHaveCSS('font-size', '14px');
  await expect(firstPanel.locator('.faq-answer')).toHaveCSS('line-height', '23px');
  expect(await page.locator('.faq-item').first().evaluate(item => {
    const question = item.querySelector('.faq-toggle > span:first-child').getBoundingClientRect();
    const answer = item.querySelector('.faq-answer').getBoundingClientRect();
    return answer.top - question.bottom;
  })).toBeGreaterThanOrEqual(24);
  expect((await firstPanel.textContent()).trim().length).toBeGreaterThan(0);
  expect(await firstPanel.evaluate(panel => panel.getBoundingClientRect().height)).toBeGreaterThan(20);
  await toggles.nth(1).click();
  await expect(toggles.first()).toHaveAttribute('aria-expanded', 'false');
  await expect(toggles.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.faq-toggle[aria-expanded="true"]')).toHaveCount(1);
  await expect.poll(() => firstPanel.evaluate(panel => panel.getBoundingClientRect().height)).toBeLessThanOrEqual(1);
  await toggles.nth(1).press('Space');
  await expect(toggles.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.faq-toggle[aria-expanded="true"]')).toHaveCount(0);
});

test('FAQ answers animate continuously in both directions and stay closed after the return animation', async ({ page }) => {
  await openContact(page);
  await page.locator('.faq-toggle').first().scrollIntoViewIfNeeded();
  const samples = await page.locator('.faq-item').first().evaluate(async item => {
    const toggle = item.querySelector('.faq-toggle');
    const panel = item.querySelector('.faq-panel');
    const sample = async () => {
      const heights = [];
      for (let frame = 0; frame < 60; frame++) {
        heights.push(panel.getBoundingClientRect().height);
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      return heights;
    };
    const initial = panel.getBoundingClientRect().height;
    toggle.click();
    const opening = await sample();
    toggle.click();
    const closing = await sample();
    return { initial, opening, closing, final: panel.getBoundingClientRect().height };
  });
  const openHeight = Math.max(...samples.opening);
  expect(samples.initial).toBeLessThanOrEqual(1);
  expect(openHeight).toBeGreaterThan(20);
  expect(samples.opening.filter(height => height > 1 && height < openHeight - 1).length).toBeGreaterThan(2);
  expect(samples.closing.filter(height => height > 1 && height < openHeight - 1).length).toBeGreaterThan(2);
  for (let index = 1; index < samples.opening.length; index++) {
    expect(samples.opening[index]).toBeGreaterThanOrEqual(samples.opening[index - 1] - 0.5);
    expect(samples.closing[index]).toBeLessThanOrEqual(samples.closing[index - 1] + 0.5);
  }
  expect(samples.final).toBeLessThanOrEqual(1);
  await expect(page.locator('.faq-toggle').first()).toHaveAttribute('aria-expanded', 'false');
});

test('Contact keeps form fields and FAQ answers readable without horizontal overflow on smaller screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await openContact(page);
    await page.locator('.contact-image').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.contact-image').evaluate(video => video.readyState >= 2 && video.videoWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const toggle of await page.locator('.faq-toggle').all()) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.faq-toggle[aria-expanded="true"]')).toHaveCount(1);
      expect(await toggle.evaluate(button => {
        const question = button.querySelector('span').getBoundingClientRect();
        const answer = button.parentElement.querySelector('.faq-answer').getBoundingClientRect();
        return answer.top - question.bottom;
      })).toBeGreaterThanOrEqual(24);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const fieldsFit = await page.locator('.contact form input, .contact form textarea').evaluateAll(fields => fields.every(field => {
      const box = field.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth && box.width > 150;
    }));
    expect(fieldsFit).toBe(true);
    expect(await page.locator('.faq-item').evaluateAll(items => items.every(item => item.scrollWidth <= item.clientWidth))).toBe(true);
    await expect(page.locator('.footer')).toHaveCount(1);
  }
});

test('Contact headings wait for entry and replay their reveal each time they return into view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openContact(page);
  const heading = page.locator('#contact-page-heading');
  const faqHeading = page.getByRole('heading', { name: 'FAQ', exact: true });
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text')).toHaveCount(2);
  await expect(faqHeading).not.toHaveClass(/is-revealed/);
  await faqHeading.scrollIntoViewIfNeeded();
  await expect(faqHeading).toHaveClass(/is-revealed/);
  await expect(faqHeading.locator('.heading-text').first()).toHaveCSS('animation-name', 'hero-text-enter');
  await expect(heading).not.toHaveClass(/is-revealed/);
  await heading.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(heading).toHaveClass(/is-revealed/);
  await expect(heading.locator('.heading-text').first()).toHaveCSS('animation-name', 'hero-text-enter');
  await expect(faqHeading).not.toHaveClass(/is-revealed/);
  await faqHeading.scrollIntoViewIfNeeded();
  await expect(faqHeading).toHaveClass(/is-revealed/);
  const formHeading = page.locator('#contact-heading');
  await expect(formHeading).not.toHaveClass(/is-revealed/);
  await formHeading.scrollIntoViewIfNeeded();
  await expect(formHeading).toHaveClass(/is-revealed/);
  const timings = await formHeading.evaluate(node => node.getAnimations({ subtree: true }).map(animation => {
    animation.pause();
    const { duration, delay } = animation.effect.getTiming();
    return { duration, delay, easing: getComputedStyle(animation.effect.target).animationTimingFunction };
  }));
  expect(timings.length).toBeGreaterThan(1);
  timings.forEach((timing, index) => expect(timing).toEqual({
    duration: 400, delay: index * 140, easing: 'cubic-bezier(0.12, 0.23, 0.5, 1)',
  }));
});
