import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createPreviewServer } from '../scripts/serve.mjs';
import { build } from '../scripts/build.mjs';
import { ageBands, missions, taskFor } from '../src/adventure-model.mjs';
import { conceptFor } from '../src/concepts-model.mjs';
import { missionPlacement } from '../src/curriculum-map.mjs';

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
const divisionIds = new Set(missions.filter(mission => missionPlacement(mission).topicId === 'division'&&!/^g[45]y-/.test(mission.id)).map(mission => mission.id));
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
  const bounds = await control.evaluate(node => ({ min:Number(node.min), step:Number(node.step) }));
  if (bounds.step > 0 && bounds.step < 1 && Math.abs(bounds.step * 10 - Math.round(bounds.step * 10)) > 1e-8) {
    const steps = Math.round((Number(value) - bounds.min) / bounds.step);
    assert.ok(Math.abs(bounds.min + steps * bounds.step - Number(value)) < 1e-8, 'The fractional target lies on a real control step');
    await control.focus();
    await control.press('Home');
    for (let i = 0; i < steps; i++) await control.press('ArrowRight');
    return;
  }
  await control.fill(String(value));
  await control.dispatchEvent('input');
}

async function modelControlValue(page, task, key) {
  const saved = await page.evaluate(() => AtlasJourney.load().inProgress);
  const def = task.inputs.find(input => input.key === key);
  return Number(saved.manipulated?.[task.step]?.[key] ?? task.visual[key] ?? def?.initial);
}

async function setControlWithButtons(page, task, key, target) {
  const def = task.inputs.find(input => input.key === key);
  assert.ok(def, task.id + ': a build quantity needs a defined control');
  assert.ok(Number.isFinite(target) && target >= def.min && target <= def.max, task.id + ': the build target fits the control');
  const current = await modelControlValue(page, task, key);
  const step = def.step || 1;
  const distance = (target - current) / step;
  assert.equal(Number.isInteger(distance), true, task.id + ': the build uses whole control steps');
  const delta = Math.sign(distance);
  for (let count = 0; count < Math.abs(distance); count++) {
    const button = page.locator(`#mission-visual [data-control-bump="${key}"][data-delta="${delta}"]`);
    assert.equal(await button.isDisabled(), false, task.id + ': the next build action is available');
    await button.click();
  }
  assert.equal(await modelControlValue(page, task, key), target, task.id + ': actual buttons changed the model');
}

async function buildDivisionAnswer(page, task, response) {
  if (task.answer.derived?.kind === 'product') {
    const keys = task.answer.derived.keys;
    const variable = keys.filter(key => { const def = task.inputs.find(input => input.key === key); return def && def.min !== def.max; });
    assert.equal(variable.length, 1, task.id + ': a missing whole keeps the known share fixed');
    let fixed = 1;
    for (const key of keys.filter(key => key !== variable[0])) fixed *= await modelControlValue(page, task, key);
    assert.ok(fixed > 0, task.id + ': a product build uses a positive known share');
    await setControlWithButtons(page, task, variable[0], Number(response) / fixed);
  } else {
    assert.ok(task.answer.key, task.id + ': division answers come from an actual build quantity');
    await setControlWithButtons(page, task, task.answer.key, Number(response));
  }
}

async function answerTask(page, task, response = task.expected) {
  if (task.handsOn?.type === 'division' && task.answer.kind === 'number') {
    await buildDivisionAnswer(page, task, response);
  } else if (task.answer.kind === 'choice') {
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
  assert.equal(await page.locator('#mission-visual').evaluate(node => /NaN|Infinity/.test(node.innerHTML)), false, task.id + ': predictions keep finite geometry');
  await page.locator('#adventure-next').click();
}

async function map(page) {
  if (await page.locator('#adventure-intro').isVisible()) await page.locator('#concept-exit').click();
  if (await page.locator('#adventure-finish').isVisible()) await page.locator('#finish-map').click();
  else if (await page.locator('#adventure-mission').isVisible()) await page.locator('#adventure-pause').click();
  assert.equal(await page.locator('#adventure-home').isVisible(), true);
}

async function finishIntroduction(page, mission) {
  const concept = conceptFor(mission);
  assert.ok(concept, mission.id + ' has an introduction to its idea');
  if (!await page.locator('#adventure-intro').isVisible()) return;
  const before = await page.evaluate(() => AtlasJourney.load().pet.coins);
  const alreadySeen = await page.evaluate(id => Boolean(AtlasJourney.load().conceptSeen[id]), concept.id);
  for (let step = 0; step < concept.steps.length; step++) {
    assert.equal(await page.locator('#concept-position').textContent(), `Part ${step + 1} of ${concept.steps.length}`, concept.id);
    assert.equal(await page.locator('#adventure-mission').isVisible(), false, 'Teaching comes before a quiz');
    assert.equal(await page.locator('#concept-visual>svg').count(), 1, concept.id + ' teaching visual');
    assert.equal(await page.locator('#concept-visual').evaluate(node => /NaN|Infinity/.test(node.innerHTML)), false, concept.id + ' finite teaching geometry');
    assert.equal(await page.evaluate(id => Boolean(AtlasJourney.load().conceptSeen[id]), concept.id), alreadySeen, 'Looking at a card does not mark the concept seen');
    assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), before, 'Explanations have no coin award or cost');
    if (step < concept.steps.length - 1) await page.locator('#concept-next').click();
  }
  await page.locator('#concept-start').click();
  assert.ok(await page.evaluate(id => AtlasJourney.load().conceptSeen[id], concept.id), 'Only the final practice button records having seen the idea');
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), before);
}

