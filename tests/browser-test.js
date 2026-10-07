import { test as base, expect, chromium } from '@playwright/test';

// Optional local connection for Windows environments where Chromium's startup
// pipe stalls. Normal test runs retain Playwright's standard browser fixture.
export const test = process.env.PORTFOLIO_CDP_ENDPOINT ? base.extend({
  browser: [async ({}, use) => {
    const browser = await chromium.connectOverCDP(process.env.PORTFOLIO_CDP_ENDPOINT);
    await use(browser);
    await browser.close();
  }, { scope: 'worker' }],
}) : base;
export { expect };
