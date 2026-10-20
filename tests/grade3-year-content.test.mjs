import test from 'node:test';
import assert from 'node:assert/strict';
import { yearMissions, yearTaskFor } from '../src/grade3-year-content.mjs';
import { checkTask } from '../src/adventure-model.mjs';

// Independently hand-worked answers, never generated from production formulas.
const answers = {
  'hundreds-trade': ['10', 20, 2],
  'number-compose': [{ hundreds: 3, tens: 4, ones: 7 }, 40, { hundreds: 3, tens: 5, ones: 7 }],
  'round-ten': [240, 250, 250],
  'round-hundred': [300, 400, 400],
  'add-regroup': [{ tens: 1, ones: 5 }, { hundreds: 1, tens: 2 }, { hundreds: 4, tens: 2, ones: 5 }],
  'subtract-regroup': [4, 6, { hundreds: 2, tens: 6, ones: 4 }],
  'equal-area-split': ['parts', 8, 28],
  'near-ten-fact': ['remove-column', 27, '36'],
  'three-factor-pack': [6, 24, { hundreds: 2, tens: 4, ones: 0 }],
  'divide-split': [6, 2, 8],
  'unknown-position': [6, 5, 6],
  'two-step-inventory': [8, 32, 8],
  'unit-line': [1 / 4, '1/4', 4],
  'locate-share': [3 / 4, 1 / 2, 1],
  'whole-number': [4, 8, 'same'],
  'above-one': [5 / 4, 6, 'greater'],
  'equivalent-line': [2, 'same', 'same-scale'],
  'compare-same-bottom': ['less', 'greater', 'equal'],
  'compare-same-top': ['greater', 'less', 'greater'],
  'compare-half': ['less', 'equal', 'greater'],
  'minute-clock': [{ hour: 3, minute: 17 }, '3:43', { hour: 3, minute: 58 }],
  'elapsed-cross-hour': [12, { hour: 3, minute: 13 }, 25],
  'liters-scale': [3, 5, 3],
  'mass-balance': [400, 600, 400],
  'bar-chart': [6, 4, 18],
  'picture-key': [6, 4, 18],
  'line-plot': [2, 5, 1],
  'length-plot': [1.25, 5, 1],
  'attributes': ['4', 'right', '1/4'],
  'quadrilateral-sort': ['yes', 'four', 'no'],
  'tile-area': [6, 24, 'once'],
  'area-compose': [12, 4, 16],
  'same-perimeter': [16, 16, 'second'],
  'missing-side': [7, 7, 4],
  'plan-picnic': [6, 5, 3],
  'design-garden': [24, 20, 28]
};

test('36 original year lessons provide complete planning notes and explicit Grade 3 placement', () => {
  assert.equal(yearMissions.length, 36);
  assert.equal(new Set(yearMissions.map(m => m.id)).size, 36);
  assert.deepEqual(yearMissions.map(m => m.id).sort(), Object.keys(answers).map(id => 'g3y-' + id).sort());
  assert.deepEqual(yearMissions.map(m => m.order), Array.from({ length: 36 }, (_, i) => 100 + i));
  for (const mission of yearMissions) {
    assert.deepEqual(mission.gradeIds, ['3']);
    assert.equal(mission.bandId, 'elementary');
    assert.match(mission.unitId, /^g3-unit-[1-8]$/);
    assert.ok(mission.conceptKey && mission.conceptKey === mission.conceptId);
    assert.ok(mission.standards.length > 0 && mission.standards.every(code => /^3\.(?:OA|NBT|NF|MD|G)\.[A-D]\.[1-9][a-d]?$/.test(code)), mission.id);
    assert.deepEqual(mission.sourceIds, [], 'original authoring does not claim an external adaptation');
    for (const key of ['goal', 'prerequisite', 'workedExample', 'explainPrompt', 'reviewPrompt']) assert.ok(typeof mission.lessonPlan[key] === 'string' && mission.lessonPlan[key].length >= 20, `${mission.id} ${key}`);
    assert.ok(!/certif|mastery achieved|CA[- ]aligned/i.test(mission.goal));
  }
});

test('all 108 canonical year challenges match independently worked answers', () => {
  for (const [suffix, expected] of Object.entries(answers)) for (let step = 0; step < 3; step++) {
    const task = yearTaskFor('g3y-' + suffix, step, 1);
    assert.deepEqual(task.expected, expected[step], `${suffix}:${step}`);
    assert.equal(checkTask(task, expected[step]).correct, true, `${suffix}:${step}`);
  }
});

