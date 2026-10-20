import test from 'node:test';
import assert from 'node:assert/strict';
import { extraMissions, extraTaskFor } from '../src/content-expansion.mjs';
import { missions, taskFor, checkTask } from '../src/adventure-model.mjs';
import { adaptTask } from '../src/division-builder.mjs';

// Independently hand-worked seed-1 answers for every new microchallenge.
// Keep this literal answer key separate from production arithmetic.
const canonical = {
  'meadow-small-trail': ['1', '2', '5'],
  'meadow-zero': ['0', 'left', '0'],
  'meadow-ten-trail': ['6', '8', '10'],
  'meadow-same-number': ['same', 'different', 'same'],
  'meadow-fewer': ['left', 'right', 'same'],
  'meadow-shape-sides': ['3', '4', '0'],
  'meadow-shape-sort': ['circle', 'triangle', 'square'],
  'meadow-patterns': ['square', 'square', 'circle'],
  'pond-count-on': [5, 6, 6],
  'pond-take-all': [0, 5, 2],
  'pond-missing-part': [4, 3, 2],
  'pond-make-ten': [7, 6, 5],
  'pond-doubles': [8, 8, 9],
  'pond-ten-trade': [{ tens: 1, ones: 2 }, '12', { tens: 2, ones: 2 }],
  'clock-five-minutes': [{ hour: 2, minute: 5 }, '2:20', { hour: 2, minute: 55 }],
  'clock-elapsed': [{ hour: 2, minute: 45 }, '3:15', { hour: 3, minute: 0 }],
  'ribbon-unit-parts': [1, 1 / 4, 1 / 4],
  'ribbon-equal-share': ['equal', 1 / 2, 1],
  'ribbon-equivalence': [2, '2/4', 1 / 2],
  'picnic-skip-groups': [12, 'repeated', 12],
  'picnic-share-bags': [4, 3, 4],
  'studio-same-area': [12, 14, 'long'],
  'studio-border-repair': [7, 7, 3],
  'studio-factor-room': [7, 7, 3],
  'workshop-number-order': ['-1', -3, 2],
  'workshop-signed-moves': [3, -4, 1],
  'garden-recipe': [15, 2 / 5, 6],
  'garden-scale-map': [6, 5, 12],
  'garden-percent-parts': [25, 1 / 4, 2],
  'garden-percent-sale': [10, 20, 44],
  'workshop-negative-balance': [-2, -1, -3],
  'workshop-linear-fare': [11, 'fixed', 4],
  'observatory-line-slope': [2, 6, 5],
  'observatory-line-intercept': [4, 4, -2],
  'observatory-lines-meet': [2, 5, 'same'],
  'observatory-quadratic-shape': [5, 'up', 5],
  'observatory-quadratic-zeros': [2, -2, 'negative'],
  'observatory-growth': [8, 'multiply', 16],
  'observatory-decay': [4, 'multiply', 2],
  'observatory-power-pattern': [4, 'even', 4],
  'campus-scaled-derivative': [4, 'negative', 8],
  'campus-cube-derivative': [6, 'positive', 24],
  'campus-tangent-line': [2, -1, 1.2],
  'campus-constant-integral': [6, 6, 12],
  'campus-scaled-integral': [4, 9, 16],
  'campus-interval-integral': [4, -2, 'cancel'],
  'campus-vector-scale': [{ x: 4, y: 2 }, { x: -2, y: -1 }, { x: 1, y: .5 }],
  'campus-vector-difference': [{ x: 3, y: 3 }, { x: -1, y: -4 }, { x: -2, y: 1 }],
  'g3-mul-array-stories': [{ rows: 3, columns: 5 }, 'product', 12],
  'g3-mul-array-expressions': [3, 'rows', 8],
  'g3-mul-equal-bags': [4, 'equal', 16],
  'g3-mul-skip-hops': [12, '4', 'sequence'],
  'g3-mul-repeated-add': ['repeat', 12, 3],
  'g3-mul-turn-array': [{ rows: 5, columns: 3 }, 'turned', 15],
  'g3-mul-one': [4, '4', '4'],
  'g3-mul-zero': ['0', '0', 'different'],
  'g3-mul-missing-factor': [4, 3, 4],
  'g3-mul-split-five': ['blue-product', 6, 21],
  'g3-mul-double-double': [6, 12, 'double'],
  'g3-mul-ten-packs': [3, 30, '30'],
  'g3-div-share-plates': [4, 3, 6],
  'g3-div-box-groups': [3, 7, 8],
  'g3-div-compare-methods': ['groups', 'size', 8],
  'g3-div-inverse': [6, 'related', 4],
  'g3-div-fact-family': [6, 'related', 6],
  'g3-div-missing-divisor': [6, 6, 6],
  'g3-div-missing-total': [4, 24, 24],
  'g3-div-skip-back': ['4', '3', '4'],
  'g3-div-one-zero': ['4', '0', 'not-defined'],
  'g3-div-unpack-rows': [6, 3, 'both'],
  'g3-div-two-step': [4, '4', 16],
  'g3-div-check-repair': ['multiply', 'too-small', 6]
};

