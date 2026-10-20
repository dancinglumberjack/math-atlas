import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createPreviewServer } from '../scripts/serve.mjs';
import { build } from '../scripts/build.mjs';

build({ check: true });
const require = createRequire(import.meta.url);
const { chromium } = process.env.PLAYWRIGHT_MODULE_PATH ? require(process.env.PLAYWRIGHT_MODULE_PATH) : await import('playwright');
const executablePath = process.env.CHROME_PATH || undefined;
const server = createPreviewServer({ basePath: '/math-atlas/' });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port + '/math-atlas/';
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [], failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failed.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.status() + ' ' + response.url()); });
  await page.goto(base);
  await page.waitForFunction(() => window.MathAtlas && window.MathCalculator && window.MathReading);
  const ids = await page.evaluate(() => MathAtlas.lessons.map(lesson => lesson.id));
  assert.equal(ids.length, 80);
  assert.equal(await page.locator('.lesson-card').count(), 80);

  async function lesson(id) {
    await page.evaluate(id => { location.hash = 'lesson/' + id; }, id);
    await page.waitForFunction(id => MathAtlas.getState().id === id, id);
  }

  // Exercise actual generated HTML, not a synthetic DOM or duplicated renderer.
  for (const id of ids) {
    await lesson(id);
    assert.equal(await page.locator('#visual-stage svg').count(), 1, id);
    assert.equal(await page.locator('#visual-stage').evaluate(node => /NaN|Infinity/.test(node.innerHTML)), false, id);
    await page.locator('#reveal-all').click();
    assert.equal(await page.locator('#worked-steps li').count(), 3, id);
    await page.locator('#mode-practice').click();
    await page.locator('#answer-input').fill('999999');
    await page.locator('#answer-form button[type=submit]').click();
    assert.match(await page.locator('#answer-feedback').innerText(), /Not quite/);
    await page.locator('#answer-input').fill(String(await page.evaluate(() => MathAtlas.getState().answer)));
    await page.locator('#answer-form button[type=submit]').click();
    assert.match(await page.locator('#answer-feedback').innerText(), /right/);
    await page.locator('#new-problem').click();
    assert.equal(await page.evaluate(() => Number.isFinite(MathAtlas.getState().answer)), true);
    await page.locator('#reset-controls').click();
    await page.locator('#mode-understand').click();
  }
  console.log('All 80 lesson visuals, worked steps, practice, and new challenges passed.');

  for (const id of ['scale-drawings', 'rectangular-prism', 'surface-area', 'volume-cylinder', 'volume-cone', 'volume-sphere']) {
    await lesson(id);
    assert.equal(await page.locator('#visual-stage .math-iso-svg').count(), 1, id);
    await page.locator('#view-flat').click();
    assert.equal(await page.locator('#visual-stage .math-iso-svg').count(), 0, id);
    await page.locator('#view-isometric').click();
  }
  await lesson('rectangular-prism');
  await page.locator('#separate-layers').check();
  assert.equal(await page.evaluate(() => MathAtlas.getState().exploded), true);
  await page.locator('#visual-expand').click();
  assert.equal(await page.locator('#visual-dialog').isVisible(), true);
  await page.keyboard.press('Escape');
  await page.locator('#control-a').fill('6');
  await page.locator('#control-a').dispatchEvent('input');
  await page.reload();
  await page.waitForFunction(() => window.MathAtlas);
  assert.equal(await page.evaluate(() => MathAtlas.getState().params.a), 6);
  assert.match(await page.locator('#lesson-status').innerText(), /Practiced/);

  await page.locator('#calculator-open').click();
  await page.locator('#calc-expression').fill('sin(30)+3/4');
  await page.locator('#calc-expression').press('Enter');
  assert.equal(await page.locator('.calc-result').innerText(), '1.25');
  await page.locator('#calc-expression').fill('1/0');
  await page.locator('#calc-expression').press('Enter');
  assert.match(await page.locator('.calc-message').innerText(), /divide by zero/);
  await page.locator('[name="calc-angle"][value="RAD"]').check();
  await page.locator('#calc-expression').fill('sin(pi/2)');
  await page.locator('#calc-expression').press('Enter');
  assert.equal(await page.locator('.calc-result').innerText(), '1');
  await page.keyboard.press('Escape');

  await page.locator('#reading-open').click();
  await page.locator('[data-reading-preset="dyslexia"]').click();
  assert.equal(await page.evaluate(() => MathReading.getSettings().font), 'arial');
  await page.locator('#reading-size').selectOption('1.4');
  await page.locator('#reading-letters').selectOption('0.12');
  await page.locator('#reading-words').selectOption('0.16');
  await page.locator('#reading-line').selectOption('2.1');
  await page.locator('#reading-done').click();
  await page.setViewportSize({ width: 320, height: 900 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '320px enlarged text');
  await page.locator('#calculator-open').click();
  assert.equal(await page.locator('#calculator-dialog').evaluate(node => node.scrollWidth > node.clientWidth), false, 'calculator width');
  await page.keyboard.press('Escape');
  await page.locator('#reading-open').click();
  await page.locator('[data-reading-preset="adhd"]').click();
  await page.locator('#reading-done').click();
  assert.equal(await page.locator('#worked-steps li').count(), 1);
  assert.equal(await page.evaluate(() => MathReading.getSettings().reduceMotion), true);
  await page.locator('#reading-open').click();
  await page.locator('#reading-ruler').check();
  await page.locator('#reading-done').click();
  await page.reload();
  await page.waitForFunction(() => window.MathReading);
  assert.equal(await page.locator('#reading-guide').isVisible(), true);
  await page.locator('#reading-open').click();
  await page.locator('#reading-reset').click();
  await page.locator('#reading-done').click();

  await page.setViewportSize({ width: 390, height: 900 });
  for (const id of ids) {
    await lesson(id);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, id + ' mobile overflow');
  }
  await page.evaluate(() => { location.hash = 'library'; });
  await page.waitForFunction(() => !document.getElementById('library-view').hidden);
  await page.locator('#search').fill('fraction');
  assert.ok(await page.locator('.lesson-card').count() >= 4);
  await page.locator('#search').fill('zznothingzz');
  assert.equal(await page.locator('#empty-state').isVisible(), true);
  await page.locator('#clear-filters').click();
  assert.equal(await page.locator('.lesson-card').count(), 80);
  await page.locator('#problem-input').fill('2x − 3 = 9');
  await page.locator('#problem-form button').click();
  await page.waitForFunction(() => MathAtlas.getState().id === 'linear-equations');
  assert.equal(await page.evaluate(() => MathAtlas.getState().answer), 6);

  // The project subpath catches root-relative URLs that fail on GitHub Pages.
  const about = await page.request.get(base + 'about.html');
  assert.equal(about.status(), 200, 'About page should ship with the site');
  await page.goto(base + 'about.html');
  assert.match(await page.locator('body').innerText(), /Math Atlas/i);
  for (const image of await page.locator('img').all()) assert.equal(await image.evaluate(node => node.complete && node.naturalWidth > 0), true, 'About image');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'About mobile overflow');

  // Browser storage is optional: learning must remain functional when it is denied.
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Unavailable', 'SecurityError'); } }); });
  const withoutStorage = await blocked.newPage();
  withoutStorage.on('pageerror', error => errors.push('storage unavailable: ' + error.message));
  await withoutStorage.goto(base + '#lesson/linear-equations');
  await withoutStorage.waitForFunction(() => window.MathAtlas && window.MathCalculator);
  assert.equal(await withoutStorage.locator('#visual-stage svg').count(), 1);
  await blocked.close();
  assert.deepEqual(errors, [], 'Uncaught browser errors');
  assert.deepEqual(failed, [], 'Failed assets');
  console.log('Isometric views, calculator, reading/focus support, storage, all mobile lessons, search, typed equations, About, and assets passed.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