test('all variants remain finite, reachable, age-appropriate, and leave unknown builds unfinished', () => {
  for (const mission of yearMissions) for (const seed of [-8, -1, 0, 1, 2, 3, 17, Number.MAX_SAFE_INTEGER]) for (let step = 0; step < 3; step++) {
    const task = yearTaskFor(mission.id, step, seed);
    assert.deepEqual(task, yearTaskFor(mission.id, step, seed));
    assert.equal(checkTask(task, task.expected).correct, true);
    for (const key of ['prompt', 'instruction', 'hint', 'explanation', 'why']) {
      assert.ok(task[key].length > 0, `${mission.id}:${step} ${key}`);
      assert.ok(!task[key].includes('undefined'));
    }
    assert.ok(task.prompt.length < 240 && task.instruction.length < 250, `${mission.id} concise`);
    if (task.answer.kind === 'number') assert.ok(Number.isFinite(task.expected) && task.expected >= 0 && task.expected <= 1000);
    if (task.answer.kind === 'pair') assert.ok(Object.values(task.expected).every(Number.isFinite));
    if (task.answer.kind === 'choice') {
      assert.ok(task.choices.length >= 2);
      assert.equal(new Set(task.choices.map(c => c.value)).size, task.choices.length);
      assert.ok(task.choices.some(c => c.value === task.expected));
    }
    for (const input of task.inputs) {
      assert.ok([input.min, input.max, input.step, input.initial].every(Number.isFinite));
      assert.ok(input.min <= input.initial && input.initial <= input.max && input.step > 0);
      const expected = task.answer.kind === 'pair' ? task.expected[input.key] : task.answer.key === input.key ? task.expected : null;
      assert.notEqual(expected, null);
      assert.ok(expected >= input.min && expected <= input.max, `${mission.id}:${step} reachable`);
      assert.ok(Math.abs((expected - input.min) / input.step - Math.round((expected - input.min) / input.step)) < 1e-7);
    }
    if (task.inputs.length) {
      const initialAnswer = task.answer.kind === 'pair' ? Object.fromEntries(task.inputs.map(i => [i.key, i.initial])) : task.inputs.find(i => i.key === task.answer.key)?.initial;
      assert.equal(checkTask(task, initialAnswer).correct, false, `${mission.id}:${step} unknown is not pre-filled`);
    }
    const p = task.visual;
    if (p.type === 'base-ten') for (const key of ['hundreds', 'tens', 'ones']) assert.ok(Number.isInteger(p[key]) && p[key] >= 0 && p[key] <= 9);
    if (p.type === 'array') assert.ok(p.rows > 0 && p.columns > 0 && p.rows <= 12 && p.columns <= 12 && p.rows * p.columns <= 100);
    if (p.type === 'fraction') {
      assert.ok([2, 3, 4, 6, 8].includes(p.parts));
      assert.ok(p.selected >= 0 && p.selected <= p.parts);
      if (p.compareParts) assert.ok([2, 3, 4, 6, 8].includes(p.compareParts) && p.compareSelected <= p.compareParts);
    }
    if (p.fractionDenominator) assert.ok([2, 3, 4, 6, 8].includes(p.fractionDenominator));
    if (p.type === 'number-line') assert.ok(p.min < p.max && p.end >= p.min && p.end <= p.max);
    if (p.type === 'measurement') assert.ok(p.value >= 0 && p.value <= p.max && p.tickStep > 0 && ['L', 'g', 'in'].includes(p.unit));
    if (p.type === 'data') assert.ok(p.values.every(value => Number.isFinite(value) && value >= 0));
    if (p.divisionMode) {
      assert.equal(p.type, 'array');
      assert.ok(['share', 'groups', 'total'].includes(p.divisionMode));
      if (p.divisionMode === 'share') assert.equal(task.expected * p.rows, p.targetTotal);
      if (p.divisionMode === 'groups') assert.equal(task.expected * p.columns, p.targetTotal);
      if (p.divisionMode === 'total') assert.equal(task.expected, p.rows * p.columns);
    }
  }
});