test('72 distinct extension missions add eight per band and a 24-mission Grade 3 path', () => {
  assert.equal(extraMissions.length, 72);
  assert.equal(missions.length, 99);
  assert.deepEqual(Object.keys(canonical).sort(), extraMissions.map(m => m.id).sort());
  assert.deepEqual(missions.slice(27).map(m => m.id), extraMissions.map(m => m.id));
  assert.equal(new Set(extraMissions.map(m => m.id)).size, 72);
  for (const band of ['pre-k', 'early', 'elementary', 'middle', 'high', 'college']) assert.equal(extraMissions.filter(m => m.bandId === band).length, band === 'elementary' ? 32 : 8);
  for (const m of extraMissions) {
    assert.ok(m.title && m.goal && m.skill && m.conceptKey, m.id);
    assert.equal(m.conceptId, m.conceptKey);
  }
});

test('all 216 added canonical challenges agree with a separate hand-worked answer key', () => {
  for (const [id, answers] of Object.entries(canonical)) for (let step = 0; step < 3; step++) {
    const task = taskFor(id, step, 1);
    assert.deepEqual(task.expected, answers[step], `${id} ${step}`);
    assert.equal(checkTask(task, answers[step]).correct, true, `${id} ${step}`);
    assert.deepEqual(task, adaptTask({ id }, extraTaskFor(id, step, 1)));
  }
});

