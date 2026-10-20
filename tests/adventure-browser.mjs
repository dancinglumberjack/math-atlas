import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createPreviewServer } from '../scripts/serve.mjs';
import { build } from '../scripts/build.mjs';
import { ageBands, missions, taskFor } from '../src/adventure-model.mjs';

// Mathematical answers have independent, hand-worked coverage in adventure-model.test.mjs.
// This suite verifies those answers can actually be expressed and used in the shipped UI.
build({ check: true });
const require = createRequire(import.meta.url);
const { chromium } = process.env.PLAYWRIGHT_MODULE_PATH ? require(process.env.PLAYWRIGHT_MODULE_PATH) : await import('playwright');
const executablePath = process.env.CHROME_PATH || undefined;
const server = createPreviewServer({ basePath: '/math-atlas/' });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port + '/math-atlas/';
const errors = [], failed = [];
let browser;

function observe(page, prefix = '') {
  page.on('pageerror', error => errors.push(prefix + error.message));
  page.on('requestfailed', request => failed.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.status() + ' ' + response.url()); });
}

async function ready(page) {
  await page.waitForFunction(() => window.AtlasAdventure && window.AtlasJourney && window.AtlasPets && document.querySelector('[data-mission]'));
}

async function currentTask(page) {
  const session = await page.evaluate(() => AtlasJourney.load().inProgress);
  assert.ok(session, 'An active mission must have a resumable session');
  return taskFor(session.missionId, session.step, session.seed);
}

async function setControl(page, key, value) {
  const control = page.locator(`[data-control="${key}"]`);
  assert.equal(await control.count(), 1, 'A labeled manipulative must exist for ' + key);
  await control.fill(String(value));
  await control.dispatchEvent('input');
}

async function answerTask(page, task, response = task.expected) {
  if (task.answer.kind === 'choice') {
    const option = page.locator('[name="adventure-choice"]');
    // Values can contain punctuation (e.g. clock times), so avoid interpolated CSS selectors.
    const choices = await option.all();
    const values = await option.evaluateAll(nodes => nodes.map(node => node.value));
    const index = values.indexOf(String(response));
    assert.ok(index >= 0, task.id + ' must offer its correct choice');
    await choices[index].check();
  } else if (task.answer.kind === 'pair') {
    for (const key of task.answer.keys) {
      const field = page.locator(`[data-answer-key="${key}"]`);
      if (await field.count()) await field.fill(String(response[key]));
      else await setControl(page, key, response[key]);
    }
  } else if (task.answer.key && task.inputs.some(input => input.key === task.answer.key)) {
    await setControl(page, task.answer.key, response);
  } else if (await page.locator('#adventure-answer-number').count()) {
    await page.locator('#adventure-answer-number').fill(String(response));
  } else {
    await page.locator('#adventure-answer-select').selectOption(String(response));
  }
  await page.locator('#adventure-check').click();
}

async function advanceCorrectly(page) {
  const task = await currentTask(page);
  await answerTask(page, task);
  assert.equal(await page.locator('#adventure-next').isVisible(), true, task.id + ': correct answer must allow continuing');
  assert.match(await page.locator('#adventure-feedback').getAttribute('class'), /correct/, task.id);
  await page.locator('#adventure-next').click();
}

async function map(page) {
  if (await page.locator('#adventure-finish').isVisible()) await page.locator('#finish-map').click();
  else if (await page.locator('#adventure-mission').isVisible()) await page.locator('#adventure-pause').click();
  assert.equal(await page.locator('#adventure-home').isVisible(), true);
}

async function enterMission(page, mission) {
  await map(page);
  await page.locator(`#adventure-band-picker [data-band="${mission.bandId}"]`).click();
  await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();
  assert.equal(await page.locator('#adventure-mission').isVisible(), true);
  assert.equal(await page.locator('#mission-title').innerText(), mission.title);
}

async function noOverflow(page, message) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, message);
}