test('36 additional independently calculated examples cover every year lesson', () => {
  const variants = [
    ['hundreds-trade', 1, 30], ['number-compose', 0, { hundreds: 5, tens: 0, ones: 6 }],
    ['round-ten', 1, 380], ['round-hundred', 1, 700],
    ['add-regroup', 2, { hundreds: 6, tens: 2, ones: 4 }], ['subtract-regroup', 2, { hundreds: 3, tens: 5, ones: 6 }],
    ['equal-area-split', 1, 9], ['near-ten-fact', 2, '45'], ['three-factor-pack', 2, { hundreds: 3, tens: 0, ones: 0 }],
    ['divide-split', 0, 5], ['unknown-position', 1, 4], ['two-step-inventory', 1, 36],
    ['unit-line', 1, '1/3'], ['locate-share', 1, 2 / 3], ['whole-number', 1, 6], ['above-one', 1, 5],
    ['equivalent-line', 0, 2], ['compare-same-bottom', 1, 'greater'], ['compare-same-top', 2, 'greater'], ['compare-half', 2, 'greater'],
    ['minute-clock', 0, { hour: 6, minute: 17 }], ['elapsed-cross-hour', 1, { hour: 6, minute: 12 }],
    ['liters-scale', 1, 7], ['mass-balance', 2, 600], ['bar-chart', 1, 4], ['picture-key', 0, 8],
    ['line-plot', 0, 2], ['length-plot', 0, 1.5], ['attributes', 0, '4'], ['quadrilateral-sort', 0, 'yes'],
    ['tile-area', 1, 15], ['area-compose', 2, 19], ['same-perimeter', 1, 18], ['missing-side', 2, 5],
    ['plan-picnic', 0, 4], ['design-garden', 2, 18]
  ];
  assert.equal(variants.length, 36);
  for (const [suffix, step, expected] of variants) assert.deepEqual(yearTaskFor('g3y-' + suffix, step, 2).expected, expected, suffix);
});

test('data, elapsed intervals, composed area, and rounded ties have independent invariants', () => {
  for (const seed of [1, 2, 3]) {
    for (const suffix of ['bar-chart', 'picture-key']) {
      const first = yearTaskFor('g3y-' + suffix, 0, seed), second = yearTaskFor('g3y-' + suffix, 1, seed), third = yearTaskFor('g3y-' + suffix, 2, seed);
      assert.equal(first.expected, first.visual.values[0]);
      assert.equal(second.expected, first.visual.values[2] - first.visual.values[1]);
      assert.equal(third.expected, first.visual.values.reduce((a, b) => a + b, 0));
      assert.ok(first.visual.values.every(value => value % first.visual.key === 0));
    }
    const time = yearTaskFor('g3y-elapsed-cross-hour', 1, seed), duration = yearTaskFor('g3y-elapsed-cross-hour', 2, seed);
    assert.equal((time.expected.hour - time.visual.hour) * 60 + time.expected.minute - time.visual.minute, duration.expected);
    const floor = yearTaskFor('g3y-area-compose', 2, seed), [a, b] = floor.visual.rectangles;
    assert.ok(a.x + a.length <= b.x || b.x + b.length <= a.x || a.y + a.width <= b.y || b.y + b.width <= a.y, 'regions do not overlap');
    assert.equal(floor.expected, a.length * a.width + b.length * b.width);
    for (const suffix of ['round-ten', 'round-hundred']) {
      const task = yearTaskFor('g3y-' + suffix, 1, seed);
      assert.equal(task.visual.end, (task.visual.min + task.visual.max) / 2);
      assert.equal(task.expected, task.visual.max, 'positive halfway case chooses higher benchmark');
    }
  }
});

test('invalid year dispatch fails safely', () => {
  assert.equal(yearTaskFor('missing'), null);
  for (const step of [-1, 3, .5]) assert.throws(() => yearTaskFor('g3y-unit-line', step), RangeError);
  for (const seed of [NaN, Infinity, 1.1, '1']) assert.throws(() => yearTaskFor('g3y-unit-line', 0, seed), TypeError);
});

test('quarter-inch tasks use the same fraction names as the ruler without requiring decimal conversion', () => {
  const lengths = ['1 1/4', '1 1/2', '1 3/4'], thresholds = ['1 1/2', '1 3/4', '2'];
  for (const seed of [1, 2, 3]) {
    const count = yearTaskFor('g3y-line-plot', 0, seed), measure = yearTaskFor('g3y-length-plot', 0, seed);
    assert.equal(count.prompt, `How many ribbons measure ${lengths[seed - 1]} inches?`);
    assert.equal(count.explanation, `Two X marks stand above ${lengths[seed - 1]} inches, so two ribbons have that length.`);
    assert.equal(measure.explanation, `The ribbon measures ${lengths[seed - 1]} inches.`);
    assert.match(measure.instruction, /mixed number, such as 2 1\/2/);
    assert.equal(checkTask(measure, lengths[seed - 1]).correct, true);
    for (const suffix of ['line-plot', 'length-plot']) {
      const longer = yearTaskFor('g3y-' + suffix, 2, seed);
      assert.equal(longer.prompt, `How many ribbons are longer than ${thresholds[seed - 1]} inches?`);
      assert.equal(longer.explanation, `Only one X is to the right of ${thresholds[seed - 1]} inches.`);
      for (let step = 0; step < 3; step++) {
        const task = yearTaskFor('g3y-' + suffix, step, seed);
        assert.doesNotMatch(task.prompt + ' ' + task.explanation, /\d+\.\d+/);
      }
    }
  }
});