test('three seed families are bounded, reachable, and do not require young learners to type', () => {
  for (const m of extraMissions) for (const seed of [-100, -2, -1, 0, 1, 2, 3, 4, 11, Number.MAX_SAFE_INTEGER]) for (let step = 0; step < 3; step++) {
    const task = taskFor(m.id, step, seed);
    assert.deepEqual(task, taskFor(m.id, step, seed));
    assert.ok(task.prompt.length <= 220, `${m.id}: short question`);
    assert.ok(task.instruction.length <= 240, `${m.id}: short instruction`);
    assert.equal(checkTask(task, task.expected).correct, true);
    if (['pre-k', 'early'].includes(m.bandId)) {
      assert.ok(task.answer.kind === 'choice' || task.inputs.length > 0, `${m.id}: manipulate or choose`);
      if (task.answer.kind === 'number') assert.ok(task.inputs.some(input => input.key === task.answer.key));
      if (task.answer.kind === 'pair') for (const key of task.answer.keys) assert.ok(task.inputs.some(input => input.key === key));
    }
    if (task.answer.kind === 'choice') {
      assert.ok(task.choices.length >= 2);
      assert.equal(new Set(task.choices.map(c => c.value)).size, task.choices.length);
      assert.ok(task.choices.some(c => c.value === task.expected));
    }
    for (const control of task.inputs) {
      assert.ok(control.min <= control.initial && control.initial <= control.max);
      const fixedGiven = task.handsOn?.type === 'division' && control.min === control.max;
      const expected = fixedGiven ? control.initial : task.answer.derived?.kind === 'product' ? task.handsOn.givenGroups : task.answer.kind === 'pair' ? task.expected[control.key] : task.answer.key === control.key ? task.expected : undefined;
      assert.ok(expected !== undefined && expected >= control.min && expected <= control.max, `${m.id}: reachable control`);
      assert.ok(Math.abs((expected - control.min) / control.step - Math.round((expected - control.min) / control.step)) < 1e-9);
      if (fixedGiven) assert.equal(task.visual[control.key], control.initial, `${m.id}: fixed given matches the model`);
    }
    const p = task.visual;
    if (p.type === 'count') assert.ok(p.count >= 0 && p.count <= 20 && p.compareCount >= 0 && p.compareCount <= 20);
    if (p.type === 'fraction') assert.ok(p.parts > 0 && p.parts <= 16 && p.selected >= 0 && p.selected <= p.parts);
    if (p.type === 'array') {
      const min = task.handsOn?.type === 'division' ? 0 : Number.MIN_VALUE;
      assert.ok(p.rows >= min && p.rows <= 12 && p.columns >= min && p.columns <= 12);
      if (task.handsOn) assert.ok(task.inputs.some(input => input.key === p.unknownKey && input.min === 0), `${m.id}: empty build is controlled`);
    }
    if (p.type === 'number-line') {
      assert.ok(p.start >= p.min && p.start <= p.max && p.end >= p.min && p.end <= p.max);
      if (p.moves) assert.equal(p.start + p.moves.reduce((a, b) => a + b, 0), p.end);
    }
    if (p.type === 'equality') assert.equal(p.a * task.expected + p.b, p.c);
    if (p.type === 'pattern' && p.missingIndex !== undefined) assert.equal(p.items[p.missingIndex], task.expected);
    if (p.type === 'function') {
      assert.ok(p.xmin < p.xmax && p.markerX >= p.xmin && p.markerX <= p.xmax);
      for (const key of ['a', 'c', 'markerX', 'xmin', 'xmax']) assert.ok(Number.isFinite(p[key]));
      if (p.family === 'exponential') assert.ok(p.b > 0);
      if (p.family === 'power') assert.ok(Number.isInteger(p.exponent) && p.exponent > 0);
    }
  }
});

test('independent variants exercise every band and sign, fraction, and midnight-free clock behavior', () => {
  const variants = [
    ['meadow-small-trail', 0, 2, '2'], ['meadow-ten-trail', 2, 3, '7'],
    ['meadow-patterns', 1, 2, 'circle'], ['meadow-fewer', 1, 3, 'right'],
    ['pond-make-ten', 0, 2, 6], ['pond-doubles', 2, 3, 13],
    ['clock-elapsed', 1, 3, '10:15'], ['clock-five-minutes', 2, 2, { hour: 5, minute: 55 }],
    ['ribbon-unit-parts', 1, 2, 1 / 6], ['ribbon-equal-share', 2, 3, 1 / 2],
    ['picnic-share-bags', 1, 2, 4], ['studio-same-area', 2, 3, 'long'],
    ['workshop-signed-moves', 1, 3, -6], ['garden-recipe', 1, 2, 3 / 5],
    ['garden-scale-map', 2, 3, 24], ['garden-percent-sale', 2, 2, 66],
    ['observatory-line-slope', 1, 2, -3], ['observatory-line-intercept', 2, 3, -4],
    ['observatory-power-pattern', 1, 2, 'odd'], ['observatory-decay', 2, 3, 4],
    ['campus-cube-derivative', 2, 2, 36], ['campus-interval-integral', 1, 3, -6],
    ['campus-vector-scale', 2, 2, { x: 1.5, y: -.5 }],
    ['campus-vector-difference', 2, 3, { x: -4, y: 4 }]
  ];
  for (const [id, step, seed, expected] of variants) assert.deepEqual(taskFor(id, step, seed).expected, expected, `${id} variant ${seed}`);
});