async function rendererRegressions(page) {
  await enterMission(page, missions.find(mission => mission.id === 'meadow-subtract'));
  for (let step = 0; step < 3; step++) {
    const task = await currentTask(page);
    const original = task.visual.count, removed = task.visual.compareCount;
    assert.equal(await page.locator('#mission-visual [data-math-object="remaining"]').count(), original - removed, 'The actual uncrossed objects must match the subtraction');
    assert.equal(await page.locator('#mission-visual [data-math-object="removed"]').count(), removed, 'Only the objects leaving are crossed out');
    assert.equal(await page.locator('#mission-visual [data-math-object]').count(), original, 'The picture must preserve the original whole');
    await advanceCorrectly(page);
  }

  for (const id of ['clock-hours', 'clock-halves', 'clock-quarters']) {
    await enterMission(page, missions.find(mission => mission.id === id));
    await advanceCorrectly(page);
    const readingTask = await currentTask(page);
    assert.equal(readingTask.step, 1);
    assert.notEqual((await page.locator('#mission-readout').textContent()).trim(), String(readingTask.expected), 'A clock-reading challenge must not disclose the digital answer');
    assert.doesNotMatch(await page.locator('#mission-visual').textContent(), /Your trial:/, 'A clock-reading model starts without an answer marker');
    await advanceCorrectly(page);
    await advanceCorrectly(page);
  }

  await enterMission(page, missions.find(mission => mission.id === 'meadow-fractions'));
  await advanceCorrectly(page);
  const proposal = page.locator('#mission-visual [data-proposal-part]');
  const width = async () => Number(await proposal.getAttribute('width'));
  await page.locator('#adventure-answer-number').fill('1/4');
  const quarter = await width();
  await page.locator('#adventure-answer-number').fill('3/4');
  const threeQuarters = await width();
  assert.ok(quarter > 0 && Math.abs(threeQuarters / quarter - 3) < 1e-8, 'Fraction entries must resize the actual dashed bar, not only change a caption');
  await advanceCorrectly(page);
  await page.locator('#adventure-answer-number').fill('1');
  const oneSection = await width();
  await page.locator('#adventure-answer-number').fill('3');
  const threeSections = await width();
  assert.ok(oneSection > 0 && Math.abs(threeSections / oneSection - 3) < 1e-8, 'A sections answer must be scaled as sections of the pictured whole');
  const previousSeed = await page.evaluate(() => AtlasJourney.load().inProgress.seed);
  const beforeReplay = await page.evaluate(() => AtlasJourney.load().pet.coins);
  await advanceCorrectly(page);
  const afterFirst = await page.evaluate(() => AtlasJourney.load().pet.coins);
  assert.ok(afterFirst === beforeReplay || afterFirst === beforeReplay + 15);
  await page.locator('#finish-replay').click();
  const nextSeed = await page.evaluate(() => AtlasJourney.load().inProgress.seed);
  assert.notEqual(nextSeed % 3, previousSeed % 3, 'Fresh numbers must choose a different authored variation family');
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), afterFirst, 'Starting a replay adds no award');
  console.log('Renderer regressions passed: subtraction object conservation, undisclosed clock answers, real fraction bar geometry, and distinct replay variations.');
}

