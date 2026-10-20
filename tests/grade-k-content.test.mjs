import test from 'node:test';
import assert from 'node:assert/strict';
import { kMissions, kTaskFor, kConcepts, kUnits } from '../src/grade-k-content.mjs';
import { checkTask } from '../src/adventure-model.mjs';

// Independently hand-worked canonical examples. These values are deliberately
// literal, so a wrong production formula cannot produce its own answer key.
const answers = {
  'count-picnic': ['3', 5, '8'],
  'empty-nest': ['0', '0', 1],
  'one-more': [4, '5', 6],
  'count-same': ['5', '5', 'same'],
  'fill-ten': [6, '4', 10],
  'teen-bundles': ['13', '3', '10+3'],
  'build-teen': [12, { tens: 1, ones: 2 }, 13],
  'count-forward': ['16', 17, '18'],
  'match-bags': ['right', 4, 'equal'],
  'compare-numerals': ['7', '6', 'equal'],
  'split-five': [4, 3, { left: 3, right: 2 }],
  'make-ten': ['3', 10, 3],
  'add-arrivals': [3, 4, 5],
  'add-parts': ['5', 5, '2+3=5'],
  'take-away': ['4', 2, '4'],
  'missing-snacks': [3, '3', 3],
  'ribbon-length': ['right', 'left', 'equal'],
  'tower-height': ['right', 'left', 'equal'],
  'shape-sort': ['2', 'circle', '3'],
  'category-count': ['triangle', '4', 'shape'],
  'flat-shapes': ['triangle', '3', 'triangle'],
  'solid-shapes': ['cube', 'first', 'solid'],
  'turn-shapes': ['square', 'no', '4'],
  'shapes-together': ['circle', 'above', 'square']
};

test('Kindergarten adds 24 original lessons arranged in six four-lesson units', () => {
  assert.equal(kMissions.length, 24);
  assert.deepEqual(kMissions.map(m => m.id).sort(), Object.keys(answers).map(id => 'ky-' + id).sort());
  assert.equal(new Set(kMissions.map(m => m.id)).size, 24);
  assert.deepEqual(kMissions.map(m => m.order), Array.from({ length: 24 }, (_, i) => 200 + i));
  assert.equal(kUnits.length, 6);
  assert.deepEqual(kUnits.flatMap(u => u.missionIds), kMissions.map(m => m.id));
  for (const [index, unit] of kUnits.entries()) {
    assert.equal(unit.id, `k-unit-${index + 1}`);
    assert.equal(unit.sequence, index + 1);
    assert.equal(unit.weeks, 6);
    assert.equal(unit.missionIds.length, 4);
    for (const key of ['methods', 'prerequisiteSkills', 'everydayPractice', 'standards', 'sourceUrls']) assert.ok(unit[key].length > 0, `${unit.id} ${key}`);
    assert.deepEqual(unit.prerequisiteMissionIds, []);
    assert.deepEqual(unit.reviewMissionIds, []);
    assert.ok(unit.sourceUrls.every(url => url.startsWith('https://www.thecorestandards.org/Math/Content/K/')));
  }
  for (const mission of kMissions) {
    assert.equal(mission.bandId, 'early');
    assert.deepEqual(mission.gradeIds, ['k']);
    assert.match(mission.unitId, /^k-unit-[1-6]$/);
    assert.ok(['counting', 'place-value', 'addition', 'subtraction', 'measuring', 'data', 'geometry'].includes(mission.topicId));
    assert.equal(mission.conceptKey, mission.conceptId);
    assert.ok(kConcepts.some(c => c.id === mission.conceptId));
    assert.ok(mission.standards.length > 0 && mission.standards.every(s => /^K\.(CC|OA|NBT|MD|G)\.[A-C]\.[1-7][abc]?$/.test(s)));
    assert.deepEqual(mission.sourceIds, [], 'original content does not claim to be an imported adaptation');
    for (const key of ['goal', 'prerequisite', 'workedExample', 'explainPrompt', 'reviewPrompt']) assert.ok(mission.lessonPlan[key].length >= 20, `${mission.id} ${key}`);
    assert.ok(!/mastery achieved|full.year coverage|certif|fluently/.test(mission.goal));
  }
});