test('polynomial derivatives and signed integrals independently match model assumptions', () => {
  for (const seed of [1, 2, 3]) {
    for (const id of ['campus-scaled-derivative', 'campus-cube-derivative']) for (const step of [0, 2]) {
      const task = taskFor(id, step, seed), p = task.visual, h = .00001;
      const sampledSlope = (p.a * (p.markerX + h) ** p.exponent - p.a * (p.markerX - h) ** p.exponent) / (2 * h);
      assert.ok(Math.abs(sampledSlope - task.expected) < .000001);
    }
    for (const id of ['campus-constant-integral', 'campus-scaled-integral', 'campus-interval-integral']) for (const step of [0, 1]) {
      const task = taskFor(id, step, seed), p = task.visual;
      // A trapezoid is exact for any linear rate, including a negative one.
      const leftHeight = p.a * p.integralStart + p.b, rightHeight = p.a * p.integralEnd + p.b;
      assert.equal((leftHeight + rightHeight) / 2 * (p.integralEnd - p.integralStart), task.expected);
    }
  }
});

test('Grade 3 paths have specific topics, standards, meaningful representations, and source credits', () => {
  const grade3 = extraMissions.filter(m => m.id.startsWith('g3-'));
  assert.equal(grade3.length, 24);
  for (const topic of ['multiplication', 'division']) assert.equal(grade3.filter(m => m.topicId === topic).length, 12);
  assert.equal(grade3.filter(m => m.sourceIds.length > 0).length, 4);
  for (const m of grade3) {
    assert.deepEqual(m.gradeIds, ['3']);
    assert.ok(m.standards.length > 0 && m.standards.every(code => /^3\.OA\.[A-D]\.[1-9]$/.test(code)));
    assert.ok(m.sourceIds.every(source => ['im-g3-arrays', 'im-g3-division-groups'].includes(source)));
    const tasks = [0, 1, 2].map(step => taskFor(m.id, step, 1));
    assert.ok(tasks.some(task => task.inputs.length > 0 || task.answer.kind === 'choice'), `${m.id}: build or choose`);
    assert.equal(new Set(tasks.map(task => task.prompt)).size, 3, `${m.id}: progressing goals`);
    for (const task of tasks) {
      const p = task.visual;
      if (p.type === 'array') {
        const min = task.handsOn?.type === 'division' ? 0 : Number.MIN_VALUE;
        assert.ok(p.rows * p.columns <= 100 && p.rows >= min && p.columns >= min);
        if (task.handsOn) assert.ok(task.answer.derived || task.inputs.some(input => input.key === task.answer.key), `${m.id}: direct build response`);
      }
      if (task.answer.kind === 'number') assert.ok(task.expected >= 0 && task.expected <= 100);
    }
  }
});

test('24 independent Grade 3 variant checks cover every added mission', () => {
  const cases = [
    ['g3-mul-array-stories', 0, { rows: 2, columns: 4 }], ['g3-mul-array-expressions', 0, 4],
    ['g3-mul-equal-bags', 0, 3], ['g3-mul-skip-hops', 0, 10],
    ['g3-mul-repeated-add', 2, 2], ['g3-mul-turn-array', 0, { rows: 6, columns: 2 }],
    ['g3-mul-one', 0, 6], ['g3-mul-zero', 1, '0'],
    ['g3-mul-missing-factor', 0, 5], ['g3-mul-split-five', 1, 12],
    ['g3-mul-double-double', 1, 16], ['g3-mul-ten-packs', 1, 50],
    ['g3-div-share-plates', 1, 6], ['g3-div-box-groups', 1, 6],
    ['g3-div-compare-methods', 2, 5], ['g3-div-inverse', 2, 3],
    ['g3-div-fact-family', 2, 7], ['g3-div-missing-divisor', 2, 4],
    ['g3-div-missing-total', 2, 20], ['g3-div-skip-back', 1, '2'],
    ['g3-div-one-zero', 0, '6'], ['g3-div-unpack-rows', 1, 4],
    ['g3-div-two-step', 2, 15], ['g3-div-check-repair', 2, 7]
  ];
  assert.equal(cases.length, 24);
  for (const [id, step, expected] of cases) assert.deepEqual(taskFor(id, step, 2).expected, expected, id);
});

test('extension dispatch does not accept unknown IDs or malformed inputs', () => {
  assert.equal(extraTaskFor('not-a-mission'), null);
  assert.throws(() => extraTaskFor('meadow-zero', -1), RangeError);
  assert.throws(() => extraTaskFor('meadow-zero', 0, .5), TypeError);
});
