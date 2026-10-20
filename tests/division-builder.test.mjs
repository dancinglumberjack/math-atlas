import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptTask, divisionMissionIds } from '../src/division-builder.mjs';
import { extraMissions, extraTaskFor } from '../src/content-expansion.mjs';
import { taskFor, checkTask } from '../src/adventure-model.mjs';

const getMission = id => extraMissions.find(mission => mission.id === id);
const values = task => Object.fromEntries(task.inputs.map(input => [input.key, input.initial]));
const response = (task, build) => task.answer.derived ? task.answer.derived.keys.reduce((product, key) => product * build[key], 1) : build[task.answer.key];

test('all numeric challenges in the thirteen division missions are answered by a visible build', () => {
  assert.equal(divisionMissionIds.length, 13);
  let numeric = 0;
  for (const id of divisionMissionIds) for (let step = 0; step < 3; step++) {
    const raw = extraTaskFor(id, step, 1);
    const task = taskFor(id, step, 1);
    assert.equal(task.expected, raw.expected, `${id}:${step} preserves seeded answer`);
    for (const key of ['id', 'prompt', 'instruction', 'hint', 'explanation', 'why', 'unit']) assert.equal(task[key], raw[key], `${id}:${step} ${key}`);
    if (raw.answer.kind === 'choice') {
      assert.deepEqual(task, raw, 'choice tasks are preserved unchanged');
    } else {
      numeric++;
      assert.equal(task.handsOn.type, 'division');
      assert.equal(task.answer.kind, 'number');
      assert.ok(task.answer.derived || task.inputs.some(input => input.key === task.answer.key));
      assert.equal(task.visual.type, 'array');
      assert.deepEqual(task.visual.divisionBuilder, task.handsOn);
      assert.deepEqual(task.inputs.map(input => input.key), ['rows', 'columns']);
      const variable = task.inputs.find(input => input.min !== input.max);
      assert.equal(variable.initial, 0);
      assert.equal(variable.min, 0);
      assert.equal(variable.max, 12);
    }
  }
  assert.equal(numeric, 25);
});

test('choices and unrelated lessons remain unchanged, without mutation of authored tasks', () => {
  const choice = extraTaskFor('g3-div-one-zero', 1, 1);
  assert.equal(adaptTask(getMission('g3-div-one-zero'), choice), choice);
  const multiplication = extraTaskFor('g3-mul-missing-factor', 0, 1);
  assert.equal(adaptTask(getMission('g3-mul-missing-factor'), multiplication), multiplication);
  const original = extraTaskFor('g3-div-share-plates', 1, 1), snapshot = structuredClone(original);
  const adapted = adaptTask(getMission(original.missionId), original);
  assert.notEqual(adapted, original);
  assert.deepEqual(original, snapshot);
});

test('canonical group-count and equal-share builds represent the question, not the answer as a prefilled shape', () => {
  const share = taskFor('g3-div-share-plates', 0, 1);
  assert.deepEqual([share.visual.rows, share.visual.columns], [3, 0]);
  assert.deepEqual([share.handsOn.givenTotal, share.handsOn.givenGroups, share.answer.key], [12, 3, 'columns']);
  assert.equal(checkTask(share, 4).correct, true);
  assert.equal(checkTask(share, 3).correct, false);
  const groups = taskFor('g3-div-box-groups', 0, 1);
  assert.deepEqual([groups.visual.rows, groups.visual.columns], [0, 8]);
  assert.deepEqual([groups.handsOn.givenTotal, groups.handsOn.givenEach, groups.answer.key], [24, 8, 'rows']);
  assert.equal(checkTask(groups, 3).correct, true);
  assert.equal(checkTask(groups, 8).correct, false);
});

test('the transposed tray finds items in each column rather than confusing them with the column count', () => {
  const task = taskFor('g3-div-unpack-rows', 1, 1);
  assert.equal(task.handsOn.mode, 'column-share');
  assert.equal(task.handsOn.groupKey, 'columns');
  assert.equal(task.handsOn.shareKey, 'rows');
  assert.deepEqual([task.visual.rows, task.visual.columns], [0, 6]);
  assert.deepEqual([task.handsOn.givenTotal, task.handsOn.givenGroups, task.expected], [18, 6, 3]);
  assert.equal(task.answer.key, 'rows');
});