async function enterMission(page, mission, { teach = true } = {}) {
  await map(page);
  await page.locator(`#adventure-band-picker [data-band="${mission.bandId}"]`).click();
  await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();
  if (teach) await finishIntroduction(page, mission);
  else return;
  assert.equal(await page.locator('#adventure-mission').isVisible(), true);
  assert.equal(await page.locator('#mission-title').innerText(), mission.title);
}

async function teachingAndAccessRegressions(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();
  observe(page, 'teaching: ');
  await page.goto(base + 'adventure.html#mission/meadow-fractions');
  await ready(page);
  assert.equal(await page.locator('#adventure-intro').isVisible(), true, 'A new fraction learner meets the concept before being asked to solve');
  assert.deepEqual(await page.evaluate(() => { const s = MathReading.getSettings(); return {font:s.font,size:s.size,line:s.line,oneStep:s.oneStep}; }), {font:'system',size:1.12,line:1.9,oneStep:true});
  assert.equal(await page.locator('#concept-parent-tip').isVisible(), false, 'Parent guidance is available without adding to the first reading task');
  assert.equal(await page.locator('#concept-visual [data-concept-piece]').count(), 1, 'Start with one whole');
  assert.equal(await page.locator('#concept-motion').textContent(), 'Play motion', 'Motion waits for an action');
  assert.equal(await page.locator('#concept-visual').evaluate(node => node.getAnimations({subtree:true}).length), 0, 'No animation starts while reading the first card');
  const firstPosition = await page.locator('#concept-position').textContent();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#concept-position').textContent(), firstPosition, 'The learner controls when to advance');
  await page.locator('#concept-next').click();
  const equalWidths = await page.locator('#concept-visual [data-concept-piece]').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('width'))));
  assert.equal(equalWidths.length, 8);
  assert.equal(new Set(equalWidths).size, 1, 'Eight parts are geometrically equal');
  assert.equal(await page.evaluate(() => AtlasJourney.load().conceptSeen.fractions), undefined);
  await page.locator('#concept-next').click();
  assert.equal(await page.locator('#concept-visual rect[data-concept-fill]').count(), 3, 'Three of eight parts are actually selected');
  const fourthPiece = page.locator('#concept-piece-controls [data-concept-select="3"]');
  assert.ok((await fourthPiece.boundingBox()).height >= 44, 'Piece buttons have large touch targets');
  await fourthPiece.focus();
  await fourthPiece.press('Enter');
  assert.equal(await page.locator('#concept-visual rect[data-concept-fill]').count(), 4);
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.conceptSelect), '3', 'Keyboard focus survives a teaching model change');
  await page.locator('#concept-piece-controls [data-concept-select="3"]').press('Space');
  assert.equal(await page.locator('#concept-visual rect[data-concept-fill]').count(), 3);
  await page.locator('#concept-next').click();
  assert.match(await page.locator('[data-concept-notation]').textContent(), /3.*8.*equal parts/s);
  assert.match(await page.locator('#concept-step-body').textContent(), /top number.*bottom number/s);
  if (process.env.ATLAS_SCREENSHOT_DIR) {
    const directory = resolve(process.env.ATLAS_SCREENSHOT_DIR);
    await mkdir(directory, { recursive: true });
    await page.waitForFunction(() => !document.getElementById('concept-visual').getAnimations({subtree:true}).some(animation => animation.playState === 'running'));
    await page.screenshot({path:resolve(directory, 'math-atlas-fraction-introduction.png'),fullPage:true});
  }
  await page.locator('#concept-next').click();
  const unequalWidths = await page.locator('#concept-visual [data-concept-piece]').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('width'))));
  assert.equal(unequalWidths.length, 4);
  assert.ok(new Set(unequalWidths).size > 1, 'The unequal-parts warning really draws unequal pieces');
  assert.equal(unequalWidths.slice(0,3).reduce((sum, width) => sum + width, 0), unequalWidths[3], 'Three selected unequal pieces cover half the bar');
  await page.locator('#concept-exit').click();
  assert.equal(await page.locator('#adventure-home').isVisible(), true);
  assert.equal(await page.evaluate(() => AtlasJourney.load().conceptSeen.fractions), undefined, 'Leaving an unfinished explanation preserves its unseen state');
  await enterMission(page, missions.find(mission => mission.id === 'meadow-fractions'));
  const session = await page.evaluate(() => AtlasJourney.load().inProgress);
  await page.locator('#mission-concept-open').click();
  assert.equal(await page.locator('#adventure-intro').isVisible(), true, 'Help stays one button away after viewing an idea');
  await page.locator('#concept-exit').click();
  assert.deepEqual(await page.evaluate(() => AtlasJourney.load().inProgress), session, 'Reopening an explanation preserves the challenge');
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), 20);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#mission-concept-open').click();
  assert.equal(await page.locator('#concept-motion').isDisabled(), true, 'The operating-system reduced-motion choice is respected');
  await page.locator('#concept-next').click();
  assert.equal(await page.locator('#concept-visual').evaluate(node => node.getAnimations({subtree:true}).length), 0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#reading-open').click();
  await page.locator('[data-reading-preset="adhd"]').click();
  await page.locator('#reading-done').click();
  assert.equal(await page.locator('#concept-motion').isDisabled(), true, 'Reading support can also reduce motion');
  assert.equal(await page.locator('body').evaluate(node => node.classList.contains('focus-support')), true);
  await page.locator('#reading-open').click();
  await page.locator('#reading-reset').click();
  await page.locator('#reading-done').click();
  await page.locator('#concept-exit').click();
  await map(page);
  await enterMission(page, missions.find(mission => mission.id === 'meadow-count'), {teach:false});
  const teachingAcorn = page.locator('#concept-visual [data-count-object="0"]');
  await teachingAcorn.click();
  await page.locator('#concept-visual [data-count-object="0"]').click();
  assert.equal(await page.locator('#concept-visual .is-counted').count(), 1, 'An introductory acorn receives only one count');
  await page.locator('#concept-visual [data-reset-count]').click();
  assert.equal(await page.locator('#concept-visual .is-counted').count(), 0);
  await page.locator('#concept-visual [data-count-object="0"]').focus();
  await page.locator('#concept-visual [data-count-object="0"]').press('Space');
  assert.equal(await page.locator('#concept-visual .is-counted').count(), 1, 'The teaching picture responds to the keyboard');
  assert.equal(await page.evaluate(() => document.activeElement?.closest('#concept-visual')?.id), 'concept-visual', 'Introductory counting keeps focus in the visible model');
  await page.locator('#concept-next').click();
  assert.equal(await page.locator('#concept-visual .is-counted').count(), 0, 'A new teaching picture starts with a fresh count');
  await page.locator('#concept-exit').click();
  if (process.env.ATLAS_SCREENSHOT_DIR) {
    await page.locator('#adventure-band-picker [data-band="pre-k"]').click();
    await page.screenshot({path:resolve(process.env.ATLAS_SCREENSHOT_DIR, 'math-atlas-young-adventure.png'),fullPage:true});
  }
  await context.close();
  console.log('Concept-first fraction teaching, equal and unequal geometry, manual pacing, keyboard focus, free support, default readability, and both reduced-motion choices passed.');
}

