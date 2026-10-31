import { test, expect } from './browser-test.js';

test('palette uses the same complete trajectory and duration at desktop and touch widths', async ({ browser, baseURL }) => {
  test.setTimeout(180000);
  const samples = [];
  for (const width of [1440, 393, 320, 430]) {
    const context = await browser.newContext({ baseURL, viewport:{width,height:900}, isMobile:width<760, hasTouch:width<760 });
    const page = await context.newPage();
    // Unrelated full-size GIFs are not part of this animation check.
    await page.route('**/*.gif', route => route.abort());
    await page.goto('/projects/beacon-trust', {waitUntil:'domcontentloaded'});
    const palette = page.locator('#beacon-color-system');
    await palette.evaluate(node => node.scrollIntoView({block:'center',behavior:'instant'}));
    await expect.poll(() => palette.locator('.beacon-color-card').first().evaluate(node => node.getAnimations().length)).toBe(1);
    const sample = await palette.evaluate(root => {
      const cards=[...root.querySelectorAll('.beacon-color-card')];
      const animations=cards.map(card=>card.getAnimations()[0]);
      animations.forEach(animation=>animation.pause());
      const output=[];
      for (const time of [0,325,650,975,1299]) {
        animations.forEach(animation=>{animation.currentTime=time;});
        output.push(cards.map(card=>{
          const style=getComputedStyle(card), matrix=new DOMMatrixReadOnly(style.transform);
          const box=card.getBoundingClientRect(), panel=root.querySelector('.beacon-colors').getBoundingClientRect();
          return {y:matrix.m42,scale:matrix.a,z:style.zIndex,color:style.backgroundColor,
            contained:box.top>=panel.top&&box.bottom<=panel.bottom&&box.left>=panel.left&&box.right<=panel.right};
        }));
      }
      return {output,durations:animations.map(a=>a.effect.getTiming().duration)};
    });
    expect(sample.durations).toEqual([1300,1300,1300]);
    expect(sample.output.flat().every(card=>card.contained)).toBe(true);
    samples.push(sample.output);
    // Release the transition, then check all four palettes on the live clock.
    await palette.evaluate(root=>root.querySelectorAll('.beacon-color-card').forEach(card=>card.getAnimations().forEach(a=>{a.finish();})));
    for (const index of ['2','3','0']) {
      await expect(palette.locator('.beacon-color-stack')).toHaveAttribute('data-palette',index,{timeout:10000});
      await expect(palette).toHaveAttribute('data-palette-transitioning','false');
      const visible = await palette.locator('.beacon-color-card').evaluateAll(cards=>cards.map(card=>{
        const rect=card.getBoundingClientRect();
        return document.elementFromPoint(rect.x+rect.width/2,rect.y+5)?.closest('.beacon-color-card')===card;
      }));
      expect(visible).toEqual([true,true,true]);
    }
    await context.close();
  }
  for(const sample of samples.slice(1)) expect(sample).toEqual(samples[0]);
});

test('core flow spacing and mobile swatch type match the requested sizes', async ({page}) => {
  await page.goto('/projects/lumis',{waitUntil:'domcontentloaded'});
  for(const width of [1440,393,320,760]) {
    await page.setViewportSize({width,height:900});
    await expect(page.locator('.lumis-flow-item')).toHaveCount(5);
    await expect(page.locator('.lumis-flow-list')).toHaveCSS('row-gap',width>760?'48px':'30px');
    if(width<=760) await expect(page.locator('.lumis-tone-note')).toHaveCSS('font-size','10px');
  }
});
