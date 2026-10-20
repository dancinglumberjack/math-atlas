import test from 'node:test';
import assert from 'node:assert/strict';
import { g1Missions, g1TaskFor, g1Concepts, g1Units } from '../src/grade1-content.mjs';
import { checkTask } from '../src/adventure-model.mjs';

// Literal answers worked separately from the production task calculations.
const answers = {
  'count-forward': ['38', '59', '99'],
  'teen-builder': [{ tens: 1, ones: 4 }, { tens: 1, ones: 8 }, { tens: 1, ones: 1 }],
  'bundles-ten': [2, '50', 8],
  'read-build120': [{ hundreds: 1, tens: 0, ones: 4 }, { hundreds: 1, tens: 1, ones: 2 }, { hundreds: 1, tens: 2, ones: 0 }],
  'count-on': [8, 11, 13],
  'make-ten': [2, 3, 13],
  'doubles': [6, 7, 'one-more'],
  'three-addends': ['outside', 13, 14],
  'take-away': [3, 5, 6],
  'back-through-ten': [3, 2, 8],
  'related-facts': [5, 6, 5],
  'mystery-start': [9, 5, 'equal'],
  'compare-tens': ['greater', 'less', 'equal'],
  'ten-more-less': [{ tens: 4, ones: 6 }, { tens: 2, ones: 6 }, { tens: 5, ones: 6 }],
  'add-tens-ones': [{ tens: 4, ones: 7 }, { tens: 3, ones: 0 }, { tens: 3, ones: 3 }],
  'subtract-tens': [{ tens: 4, ones: 0 }, { tens: 3, ones: 0 }, { tens: 0, ones: 0 }],
  'cube-length': ['6', 'touch', '8'],
  'order-lengths': ['Leaf', 'Ribbon', 'Twig'],
  'forest-votes': ['5', '2', '10'],
  'clock-hours-halves': [4, '4:30', { hour: 5, minute: 30 }],
  'shape-rules': ['3', 'triangle', 'sides'],
  'shape-compose': ['square', 'rectangle', '2'],
  'halves': [1, 2, 'equal'],
  'quarters': [1, 4, 'smaller']
};

test('Grade 1 has 24 original activities in six flexible units with practical lesson notes', () => {
  assert.equal(g1Missions.length, 24);
  assert.equal(new Set(g1Missions.map(m => m.id)).size, 24);
  assert.deepEqual(g1Missions.map(m => m.id).sort(), Object.keys(answers).map(s => 'g1y-' + s).sort());
  assert.equal(g1Units.length, 6);
  assert.equal(g1Units.reduce((sum, u) => sum + u.weeks, 0), 36);
  assert.deepEqual(g1Units.flatMap(u => u.missionIds), g1Missions.map(m => m.id));
  for (const [index, unit] of g1Units.entries()) {
    assert.equal(unit.id, `g1-unit-${index + 1}`);
    assert.equal(unit.sequence, index + 1);
    assert.equal(unit.missionIds.length, 4);
    assert.deepEqual(unit.reviewMissionIds, []);
    assert.deepEqual(unit.prerequisiteMissionIds, []);
    for (const key of ['methods', 'prerequisiteSkills', 'everydayPractice', 'sourceUrls']) assert.ok(unit[key].length > 0, key);
    assert.ok(unit.sourceUrls.every(url => url.startsWith('https://www.thecorestandards.org/Math/Content/1/')));
  }
  for (const mission of g1Missions) {
    assert.deepEqual(mission.gradeIds, ['1']);
    assert.equal(mission.bandId, 'early');
    assert.ok(g1Units.some(u => u.id === mission.unitId));
    assert.ok(g1Concepts.some(c => c.id === mission.conceptKey && c.id === mission.conceptId));
    assert.deepEqual(mission.sourceIds, [], 'All wording and activities are original');
    assert.ok(mission.standards.length > 0 && mission.standards.every(code => /^1\.(?:OA|NBT|MD|G)\.[A-D]\.[1-8][a-c]?$/.test(code)));
    for (const key of ['goal', 'prerequisite', 'workedExample', 'explainPrompt', 'reviewPrompt']) assert.ok(mission.lessonPlan[key].length >= 20, `${mission.id}: ${key}`);
    assert.ok(!/certified|mastery achieved|CA.aligned/.test(mission.goal));
  }
});