test('missing-whole responses are derived products with a fixed known group size', () => {
  const task = taskFor('g3-div-missing-total', 1, 1);
  assert.equal(task.expected, 24);
  assert.deepEqual(task.answer.derived, { kind: 'product', keys: ['rows', 'columns'] });
  assert.deepEqual([task.handsOn.givenGroups, task.handsOn.givenEach], [4, 6]);
  assert.equal(task.handsOn.givenTotal, undefined, 'the unknown whole is not supplied as a question target');
  assert.equal(task.visual.targetTotal, undefined);
  const build = values(task);
  assert.deepEqual(build, { rows: 0, columns: 6 });
  assert.equal(response(task, build), 0);
  build.rows = 4;
  assert.equal(response(task, build), 24);
  assert.equal(checkTask(task, response(task, build)).correct, true);
  build.rows = 3;
  assert.equal(checkTask(task, response(task, build)).correct, false);
  const scaffold = taskFor('g3-div-missing-total', 0, 1);
  assert.equal(scaffold.answer.key, 'rows');
  assert.equal(scaffold.handsOn.givenGroups, 4);
  assert.equal(scaffold.handsOn.givenTotal, undefined, 'the preliminary group-building task also keeps the missing whole unnamed');
});

test('the second operation in the picnic story counts remaining bags rather than the original delivery', () => {
  const task = taskFor('g3-div-two-step', 2, 1);
  assert.equal(task.handsOn.mode, 'total');
  assert.deepEqual([task.handsOn.givenGroups, task.handsOn.givenEach, task.expected], [4, 4, 16]);
  const build = { rows: 4, columns: 4 };
  assert.equal(response(task, build), 16);
  assert.equal(checkTask(task, response(task, build)).correct, true);
  assert.equal(checkTask(task, 24).correct, false, 'the original six bags are no longer the relevant group count');
});

test('all seeded numeric builds have reachable whole-object answers and preserve their inverse relationship', () => {
  for (const id of divisionMissionIds) for (let step = 0; step < 3; step++) for (const seed of [-4, 0, 1, 2, 3, 17]) {
    const raw = extraTaskFor(id, step, seed), task = adaptTask(getMission(id), raw);
    assert.deepEqual(task, taskFor(id, step, seed));
    if (!task.handsOn) continue;
    const build = values(task), variable = task.inputs.find(input => input.min !== input.max);
    if (task.answer.derived) build.rows = task.handsOn.givenGroups;
    else build[task.answer.key] = task.expected;
    assert.ok(Number.isInteger(build[variable.key]) && build[variable.key] >= variable.min && build[variable.key] <= variable.max, `${id}:${step} reachable`);
    assert.equal(response(task, build), task.expected, `${id}:${step} seeded answer`);
    assert.equal(checkTask(task, response(task, build)).correct, true);
    if (task.handsOn.givenTotal !== undefined) assert.equal(build.rows * build.columns, task.handsOn.givenTotal);
    assert.equal(build[task.handsOn.groupKey] * build[task.handsOn.shareKey], build.rows * build.columns);
    const wrong = { ...build, [variable.key]: build[variable.key] + 1 };
    assert.equal(checkTask(task, response(task, wrong)).correct, false);
  }
});

test('a numeric zero share builds a genuinely empty collection without inventing a tile', () => {
  const original = extraTaskFor('g3-div-share-plates', 1, 1);
  const zero = { ...original, expected: 0, visual: { ...original.visual, rows: 3, columns: 1, targetTotal: 0 } };
  const task = adaptTask(getMission(zero.missionId), zero);
  assert.deepEqual([task.visual.rows, task.visual.columns, task.handsOn.givenTotal], [3, 0, 0]);
  assert.equal(response(task, values(task)), 0);
  assert.equal(checkTask(task, 0).correct, true);
  assert.equal(checkTask(task, 1).correct, false);
});

test('unsupported source changes fail explicitly instead of assigning the wrong unknown', () => {
  const raw = extraTaskFor('g3-div-share-plates', 1, 1);
  assert.throws(() => adaptTask(getMission(raw.missionId), { ...raw, visual: { type: 'count', count: 12 } }), TypeError);
  assert.throws(() => adaptTask(getMission(raw.missionId), { ...raw, visual: { type: 'array', rows: 0, columns: 1 } }), RangeError);
  assert.throws(() => adaptTask(getMission(raw.missionId), { ...raw, step: 3 }), RangeError);
});