test('all 72 Kindergarten canonical answers match independently worked examples', () => {
  let total = 0;
  for (const [suffix, expected] of Object.entries(answers)) for (let step = 0; step < 3; step++) {
    const task = kTaskFor('ky-' + suffix, step, 1);
    assert.deepEqual(task.expected, expected[step], `${suffix}:${step}`);
    assert.equal(checkTask(task, expected[step]).correct, true, `${suffix}:${step} accepted`);
    total++;
  }
  assert.equal(total, 72);
});

test('a second independent example covers each of the 24 Kindergarten lessons', () => {
  const examples = [
    ['count-picnic', 1, 6], ['empty-nest', 2, 2], ['one-more', 2, 8], ['count-same', 0, '7'],
    ['fill-ten', 1, '3'], ['teen-bundles', 2, '10+5'], ['build-teen', 1, { tens: 1, ones: 4 }], ['count-forward', 2, '19'],
    ['match-bags', 1, 5], ['compare-numerals', 1, '7'], ['split-five', 2, { left: 4, right: 1 }], ['make-ten', 0, '4'],
    ['add-arrivals', 2, 7], ['add-parts', 2, '3+4=7'], ['take-away', 1, 3], ['missing-snacks', 2, 4],
    ['ribbon-length', 2, 'equal'], ['tower-height', 0, 'right'], ['shape-sort', 0, '3'], ['category-count', 0, 'square'],
    ['flat-shapes', 1, '4'], ['solid-shapes', 0, 'sphere'], ['turn-shapes', 2, '3'], ['shapes-together', 2, 'rectangle']
  ];
  assert.equal(examples.length, 24);
  assert.equal(new Set(examples.map(e => e[0])).size, 24);
  for (const [suffix, step, expected] of examples) assert.deepEqual(kTaskFor('ky-' + suffix, step, 2).expected, expected, suffix);
});

test('every bounded variation is reachable by tapping controls or choices, with no required typing', () => {
  for (const mission of kMissions) for (const seed of [-8, -1, 0, 1, 2, 3, 17, Number.MAX_SAFE_INTEGER]) for (let step = 0; step < 3; step++) {
    const task = kTaskFor(mission.id, step, seed);
    assert.deepEqual(task, kTaskFor(mission.id, step, seed), 'deterministic replay');
    assert.equal(checkTask(task, task.expected).correct, true);
    for (const key of ['prompt', 'instruction', 'hint', 'explanation', 'why']) assert.ok(task[key].length > 0 && !task[key].includes('undefined'), `${mission.id}:${step} ${key}`);
    assert.ok(task.prompt.length < 160 && task.instruction.length < 180);
    if (task.answer.kind === 'choice') {
      assert.ok(task.choices.length >= 2);
      assert.equal(task.choices.length, new Set(task.choices.map(c => c.value)).size);
      assert.ok(task.choices.some(c => c.value === task.expected));
      const wrong = task.choices.find(c => c.value !== task.expected);
      assert.equal(checkTask(task, wrong.value).correct, false);
      assert.equal(task.inputs.length, 0);
    } else {
      const keys = task.answer.kind === 'pair' ? task.answer.keys : [task.answer.key];
      assert.ok(keys.length > 0 && keys.every(key => task.inputs.some(i => i.key === key)), `${mission.id}:${step} binds every answer to a control`);
      for (const input of task.inputs) {
        assert.ok([input.min, input.max, input.initial, input.step].every(Number.isInteger));
        assert.ok(input.min >= 0 && input.max <= 20 && input.min <= input.initial && input.initial <= input.max && input.step === 1);
        const goal = task.answer.kind === 'pair' ? task.expected[input.key] : task.expected;
        assert.ok(goal >= input.min && goal <= input.max, `${mission.id} target is reachable`);
      }
      const initial = task.answer.kind === 'pair' ? Object.fromEntries(task.inputs.map(i => [i.key, i.initial])) : task.inputs.find(i => i.key === task.answer.key).initial;
      assert.equal(checkTask(task, initial).correct, false, `${mission.id}:${step} leaves a genuine task to do`);
    }
    if (task.visual.type === 'primary' && task.visual.kind === 'ten-frame') {
      assert.ok([10, 20].includes(task.visual.capacity));
      assert.ok(task.visual.count >= 0 && task.visual.count <= task.visual.capacity);
    }
    if (task.visual.type === 'count') assert.ok(task.visual.count >= 0 && task.visual.count <= 10, 'tap-count acorns fit the existing picture');
    if (task.visual.type === 'blocks') assert.ok(task.visual.start <= 10 && task.visual.remove <= task.visual.start);
    if (task.visual.kind === 'comparison') assert.ok(task.visual.left >= 0 && task.visual.left <= 10 && task.visual.right >= 0 && task.visual.right <= 10);
    if (task.visual.kind === 'shapes') assert.ok(task.visual.shapes.length <= 10);
  }
});