async function gradeFilterRegressions(browser) {
  const context = await browser.newContext({viewport:{width:390,height:844}});
  const page = await context.newPage();
  observe(page, 'grade filters: ');
  await page.goto(base + 'adventure.html');
  await ready(page);
  const unrelated = missions.find(mission => mission.bandId === 'middle');
  await enterMission(page, unrelated);
  await map(page);
  const current = await page.evaluate(() => AtlasJourney.load().inProgress.missionId);
  assert.equal(current, unrelated.id);
  await page.locator('#journey-grade').selectOption('3');
  await page.locator('#journey-topic').selectOption('multiplication');
  async function correctCards(topic) {
    const ids = await page.locator('.mission-card[data-mission]').evaluateAll(nodes => nodes.map(node => node.dataset.mission));
    assert.ok(ids.length >= 2, 'Grade 3 has a useful set of ' + topic + ' activities');
    for (const id of ids) {
      const placement = missionPlacement(id);
      assert.ok(placement.gradeIds.includes('3'), id + ' belongs to Grade 3');
      assert.equal(placement.topicId, topic, id + ' matches the selected topic');
    }
    assert.ok(ids.includes(await page.locator('#adventure-start').getAttribute('data-mission')), 'The start button points to the chosen learning path');
    assert.notEqual(await page.locator('#adventure-start').getAttribute('data-mission'), current, 'An unrelated paused mission does not override this topic selection');
    await noOverflow(page, 'Grade 3 ' + topic + ' filters on mobile');
    return ids;
  }
  const multiplication = await correctCards('multiplication');
  if (process.env.ATLAS_SCREENSHOT_DIR) {
    await page.setViewportSize({width:1440,height:1050});
    await page.screenshot({path:resolve(process.env.ATLAS_SCREENSHOT_DIR,'math-atlas-grade-three-multiplication.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
  }
  await page.reload();
  await ready(page);
  assert.equal(await page.locator('#journey-grade').inputValue(), '3');
  assert.equal(await page.locator('#journey-topic').inputValue(), 'multiplication');
  assert.deepEqual(await correctCards('multiplication'), multiplication, 'The selected grade and topic survive reload');
  await page.locator('#journey-topic').selectOption('division');
  await correctCards('division');
  await page.locator('[data-grade-three-topic="multiplication"]').click();
  await correctCards('multiplication');
  await page.locator('[data-grade-three-topic="division"]').click();
  await correctCards('division');
  assert.equal(await page.locator('[data-grade-three-topic="division"]').getAttribute('aria-pressed'), 'true');
  // A grade may intentionally include a useful activity from a younger stage.
  // Visiting that activity must not throw away the chosen grade on return.
  await page.locator('#journey-topic').selectOption('time');
  const clockMission = missions.find(mission => mission.id === 'clock-quarters');
  await page.locator(`.mission-card[data-mission="${clockMission.id}"]`).click();
  await finishIntroduction(page, clockMission);
  await map(page);
  assert.equal(await page.locator('#journey-grade').inputValue(), '3', 'A cross-stage clock activity keeps the chosen grade');
  assert.equal(await page.locator('#journey-topic').inputValue(), 'time');
  await page.locator('#journey-grade').selectOption('12');
  await page.locator('#journey-topic').selectOption('calculus');
  const calculusMission = missions.find(mission => mission.id === 'campus-slope');
  await page.locator(`.mission-card[data-mission="${calculusMission.id}"]`).click();
  await finishIntroduction(page, calculusMission);
  await map(page);
  assert.equal(await page.locator('#journey-grade').inputValue(), '12', 'A college-stage calculus activity keeps Grade 12 selection');
  assert.equal(await page.locator('#journey-topic').inputValue(), 'calculus');
  await page.locator('#journey-grade').selectOption('pre-k');
  await page.locator('#journey-topic').selectOption('calculus');
  assert.equal(await page.locator('#journey-empty').isVisible(), true, 'Empty combinations give a helpful way back');
  assert.equal(await page.locator('#adventure-start').isDisabled(), true, 'An empty topic does not start an unrelated mission');
  await page.locator('#journey-empty-clear').click();
  assert.equal(await page.locator('#journey-grade').inputValue(), 'all');
  assert.equal(await page.locator('#journey-topic').inputValue(), 'all');
  assert.equal(await page.locator('#journey-empty').isVisible(), false);
  assert.ok(await page.locator('.mission-card[data-mission]').count() > 0);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), 20, 'Choosing a learning path never changes rewards');
  await context.close();
  console.log('Grade 3 multiplication/division filters, topic shortcuts, mobile fit, saved selection, empty-state reset, and relevant resume behavior passed.');
}

async function divisionBuilderRegressions(browser) {
  const context = await browser.newContext({viewport:{width:1440,height:1050}});
  const page = await context.newPage();
  observe(page, 'division builders: ');
  await page.goto(base + 'adventure.html');
  await ready(page);
  assert.equal(divisionIds.size, 16, 'All sixteen division missions share the hands-on approach');
  const examples = ['picnic-share-bags','g3-div-share-plates','g3-div-box-groups','g3-div-missing-total','g3-div-one-zero'];
  let savedScreenshot = false;
  for (const id of examples) {
    await enterMission(page, missions.find(mission => mission.id === id));
    for (let step = 0; step < 3; step++) {
      const task = await currentTask(page);
      if (id === 'picnic-share-bags' && step === 0) {
        const fixedRows = task.inputs.find(input => input.key === 'rows');
        assert.equal(fixedRows.min, fixedRows.max, 'The number of bags is given by the question');
        await page.evaluate(() => {
          const progress = AtlasJourney.load().inProgress;
          AtlasJourney.update({inProgress:{...progress,manipulated:{...progress.manipulated,[progress.step]:{...progress.manipulated[progress.step],rows:999,columns:2}}}});
        });
        await page.reload();
        await page.waitForFunction(() => window.AtlasJourney && document.body.dataset.adventureView === 'mission');
        assert.equal(await modelControlValue(page, task, 'rows'), fixedRows.min, 'An older saved build cannot override a newly fixed quantity');
        assert.equal(await modelControlValue(page, task, 'columns'), 2, 'Resuming preserves the child’s valid adjustable quantity');
        assert.equal(await page.locator('#mission-visual [data-division-group]').count(), fixedRows.min);
        assert.equal(await page.locator('#mission-visual [data-division-counter]').count(), fixedRows.min * 2);
        assert.equal(await page.locator('#mission-visual [data-control-bump="rows"]').count(), 0, 'The fixed given is not offered as an editable picture control');
      }
      assert.equal(await page.locator('#adventure-answer-fields input[type="text"],#adventure-answer-fields input[type="number"],#mission-controls input[type="number"]').count(), 0, task.id + ': division can be answered without typing');
      if (task.answer.kind === 'number') {
        assert.equal(task.handsOn?.type, 'division', task.id);
        const changing = task.inputs.find(input => input.min !== input.max);
        assert.ok(changing, task.id + ': the child can change the build');
        const before = await modelControlValue(page, task, changing.key);
        const trial = before + (changing.step || 1);
        assert.ok(trial <= changing.max, task.id + ': the initial build leaves room for adding an item or group');
        await setControlWithButtons(page, task, changing.key, trial);
        const rows = await modelControlValue(page, task, 'rows');
        const columns = await modelControlValue(page, task, 'columns');
        assert.equal(await page.locator('#mission-visual [data-division-counter]').count(), rows * columns, task.id + ': adding changes the actual objects');
        const groupCount = task.handsOn.groupKey === 'columns' ? columns : rows;
        assert.equal(await page.locator('#mission-visual [data-division-group]').count(), groupCount, task.id + ': the right number of groups is visible');
        assert.match(await page.locator('#division-equation').textContent(), /[÷×]/, task.id + ': the equation stays connected to the picture');
        await setControlWithButtons(page, task, changing.key, before);
        assert.equal(await page.locator('#mission-visual [data-division-counter]').count(), (await modelControlValue(page, task, 'rows')) * (await modelControlValue(page, task, 'columns')), task.id + ': taking away reverses the object change');
        const pictureAdd = page.locator(`#mission-visual [data-control-bump="${changing.key}"][data-delta="1"]`);
        await pictureAdd.focus();
        await pictureAdd.press('Space');
        assert.equal(await modelControlValue(page, task, changing.key), trial, task.id + ': keyboard users can add from the picture');
        assert.deepEqual(await page.evaluate(() => { const node=document.activeElement;return {inPicture:Boolean(node?.closest('#mission-visual')),key:node?.dataset.controlBump,delta:node?.dataset.delta}; }), {inPicture:true,key:changing.key,delta:'1'}, task.id + ': redraw keeps keyboard focus on the picture control');
        await setControlWithButtons(page, task, changing.key, before);
        await page.setViewportSize({width:390,height:844});
        await noOverflow(page, task.id + ': division picture fits a phone');
        assert.equal(await page.locator('#mission-visual').evaluate(node => node.scrollWidth > node.clientWidth), false, 'Picture controls fit inside the visual card');
        const pictureButtons = await page.locator('#mission-visual button[data-control-bump]').all();
        const boxes = [];
        for (const button of pictureButtons) {
          const box = await button.boundingBox();
          assert.ok(box && box.width >= 48 && box.height >= 48, task.id + ': on-picture controls are large touch targets');
          boxes.push(box);
        }
        for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++) {
          const a=boxes[i],b=boxes[j];
          assert.ok(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)<=0 || Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)<=0, task.id + ': picture buttons do not overlap');
        }
        if (id === 'picnic-share-bags' && step === 0) {
          await page.locator('#reading-open').click();
          await page.locator('[data-reading-preset="dyslexia"]').click();
          await page.locator('#reading-size').selectOption('1.4');
          await page.locator('#reading-letters').selectOption('0.12');
          await page.locator('#reading-words').selectOption('0.16');
          await page.locator('#reading-line').selectOption('2.1');
          await page.locator('#reading-done').click();
          await noOverflow(page, 'On-picture division controls fit at 390px with 140% text and extra spacing');
          assert.equal(await page.locator('#mission-visual').evaluate(node => node.scrollWidth > node.clientWidth), false);
          for (const button of await page.locator('#mission-visual button[data-control-bump]').all()) {
            const box = await button.boundingBox();
            assert.ok(box && box.width >= 48 && box.height >= 48, 'Reading support preserves large picture controls');
          }
          await page.locator('#reading-open').click();
          await page.locator('#reading-reset').click();
          await page.locator('#reading-done').click();
        }
        await page.setViewportSize({width:1440,height:1050});
        await buildDivisionAnswer(page, task, task.expected);
        const finalRows = await modelControlValue(page, task, 'rows');
        const finalColumns = await modelControlValue(page, task, 'columns');
        assert.equal(await page.locator('#mission-visual [data-division-counter]').count(), finalRows * finalColumns);
        assert.equal(Number((await page.locator('#division-builder-summary [data-build-total]').textContent()).trim()), finalRows * finalColumns, task.id + ': the live total is the count of real counters');
        if (id === 'g3-div-one-zero' && Number(task.expected) === 0) assert.equal(finalRows * finalColumns, 0, 'Zero division draws a genuinely empty collection');
        if (!savedScreenshot && id === 'g3-div-share-plates' && process.env.ATLAS_SCREENSHOT_DIR) {
          const directory = resolve(process.env.ATLAS_SCREENSHOT_DIR);
          await mkdir(directory,{recursive:true});
          await page.screenshot({path:resolve(directory,'math-atlas-division-builder.png'),fullPage:true,animations:'disabled'});
          savedScreenshot = true;
        }
        if (id === 'g3-div-share-plates' && step === 0) {
          await page.reload();
          await page.waitForFunction(() => window.AtlasJourney && document.body.dataset.adventureView === 'mission');
          assert.equal(await page.locator('#mission-visual [data-division-counter]').count(), finalRows * finalColumns, 'A pause/reload keeps the child’s hands-on work');
          assert.equal(await modelControlValue(page, task, 'rows'), finalRows);
          assert.equal(await modelControlValue(page, task, 'columns'), finalColumns);
        }
      }
      await advanceCorrectly(page);
    }
    assert.equal(await page.locator('#adventure-finish').isVisible(), true, id + ': all build/choice steps can be completed');
  }
  await context.close();
  console.log('Hands-on division passed: actual add/take buttons, equal sharing, number of groups, derived whole, zero objects, live equations, and no required typing.');
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

  // Entering a prediction must alter real mathematical geometry, including the
  // newly added graph families, rather than only an answer caption.
  for (const id of ['observatory-line-slope','observatory-growth','observatory-power-pattern','campus-scaled-derivative']) {
    await enterMission(page, missions.find(mission => mission.id === id));
    const task = await currentTask(page);
    assert.equal(await page.locator('#mission-visual [data-function]').getAttribute('data-function'), task.visual.family, id);
    if (task.inputs.length && task.answer.key) {
      const def = task.inputs.find(input => input.key === task.answer.key);
      await setControl(page, def.key, def.min);
      const before = await page.locator('#mission-visual [data-function]').getAttribute('d');
      await setControl(page, def.key, def.max);
      assert.notEqual(await page.locator('#mission-visual [data-function]').getAttribute('d'), before, id + ': changing a control changes the curve');
    } else if (await page.locator('#adventure-answer-number').count()) {
      await page.locator('#adventure-answer-number').fill('1');
      const markerPaths = () => page.locator('#mission-visual [data-answer-marker] path,#mission-visual [data-answer-marker][d]').evaluateAll(nodes => nodes.map(node => node.getAttribute('d')).join('|'));
      const before = await markerPaths();
      await page.locator('#adventure-answer-number').fill('2');
      assert.ok(before.length > 0);
      assert.notEqual(await markerPaths(), before, id + ': proposed answer changes plotted geometry');
    }
  }
  await enterMission(page, missions.find(mission => mission.id === 'campus-interval-integral'));
  for (let step = 0; step < 3; step++) {
    const task = await currentTask(page);
    const from = task.visual.integralStart, to = task.visual.integralEnd;
    assert.equal(await page.locator('#mission-visual [data-signed-region]').count(), 120, 'The definite integral shades only its selected interval');
    if (from < 0 && to <= 0) assert.ok(await page.locator('#mission-visual [data-signed-region="negative"]').count() > 0, 'A below-axis region has negative signed shading');
    if (task.answer.kind === 'number') {
      await page.locator('#adventure-answer-number').fill('1');
      const one = Number(await page.locator('#mission-visual [data-proposal-part]').getAttribute('width'));
      await page.locator('#adventure-answer-number').fill('3');
      const three = Number(await page.locator('#mission-visual [data-proposal-part]').getAttribute('width'));
      assert.ok(one > 0 && Math.abs(three / one - 3) < 1e-8, 'Accumulation predictions resize the actual signed quantity bar');
    } else {
      assert.ok(await page.locator('#mission-visual [data-signed-region="positive"]').count() > 0);
      assert.ok(await page.locator('#mission-visual [data-signed-region="negative"]').count() > 0, 'Zero signed accumulation still shows both real regions');
    }
    await advanceCorrectly(page);
  }
  for (const id of ['campus-vector-scale','campus-vector-difference']) {
    await enterMission(page, missions.find(mission => mission.id === id));
    for (const key of ['x','y']) await page.locator(`[data-answer-key="${key}"]`).fill('1');
    const before = await page.locator('#mission-visual [data-vector-proposal] path').getAttribute('d');
    for (const key of ['x','y']) await page.locator(`[data-answer-key="${key}"]`).fill('2');
    assert.notEqual(await page.locator('#mission-visual [data-vector-proposal] path').getAttribute('d'), before, id + ': vector proposal moves the actual endpoint');
  }
  await enterMission(page, missions.find(mission => mission.id === 'g3-mul-ten-packs'));
  await setControl(page, 'tens', 9);
  assert.equal(await page.locator('#mission-visual [data-tens-rod]').count(), 9);
  assert.equal(await page.locator('#mission-visual polygon[fill="#a4c8df"]').count(), 90, 'Nine tens must draw ninety unit blocks, without an eight-rod clamp');
  assert.match(await page.locator('#mission-visual-caption').textContent(), /9 tens/);
  await enterMission(page, missions.find(mission => mission.id === 'g3-div-two-step'));
  await advanceCorrectly(page);
  const removal = await currentTask(page);
  assert.equal(await page.locator('#mission-visual [data-math-object="removed"]').count(), removal.visual.compareCount, 'A division story shows the objects actually removed');
  assert.equal(await page.locator('#mission-visual [data-math-object="remaining"]').count(), removal.visual.count - removal.visual.compareCount, 'A division story retains only the remaining group');
  assert.equal(await page.locator('#mission-visual [data-math-object]').count(), removal.visual.count, 'Subtraction in a division story conserves its original objects');
  await enterMission(page, missions.find(mission => mission.id === 'g3-div-skip-back'));
  const jumpCount = await currentTask(page);
  await answerTask(page, jumpCount);
  assert.equal(await page.locator('#mission-visual [data-jump-proposal="count"]').getAttribute('data-jump-count'), String(jumpCount.expected), 'The selected quotient represents a number of jumps');
  assert.equal(await page.locator('#mission-visual [data-proposed-jump]').count(), Number(jumpCount.expected), 'A quotient proposal highlights that many actual backward jumps');
  assert.equal(await page.locator('#mission-visual [data-position-proposal]').count(), 0, 'A jump count must not be plotted as an absolute position');
  await page.locator('#adventure-next').click();
  const jumpSize = await currentTask(page);
  await answerTask(page, jumpSize);
  assert.equal(await page.locator('#mission-visual [data-jump-proposal="size"]').getAttribute('data-jump-size'), String(jumpSize.expected), 'The divisor represents the size of each backward jump');
  assert.equal(await page.locator('#mission-visual [data-proposed-jump-size]').count(), 1, 'The proposed jump size has its own real arc');
  assert.equal(await page.locator('#mission-visual [data-position-proposal]').count(), 0, 'A jump size must not be plotted as a destination');
  console.log('Renderer regressions passed: subtraction conservation, clock answers, fraction geometry, fresh replay variants, new function families, signed integral shading, and vector proposal geometry.');
}