test('all 72 Grade 1 canonical challenges match independently hand-worked answers', () => {
  for (const [suffix, expected] of Object.entries(answers)) for (let step = 0; step < 3; step++) {
    const task = g1TaskFor('g1y-' + suffix, step, 1);
    assert.deepEqual(task.expected, expected[step], `${suffix}:${step}`);
    assert.equal(checkTask(task, expected[step]).correct, true, `${suffix}:${step}`);
  }
});

test('every Grade 1 activity has another independently worked seed-two example', () => {
  const expected = {
    'count-forward': '49', 'teen-builder': { tens: 1, ones: 6 }, 'bundles-ten': 3,
    'read-build120': { hundreds: 1, tens: 0, ones: 6 }, 'count-on': 9, 'make-ten': 1,
    'doubles': 10, 'three-addends': 'outside', 'take-away': 3, 'back-through-ten': 4,
    'related-facts': 4, 'mystery-start': 9, 'compare-tens': 'greater',
    'ten-more-less': { tens: 6, ones: 4 }, 'add-tens-ones': { tens: 5, ones: 6 },
    'subtract-tens': { tens: 5, ones: 0 }, 'cube-length': '7', 'order-lengths': 'Leaf',
    'forest-votes': '6', 'clock-hours-halves': 7, 'shape-rules': '3',
    'shape-compose': 'square', 'halves': 1, 'quarters': 1
  };
  assert.equal(Object.keys(expected).length, 24);
  for (const [suffix, answer] of Object.entries(expected)) assert.deepEqual(g1TaskFor('g1y-' + suffix, 0, 2).expected, answer, suffix);
});

test('all bounded variants use reachable controls or tappable choices, never require typing', () => {
  for (const mission of g1Missions) for (const seed of [-8, -1, 0, 1, 2, 3, 17, Number.MAX_SAFE_INTEGER]) for (let step = 0; step < 3; step++) {
    const task = g1TaskFor(mission.id, step, seed);
    assert.deepEqual(task, g1TaskFor(mission.id, step, seed));
    assert.equal(checkTask(task, task.expected).correct, true);
    for (const key of ['prompt', 'instruction', 'hint', 'explanation', 'why']) assert.ok(task[key].length > 0 && !/undefined|NaN/.test(task[key]), `${mission.id}:${step} ${key}`);
    assert.ok(task.prompt.length <= 180, `${mission.id}:${step} short prompt`);
    if (task.answer.kind === 'choice') {
      assert.ok(task.choices.length >= 2);
      assert.equal(new Set(task.choices.map(c => c.value)).size, task.choices.length);
      assert.ok(task.choices.some(c => c.value === task.expected));
      continue;
    }
    const keys = task.answer.kind === 'pair' ? task.answer.keys : [task.answer.key];
    assert.ok(keys.length > 0 && keys.every(key => task.inputs.some(i => i.key === key)), 'Every answer is built with a control');
    for (const input of task.inputs) {
      assert.ok([input.min, input.max, input.step, input.initial].every(Number.isFinite));
      assert.ok(input.min <= input.initial && input.initial <= input.max && input.step > 0);
      assert.ok(Object.hasOwn(task.visual, input.key), `${mission.id}:${step} control ${input.key} changes its visual`);
      const expected = task.answer.kind === 'pair' ? task.expected[input.key] : task.expected;
      assert.ok(expected >= input.min && expected <= input.max, `${mission.id}:${step} reachable`);
      assert.ok(Math.abs((expected - input.min) / input.step - Math.round((expected - input.min) / input.step)) < 1e-8);
    }
    const initial = task.answer.kind === 'pair' ? Object.fromEntries(task.inputs.map(i => [i.key, i.initial])) : task.inputs.find(i => i.key === task.answer.key).initial;
    assert.equal(checkTask(task, initial).correct, false, `${mission.id}:${step} unfinished build`);
  }
});