test('all 24 lessons have three distinct bounded problem sets, cycling safely for negative and large seeds', () => {
  for (const mission of kMissions) {
    const sets = [1, 2, 3].map(seed => JSON.stringify([0, 1, 2].map(step => {
      const { prompt, visual, expected } = kTaskFor(mission.id, step, seed);
      return { prompt, visual, expected };
    })));
    assert.equal(new Set(sets).size, 3, mission.id);
    for (const seed of [-8, -1, 0, 1, 2, 3, 17, Number.MAX_SAFE_INTEGER]) for (let step = 0; step < 3; step++) {
      const canonical = ((seed % 3 - 1) % 3 + 3) % 3 + 1;
      assert.deepEqual(kTaskFor(mission.id, step, seed).expected, kTaskFor(mission.id, step, canonical).expected);
    }
  }
});

test('parts, take-away stories, teen numbers, and direct comparisons preserve their quantities', () => {
  for (const seed of [1, 2, 3]) {
    const teen = kTaskFor('ky-build-teen', 1, seed);
    assert.equal(10 * teen.expected.tens + teen.expected.ones, [12, 14, 18][seed - 1]);
    const split = kTaskFor('ky-split-five', 2, seed);
    assert.equal(split.expected.left + split.expected.right, 5);
    const ten = kTaskFor('ky-make-ten', 2, seed);
    assert.equal(ten.visual.left + ten.expected, 10);
    const away = kTaskFor('ky-take-away', 2, seed);
    assert.equal(Number(away.expected), away.visual.start - away.visual.remove);
    const missing = kTaskFor('ky-missing-snacks', 2, seed);
    assert.equal(missing.visual.start - missing.expected, [2, 3, 4][seed - 1]);
    for (const suffix of ['ribbon-length', 'tower-height']) {
      const more = kTaskFor('ky-' + suffix, 0, seed), less = kTaskFor('ky-' + suffix, 1, seed), equal = kTaskFor('ky-' + suffix, 2, seed);
      assert.ok(more.visual.lengths[1] > more.visual.lengths[0]);
      assert.ok(less.visual.lengths[0] < less.visual.lengths[1]);
      assert.equal(equal.visual.lengths[0], equal.visual.lengths[1]);
      assert.equal(more.visual.orientation, suffix === 'tower-height' ? 'vertical' : 'horizontal');
    }
  }
});

test('eight short concept families provide concrete examples before independent practice', () => {
  assert.equal(kConcepts.length, 8);
  assert.equal(new Set(kConcepts.map(c => c.id)).size, 8);
  assert.deepEqual(kConcepts.map(c => c.id).sort(), [...new Set(kMissions.map(m => m.conceptKey))].sort());
  for (const concept of kConcepts) {
    assert.match(concept.id, /^k-/);
    assert.deepEqual(concept.bandIds, ['early']);
    assert.deepEqual(concept.missionIds, []);
    assert.ok(concept.steps.length >= 3 && concept.steps.length <= 5);
    assert.ok(concept.parentTip.length > 50);
    for (const step of concept.steps) for (const key of ['title', 'body', 'caption', 'actionLabel']) assert.ok(step[key].length > 0);
    for (const step of concept.steps) assert.ok(step.body.length <= 155, 'one short concept step at a time');
  }
  assert.deepEqual(kConcepts.find(c => c.id === 'k-add').steps[1].visual, { type: 'primary', kind: 'comparison', left: 1, right: 4, labels: ['Left group', 'Right group'] });
  assert.deepEqual(kConcepts.find(c => c.id === 'k-subtract').steps[1].visual, { type: 'blocks', start: 5, remove: 2 });
  assert.ok(kConcepts.find(c => c.id === 'k-shapes').steps.some(c => c.visual.compose === 'rectangle'));
});

test('invalid Kindergarten dispatch fails safely', () => {
  assert.equal(kTaskFor('missing'), null);
  for (const step of [-1, 3, 1.1, '1']) assert.throws(() => kTaskFor('ky-fill-ten', step), RangeError);
  for (const seed of [NaN, Infinity, 1.1, '1']) assert.throws(() => kTaskFor('ky-fill-ten', 0, seed), TypeError);
});