try {
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  await divisionBuilderRegressions(browser);
  if (process.env.ATLAS_DIVISION_ONLY !== '1') {
  await teachingAndAccessRegressions(browser);
  await gradeFilterRegressions(browser);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  observe(page);
  await page.goto(base + 'adventure.html');
  await ready(page);
  assert.equal(await page.evaluate(() => AtlasJourney.load().pet.coins), 20);
  assert.equal(await page.locator('#adventure-band-picker [data-band]').count(), ageBands.length);
  assert.equal(await page.locator('#adventure-listen,#adventure-listen-status').count(), 0, 'Student adventure has no voice controls');
  assert.ok(missions.length >= 75, 'The release preserves the original missions and the expanded learning paths');
  assert.equal(await page.evaluate(() => AtlasAdventure.missions.length), missions.length, 'The shipped mission set matches the tested model');

  if (process.env.ATLAS_RENDERER_ONLY !== '1') {
  for (const mission of missions) {
    await enterMission(page, mission);
    const before = await page.evaluate(() => AtlasJourney.load().pet.coins);
    for (let step = 0; step < 3; step++) {
      const task = await currentTask(page);
      assert.equal(task.step, step, mission.id);
      assert.equal(await page.locator('#mission-visual svg').count(), 1, task.id);
      assert.equal(await page.locator('#mission-visual').evaluate(node => /NaN|Infinity/.test(node.innerHTML)), false, task.id);
      if (['g3-mul-split-five','g3-mul-double-double'].includes(mission.id)) {
        const v = task.visual;
        const blue = v.splitColumn !== undefined ? v.rows * Math.min(v.columns, v.splitColumn) : v.columns * Math.min(v.rows,v.splitRow);
        assert.equal(await page.locator('#mission-visual [data-room-geometry] polygon[fill="#a4c8df"]').count(), blue, task.id + ': the blue partial array has the right tile count');
        assert.equal(await page.locator('#mission-visual [data-room-geometry] polygon[fill="#dae6bd"]').count(), v.rows * v.columns - blue, task.id + ': green tiles cover exactly the rest');
        if (task.answer.kind === 'number') {
          await page.locator('#adventure-answer-number').fill(String(task.expected));
          assert.equal(Number(await page.locator('#mission-visual [data-model-quantity]').getAttribute('data-model-quantity')), task.expected, task.id + ': the model comparison uses the asked-for partial quantity');
          assert.equal(await page.locator('#mission-visual [data-model-quantity]').getAttribute('width'), await page.locator('#mission-visual [data-proposal-part]').getAttribute('width'), task.id + ': a correct partial answer aligns both bars');
        }
      }
      if (['pre-k', 'early'].includes(mission.bandId)) {
        assert.equal(await page.locator('#adventure-answer-fields input[type="text"],#adventure-answer-fields input[type="number"],#mission-controls input[type="number"]').count(), 0, task.id + ': younger learners should use choices and manipulatives');
      }
      if (divisionIds.has(mission.id)) {
        assert.equal(await page.locator('#adventure-answer-fields input[type="text"],#adventure-answer-fields input[type="number"],#mission-controls input[type="number"]').count(), 0, task.id + ': every division mission works without typed answers');
        if (task.answer.kind === 'number') {
          assert.equal(task.handsOn?.type, 'division');
          assert.ok(await page.locator('#mission-visual [data-control-bump][data-delta="1"]').count() > 0, task.id + ': large build buttons are available on the picture');
        }
      }
      if (mission.id === missions[0].id && step === 0) {
        const acorn = page.locator('#mission-visual [data-count-object="0"]');
        assert.equal(await acorn.count(), 1, 'Counting begins with a real tappable object');
        await acorn.click();
        assert.equal(await page.locator('#mission-visual [data-count-object="0"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 1');
        await page.locator('#mission-visual [data-count-object="0"]').click();
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 1', 'Each object can only receive one count');
        await page.locator('#mission-visual [data-reset-count]').click();
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 0');
        await page.locator('#mission-visual [data-count-object="0"]').focus();
        await page.locator('#mission-visual [data-count-object="0"]').press('Enter');
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 1', 'Keyboard users can count an object');
        assert.equal(await page.evaluate(() => document.activeElement?.dataset.countObject), '0', 'Keyboard focus survives counting and SVG redraw');
        await page.locator('#mission-visual [data-reset-count]').focus();
        await page.locator('#mission-visual [data-reset-count]').press('Space');
        assert.equal(await page.locator('#mission-readout').textContent(), 'Counted: 0', 'Keyboard users can begin counting again');
        await page.locator('#adventure-hint').click();
        assert.equal(await page.locator('#adventure-hint-text').isVisible(), true);
        const wrong = task.choices.find(choice => String(choice.value) !== String(task.expected));
        await answerTask(page, task, wrong.value);
        assert.equal(await page.locator('#adventure-next').isVisible(), false, 'An incorrect choice must not quietly pass');
        assert.equal(await page.locator('[name="adventure-choice"]:checked').inputValue(), String(wrong.value), 'A mistake keeps the learner’s choice so they can revise it');
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
    assert.equal(await page.locator('#finish-reward').getAttribute('data-awarded'), 'true', 'The celebration identifies an actual new award');
    assert.match(await page.locator('#finish-earned').textContent(), /\+15/, 'Earned coins are visible at the point of completion');
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
  assert.equal(await page.locator('#finish-reward').getAttribute('data-awarded'), 'false', 'Replay celebration does not pretend to award more coins');

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
    await page.locator('#mission-concept-open').click();
    const concept = conceptFor(mission);
    for (let step = 0; step < concept.steps.length; step++) {
      await noOverflow(page, band.id + ' teaching part ' + step + ' at 390px with enlarged/spaced text');
      assert.equal(await page.locator('#concept-visual').evaluate(node => node.scrollWidth > node.clientWidth), false, 'Teaching diagrams fit alongside reading support');
      if (step < concept.steps.length - 1) await page.locator('#concept-next').click();
    }
    await page.locator('#concept-start').click();
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
  await ready(withoutStorage);
  await finishIntroduction(withoutStorage, missions[0]);
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
  }
  assert.deepEqual(errors, [], 'Uncaught student-side browser errors');
  assert.deepEqual(failed, [], 'Failed student-side assets');
  console.log('Asset loading and browser error checks passed.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