try {
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  observe(page);
  await page.goto(base + 'adventure.html');
  await ready(page);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), 20);
  assert.equal(await page.locator('#adventure-band-picker [data-band]').count(), ageBands.length);
  assert.equal(await page.locator('#adventure-listen,#adventure-listen-status').count(), 0, 'Student adventure has no voice controls');
  assert.ok(missions.length >= 27, 'The age range needs substantive authored missions');

  if (process.env.ATLAS_RENDERER_ONLY !== '1') {
  for (const mission of missions) {
    await enterMission(page, mission);
    const before = await page.evaluate(() => AtlasJourney.load().pet.coins);
    for (let step = 0; step < 3; step++) {
      const task = await currentTask(page);
      assert.equal(task.step, step, mission.id);
      assert.equal(await page.locator('#mission-visual>svg').count(), 1, task.id);
      assert.equal(await page.locator('#mission-visual').evaluate(node => /NaN|Infinity/.test(node.innerHTML)), false, task.id);
      if (['pre-k', 'early'].includes(mission.bandId)) {
        assert.equal(await page.locator('#adventure-answer-fields input[type="text"],#adventure-answer-fields input[type="number"],#mission-controls input[type="number"]').count(), 0, task.id + ': younger learners should use choices and manipulatives');
      }
      if (mission.id === missions[0].id && step === 0) {
        const acorn = page.locator('[data-count-object="0"]');
        assert.equal(await acorn.count(), 1, 'Counting begins with a real tappable object');
        await acorn.click();
        assert.equal(await page.locator('[data-count-object="0"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 1');
        await page.locator('[data-count-object="0"]').click();
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 1', 'Each object can only receive one count');
        await page.locator('[data-reset-count]').click();
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 0');
        await page.locator('[data-count-object="0"]').focus();
        await page.locator('[data-count-object="0"]').press('Enter');
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 1', 'Keyboard users can count an object');
        await page.locator('[data-reset-count]').focus();
        await page.locator('[data-reset-count]').press('Space');
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 0', 'Keyboard users can begin counting again');
        await page.locator('#adventure-hint').click();
        assert.equal(await page.locator('#adventure-hint-text').isVisible(), true);
        const wrong = task.choices.find(choice => String(choice.value) !== String(task.expected));
        await answerTask(page, task, wrong.value);
        assert.equal(await page.locator('#adventure-next').isVisible(), false, 'An incorrect choice must not quietly pass');
        assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), before, 'Hints and incorrect answers never cost coins');
      }
      if (mission.id === 'meadow-compare' && step === 0) {
        await page.locator('#adventure-solution').click();
        assert.equal(await page.locator('#adventure-solution-panel').isVisible(), true);
        await page.locator('#adventure-supported').click();
        assert.equal(await page.locator('#adventure-next').isVisible(), true);
        await page.locator('#adventure-next').click();
      } else await advanceCorrectly(page);
    }
    assert.equal(await page.locator('#adventure-finish').isVisible(), true, mission.id);
    assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), before + 15, 'One new mission earns exactly one award');
    assert.equal(await page.evaluate(id => AtlasJourney.load().completed[id]?.steps, mission.id), 3);
  }
  assert.equal(await page.evaluate(() => Object.keys(AtlasJourney.load().completed).length), missions.length);
  assert.equal(await page.evaluate(() => AtlasJourney.load().completed['meadow-compare'].supported), true, 'Help must be recorded as supported practice');
  console.log(`All ${missions.length} missions / ${missions.length * 3} real UI challenges passed, including early learner controls, mistakes, free hints, supported practice, and unique awards.`);

  // Replays are fresh practice, never an unlimited coin faucet.
  const beforeReplay = await page.evaluate(() => AtlasJourney.load().pet.coins);
  await enterMission(page, missions[0]);
  for (let step = 0; step < 3; step++) await advanceCorrectly(page);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeReplay);

  // Reload must restore the variation, challenge position, and manipulative answer.
  const garden = missions.find(mission => mission.id === 'garden-color');
  await enterMission(page, garden);
  const first = await currentTask(page);
  await answerTask(page, first);
  await page.locator('#adventure-next').click();
  const sessionBeforeReload = await page.evaluate(() => AtlasJourney.load().inProgress);
  await page.reload();
  await page.waitForFunction(() => window.AtlasJourney && document.body.dataset.adventureView === 'mission');
  const sessionAfterReload = await page.evaluate(() => AtlasJourney.load().inProgress);
  assert.equal(sessionAfterReload.seed, sessionBeforeReload.seed);
  assert.equal(sessionAfterReload.step, 1);
  assert.deepEqual(sessionAfterReload.manipulated, sessionBeforeReload.manipulated);
  assert.deepEqual(sessionAfterReload.answers, sessionBeforeReload.answers);
  const trial = await currentTask(page);
  if (trial.answer.kind === 'number') {
    await page.locator('#adventure-answer-number').fill('137');
    const proposalText = await page.locator('#mission-visual [data-proposal]').textContent();
    assert.match(proposalText, /137/, 'A proposed value must visibly change the model before checking');
  }

  // Actual wallet and collection workflows, including an insufficient-funds preview.
  await map(page);
  await page.locator('#pets-open').click();
  await page.locator('[data-pet-tab="shop"]').click();
  await page.locator('[data-pet-category="pet"]').click();
  await page.locator('[data-pet-preview="noodle"]').click();
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeReplay, 'Looking at an item must not spend');
  await page.locator('[data-pet-cancel]').click();
  await page.locator('[data-pet-category="charm"]').click();
  await page.locator('[data-pet-preview="leaf-charm"]').click();
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeReplay);
  await page.locator('[data-pet-buy="leaf-charm"]').click();
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeReplay - 12);
  await page.locator('[data-pet-tab="inventory"]').click();
  await page.locator('[data-pet-equip="leaf-charm"]').click();
  await page.locator('[data-pet-tab="care"]').click();
  assert.equal(await page.locator('[data-pet-feed="berries"]').isDisabled(), true);
  await page.locator('[data-pet-snacks]').click();
  await page.locator('[data-pet-preview="berries"]').click();
  await page.locator('[data-pet-buy="berries"]').click();
  await page.locator('[data-pet-tab="care"]').click();
  await page.locator('[data-pet-feed="berries"]').click();
  assert.equal(await page.locator('[data-pet-feed="berries"]').isDisabled(), true);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeReplay - 17);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.careCount), 1);
  await page.locator('#pet-close').click();
  await page.reload();
  await ready(page);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.equipped.charm), 'leaf-charm');
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.careCount), 1);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeReplay - 17);

  // A fresh student can preview a friend without being able to buy it yet.
  const fresh = await browser.newPage({ viewport: { width: 390, height: 844 } });
  observe(fresh);
  await fresh.goto(base + 'adventure.html');
  await ready(fresh);
  await fresh.locator('#pets-open').click();
  await fresh.locator('[data-pet-tab="shop"]').click();
  await fresh.locator('[data-pet-preview="noodle"]').click();
  assert.equal(await fresh.locator('[data-pet-buy="noodle"]').isDisabled(), true);
  assert.equal(await fresh.evaluate(() => AtlasJourney.load().pet.coins), 20);
  assert.equal(await fresh.locator('#pets-dialog').evaluate(node => node.scrollWidth > node.clientWidth), false);
  await fresh.close();

  await page.locator('#adventure-preferences-open').click();
  await page.locator('#adventure-calm').check();
  await page.locator('#adventure-rewards').uncheck();
  await page.locator('#adventure-preferences-done').click();
  assert.equal(await page.locator('body').evaluate(node => node.classList.contains('adventure-calm')), true);
  assert.equal(await page.locator('body').evaluate(node => node.classList.contains('adventure-hide-rewards')), true);
  assert.equal(await page.locator('#adventure-workshop').isVisible(), false, 'Hiding rewards must change the visible screen');
  await page.reload();
  await ready(page);
  assert.deepEqual(await page.evaluate(() => [AtlasJourney.load().preferences.calm, AtlasJourney.load().preferences.rewards]), [true, false]);

  await page.setViewportSize({ width: 390, height: 844 });
  for (const band of ageBands) {
    await map(page);
    await page.locator(`#adventure-band-picker [data-band="${band.id}"]`).click();
    assert.equal(await page.locator('body').getAttribute('data-band'), band.id);
    await noOverflow(page, band.id + ' map at 390px');
    const mission = missions.find(mission => mission.bandId === band.id);
    await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();
    await noOverflow(page, band.id + ' mission at 390px');
    assert.equal(await page.locator('#mission-visual').evaluate(node => node.scrollWidth > node.clientWidth), false, band.id + ' diagram');
  }
  for (const id of ['clock-hours', 'clock-halves', 'clock-quarters']) {
    await enterMission(page, missions.find(mission => mission.id === id));
    await noOverflow(page, id + ' at 390px');
    assert.equal(await page.locator('#mission-visual svg').count(), 1);
  }
  await map(page);
  await page.locator('#reading-open').click();
  await page.locator('[data-reading-preset="dyslexia"]').click();
  await page.locator('#reading-size').selectOption('1.4');
  await page.locator('#reading-letters').selectOption('0.12');
  await page.locator('#reading-words').selectOption('0.16');
  await page.locator('#reading-line').selectOption('2.1');
  await page.locator('#reading-done').click();
  for (const band of ageBands) {
    await map(page);
    await page.locator(`#adventure-band-picker [data-band="${band.id}"]`).click();
    await noOverflow(page, band.id + ' map at 390px with enlarged/spaced text');
    const mission = missions.find(mission => mission.bandId === band.id);
    await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();
    await noOverflow(page, band.id + ' mission at 390px with enlarged/spaced text');
  }
  await enterMission(page, missions.find(mission => mission.id === 'clock-quarters'));
  await noOverflow(page, 'Quarter-hour clock at 390px with enlarged/spaced text');
  await page.locator('#reading-open').click();
  await page.locator('#reading-reset').click();
  await page.locator('#reading-done').click();
  console.log('Replay limits, reload/resume, model prediction, pet shopping/care/persistence, calm/reward preferences, and all six mobile stages passed.');

  // The established lesson library and the new adventure share one local collection.
  const beforeLibrary = await page.evaluate(() => AtlasJourney.load().pet.coins);
  await page.goto(base + 'index.html#lesson/linear-equations');
  await page.waitForFunction(() => window.MathAtlas && window.AtlasJourney);
  await page.locator('#mode-practice').click();
  await page.locator('#answer-input').fill(String(await page.evaluate(() => MathAtlas.getState().answer)));
  await page.locator('#answer-form button[type="submit"]').click();
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeLibrary + 5);
  await page.locator('#answer-form button[type="submit"]').click();
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeLibrary + 5, 'Repeated checks must not duplicate a library award');
  await page.locator('#pets-open').click();
  assert.equal(await page.locator('#pet-coin-count').textContent(), (beforeLibrary + 5) + ' coins');
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.equipped.charm), 'leaf-charm');
  await page.locator('#pet-close').click();
  await page.goto(base + 'adventure.html');
  await ready(page);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), beforeLibrary + 5);

  // The complete student side keeps working when persistent storage is unavailable.
  const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Unavailable', 'SecurityError'); } }); });
  const withoutStorage = await blocked.newPage();
  observe(withoutStorage, 'storage denied: ');
  await withoutStorage.goto(base + 'adventure.html#mission/meadow-count');
  await withoutStorage.waitForFunction(() => window.AtlasJourney && document.body.dataset.adventureView === 'mission');
  assert.equal(await withoutStorage.evaluate(() => AtlasJourney.storageAvailable()), false);
  for (let step = 0; step < 3; step++) await advanceCorrectly(withoutStorage);
  await withoutStorage.locator('#pets-open').click();
  assert.equal(await withoutStorage.locator('#pet-storage-note').isVisible(), true);
  await blocked.close();
  }

  await rendererRegressions(page);

  if (process.env.ATLAS_SCREENSHOT_DIR) {
    const directory = resolve(process.env.ATLAS_SCREENSHOT_DIR);
    await mkdir(directory, { recursive: true });
    await page.setViewportSize({ width: 1440, height: 1050 });
    await map(page);
    await page.locator('#adventure-preferences-open').click();
    await page.locator('#adventure-calm').uncheck();
    await page.locator('#adventure-rewards').check();
    await page.locator('#adventure-preferences-done').click();
    await page.locator('#adventure-band-picker [data-band="early"]').click();
    await page.screenshot({ path: resolve(directory, 'math-atlas-adventure.png'), fullPage: true });
    await page.locator('#pets-open').click();
    await page.screenshot({ path: resolve(directory, 'math-atlas-companions.png') });
    await page.locator('#pet-close').click();
    await page.locator('.mission-card[data-mission="clock-halves"]').click();
    await page.screenshot({ path: resolve(directory, 'math-atlas-clock-mission.png'), fullPage: true });
  }
  assert.deepEqual(errors, [], 'Uncaught student-side browser errors');
  assert.deepEqual(failed, [], 'Failed student-side assets');
  console.log('Asset loading and browser error checks passed.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