test('the pictures preserve elementary quantities, units, equal shares, and clock intervals', () => {
  for (const mission of g1Missions) for (const seed of [1, 2, 3]) for (let step = 0; step < 3; step++) {
    const task = g1TaskFor(mission.id, step, seed), visual = task.visual;
    if (visual.type === 'base-ten') {
      for (const key of ['hundreds', 'tens', 'ones']) assert.ok(Number.isInteger(visual[key]) && visual[key] >= 0 && visual[key] <= 9);
      if (task.answer.kind === 'pair') {
        const value = 100 * (task.expected.hundreds || 0) + 10 * task.expected.tens + task.expected.ones;
        assert.ok(value >= 0 && value <= 120);
      }
    }
    if (visual.type === 'primary' && visual.kind === 'ten-frame') assert.ok(visual.capacity === 20 && visual.count >= 0 && visual.count <= 20);
    if (visual.type === 'primary' && visual.kind === 'number-chart') {
      assert.equal(visual.start, 1); assert.equal(visual.end, 120);
      assert.ok(visual.highlight.every(n => Number.isInteger(n) && n >= 1 && n <= 120));
    }
    if (visual.type === 'primary' && visual.kind === 'length') assert.ok(visual.lengths.every(n => Number.isInteger(n) && n > 0 && n <= 10));
    if (visual.type === 'primary' && visual.kind === 'partition') assert.ok([2, 4].includes(visual.parts) && visual.selected >= 0 && visual.selected <= visual.parts);
    if (visual.type === 'primary' && visual.kind === 'shapes' && visual.compose) assert.deepEqual(visual.shapes, visual.compose === 'square' ? ['triangle', 'triangle'] : ['square', 'square']);
    if (visual.type === 'data') {
      assert.equal(visual.key, 1);
      assert.equal(visual.values.length, 3);
      assert.ok(visual.values.every(n => Number.isInteger(n) && n >= 0 && n <= visual.max));
    }
    if (visual.type === 'clock') assert.ok(visual.hour >= 1 && visual.hour <= 12 && [0, 30].includes(visual.minute));
    if (visual.type === 'count') assert.ok(visual.count <= 20 && visual.compareCount <= visual.count);
  }
});

test('eight Grade 1 teaching concepts have four short worked steps and compatible bands', () => {
  assert.equal(g1Concepts.length, 8);
  assert.equal(new Set(g1Concepts.map(c => c.id)).size, 8);
  for (const concept of g1Concepts) {
    assert.deepEqual(concept.bandIds, ['early']);
    assert.equal(concept.steps.length, 4);
    assert.ok(concept.parentTip.length > 25);
    assert.deepEqual(concept.missionIds, g1Missions.filter(m => m.conceptKey === concept.id).map(m => m.id));
    for (const card of concept.steps) {
      for (const key of ['title', 'body', 'caption', 'actionLabel']) assert.ok(typeof card[key] === 'string' && card[key].length > 0 && !/undefined|NaN/.test(card[key]));
      assert.ok(card.body.length < 190);
      assert.equal(Object.hasOwn(card, 'expected'), false);
      assert.ok(typeof card.visual.type === 'string');
    }
  }
  const composition = g1Concepts.find(c => c.id === 'g1-shares-shapes').steps[1].visual;
  assert.deepEqual(composition.shapes, ['triangle', 'triangle']);
  assert.equal(composition.compose, 'square');
  const clockSteps = g1Concepts.find(c => c.id === 'g1-clock').steps;
  assert.deepEqual(clockSteps.map(s => [s.visual.hour, s.visual.minute]), [[9, 0], [9, 0], [9, 30], [9, 30]]);
});

test('invalid Grade 1 inputs are rejected without accepting unsupported challenges', () => {
  assert.equal(g1TaskFor('not-a-grade-one-mission'), null);
  for (const step of [-1, 3, 0.5, NaN]) assert.throws(() => g1TaskFor(g1Missions[0].id, step), RangeError);
  for (const seed of [Infinity, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => g1TaskFor(g1Missions[0].id, 0, seed), TypeError);
});
