import test from 'node:test';
import assert from 'node:assert/strict';
import { g5Missions, g5TaskFor, g5Concepts, g5Units } from '../src/grade5-content.mjs';
import { checkTask } from '../src/adventure-model.mjs';

// Independently hand-worked, literal answers. Keep these separate from the
// authored task calculations so a formula cannot generate its own test key.
const canonical = {
  'place-shift': [4.2, 42, .042],
  'decimal-names': ['two and four hundred seven thousandths', .007, '2 + 4/10 + 0/100 + 7/1000'],
  'compare-decimals': ['greater', 'less', 'equal'],
  'round-decimals': [3.75, 3.7, 4],
  'partial-products': [200, 42, 322],
  'multiply-multidigit': [372, 2480, 2852],
  'two-digit-groups': [20, 192, 28],
  'division-remainders': [28, 22, 29],
  'decimal-join': [1.82, 182, 2.1],
  'decimal-difference': [1.46, 2.14, 'align-units'],
  'decimal-product': [24, .24, .72],
  'decimal-quotient': [21, .21, 4],
  'common-pieces': [4, 3, 7 / 12],
  'unlike-sums': [4, 5 / 6, 'between'],
  'unlike-difference': [10, 3, 7 / 12],
  'mixed-number-route': [9 / 4, 3 / 2, 'two-three'],
  'fraction-of-whole': [2 / 3, 4 / 3, 2 / 3],
  'fraction-overlap': [12, 6, 1 / 2],
  'fractional-area': [1 / 12, 6, 1 / 2],
  'sensible-scaling': ['smaller', 'same', 5 / 2],
  'unit-fraction-share': [6, 1 / 6, '3 × 1/6 = 1/2'],
  'whole-by-unit': [3, 6, '6 × 1/3 = 2'],
  'fractions-as-sharing': [12, 3 / 4, '4 × 3/4 = 3'],
  'serving-stories': [1 / 4, 8, 'more'],
  'unit-cube-layers': [12, 2, 24],
  'volume-two-parts': [24, 4, 28],
  'measure-convert': [125, .75, 200],
  'fraction-data': [2, 3, 3 / 4],
  'coordinate-camp': [{ x: 2, y: 3 }, { x: 5, y: 7 }, { x: 7, y: 4 }],
  'pattern-pairs': [6, { x: 4, y: 8 }, 'multiply'],
  'expression-groups': [12, 36, '3 × (8 + 4)'],
  'shape-hierarchy': ['yes', 'right', 'both']
};
const second = {
  'place-shift': 3.6, 'decimal-names': 'three and fifty-two thousandths', 'compare-decimals': 'greater', 'round-decimals': 2.69,
  'partial-products': 600, 'multiply-multidigit': 852, 'two-digit-groups': 20, 'division-remainders': 27,
  'decimal-join': 2.13, 'decimal-difference': .88, 'decimal-product': 21, 'decimal-quotient': 24,
  'common-pieces': 3, 'unlike-sums': 6, 'unlike-difference': 9, 'mixed-number-route': 5 / 2,
  'fraction-of-whole': 3 / 4, 'fraction-overlap': 15, 'fractional-area': 1 / 10, 'sensible-scaling': 'smaller',
  'unit-fraction-share': 12, 'whole-by-unit': 4, 'fractions-as-sharing': 6, 'serving-stories': 1 / 6,
  'unit-cube-layers': 10, 'volume-two-parts': 18, 'measure-convert': 150, 'fraction-data': 2,
  'coordinate-camp': { x: 3, y: 2 }, 'pattern-pairs': 6, 'expression-groups': 12, 'shape-hierarchy': 'yes'
};
const almost = (actual, expected, note) => assert.ok(Math.abs(actual - expected) < 1e-9, `${note}: ${actual} versus ${expected}`);

test('Grade 5 adds 32 original lessons with eight connected units and explicit standards', () => {
  assert.equal(g5Missions.length, 32);
  assert.equal(new Set(g5Missions.map(m => m.id)).size, 32);
  assert.deepEqual(g5Missions.map(m => m.id).sort(), Object.keys(canonical).map(s => 'g5y-' + s).sort());
  assert.equal(g5Units.length, 8);
  assert.deepEqual(g5Units.map(u => u.weeks), [4, 5, 5, 5, 5, 4, 4, 4]);
  assert.deepEqual(g5Units.flatMap(u => u.missionIds), g5Missions.map(m => m.id));
  const topics = ['place-value', 'decimals', 'multiplication', 'division', 'fractions', 'measurement', 'measuring', 'data', 'coordinates', 'expressions', 'geometry'];
  for (const mission of g5Missions) {
    assert.equal(mission.bandId, 'elementary');
    assert.deepEqual(mission.gradeIds, ['5']);
    assert.deepEqual(mission.sourceIds, []);
    assert.match(mission.unitId, /^g5-unit-[1-8]$/);
    assert.ok(topics.includes(mission.topicId));
    assert.ok(mission.standards.length && mission.standards.every(s => /^5\.(?:NBT|NF|MD|OA|G)\.[A-C]\.[1-7][abc]?$/.test(s)), mission.id);
    assert.ok(g5Concepts.some(c => c.id === mission.conceptKey && c.id === mission.conceptId));
    for (const key of ['goal', 'prerequisite', 'workedExample', 'explainPrompt', 'reviewPrompt']) assert.ok(mission.lessonPlan[key].length >= 20, `${mission.id} ${key}`);
  }
  for (const [i, unit] of g5Units.entries()) {
    assert.equal(unit.id, `g5-unit-${i + 1}`);
    assert.equal(unit.sequence, i + 1);
    assert.equal(unit.missionIds.length, 4);
    assert.deepEqual(unit.reviewMissionIds, []);
    assert.deepEqual(unit.prerequisiteMissionIds, []);
    for (const key of ['methods', 'prerequisiteSkills', 'everydayPractice', 'standards', 'sourceUrls']) assert.ok(unit[key].length > 0);
    assert.ok(unit.sourceUrls.every(s => s.startsWith('https://www.thecorestandards.org/Math/Content/5/')));
  }
});

test('all 96 canonical challenges agree with independent literal answer keys', () => {
  for (const [suffix, expected] of Object.entries(canonical)) for (let step = 0; step < 3; step++) {
    const task = g5TaskFor('g5y-' + suffix, step, 1);
    if (typeof expected[step] === 'number') almost(task.expected, expected[step], `${suffix}:${step}`);
    else assert.deepEqual(task.expected, expected[step], `${suffix}:${step}`);
    assert.equal(checkTask(task, expected[step]).correct, true, `${suffix}:${step}`);
    const wrong = task.answer.kind === 'pair' ? { x: expected[step].x + 1, y: expected[step].y } : task.answer.kind === 'choice' ? task.choices.find(c => c.value !== expected[step]).value : expected[step] + 1;
    assert.equal(checkTask(task, wrong).correct, false, `${suffix}:${step} distinguishes a wrong answer`);
  }
});

test('32 additional independent examples and three bounded variations stay reachable', () => {
  assert.equal(Object.keys(second).length, 32);
  for (const [suffix, expected] of Object.entries(second)) {
    const task = g5TaskFor('g5y-' + suffix, 0, 2);
    if (typeof expected === 'number') almost(task.expected, expected, suffix);
    else assert.deepEqual(task.expected, expected, suffix);
    assert.equal(checkTask(task, expected).correct, true);
  }
  for (const mission of g5Missions) {
    const signature = seed => JSON.stringify([0, 1, 2].map(step => { const task = g5TaskFor(mission.id, step, seed); return [task.prompt, task.visual, task.expected]; }));
    assert.equal(new Set([1, 2, 3].map(signature)).size, 3, `${mission.id} three distinct variations`);
    for (const seed of [-8, -1, 0, 1, 2, 3, 17, Number.MAX_SAFE_INTEGER]) for (let step = 0; step < 3; step++) {
      const task = g5TaskFor(mission.id, step, seed);
      assert.deepEqual(task, g5TaskFor(mission.id, step, seed));
      assert.equal(checkTask(task, task.expected).correct, true);
      for (const key of ['prompt', 'instruction', 'hint', 'explanation', 'why']) assert.ok(task[key].trim().length > 0 && !/undefined|NaN/.test(task[key]), `${mission.id}:${step} ${key}`);
      assert.ok(task.prompt.length < 240 && task.instruction.length < 200);
      if (task.answer.kind === 'choice') {
        assert.ok(task.choices.length >= 2);
        assert.equal(new Set(task.choices.map(c => c.value)).size, task.choices.length);
        assert.ok(task.choices.some(c => c.value === task.expected));
      } else {
        const keys = task.answer.kind === 'pair' ? task.answer.keys : [task.answer.key];
        assert.ok(keys.every(key => task.inputs.some(i => i.key === key)), `${mission.id} controls cover every response`);
        for (const def of task.inputs) {
          const expected = task.answer.kind === 'pair' ? task.expected[def.key] : task.expected;
          assert.ok([def.min, def.max, def.step, def.initial, expected].every(Number.isFinite));
          assert.ok(def.min <= def.initial && def.initial <= def.max && def.step > 0);
          assert.ok(expected >= def.min - 1e-9 && expected <= def.max + 1e-9, `${mission.id}:${step} bounds`);
          almost((expected - def.min) / def.step, Math.round((expected - def.min) / def.step), `${mission.id}:${step} exact control step`);
        }
        const initial = task.answer.kind === 'pair' ? Object.fromEntries(task.inputs.map(i => [i.key, i.initial])) : task.inputs[0].initial;
        assert.equal(checkTask(task, initial).correct, false, `${mission.id}:${step} needs learner action`);
        if (task.answer.kind === 'number') assert.equal(task.answer.key, 'response');
        if (task.visual.kind === 'fraction-bars' && task.visual.answerKeys?.value === 'fraction') assert.ok(task.visual.maxWholes >= task.inputs[0].max, `${mission.id}:${step} the complete fraction response range fits its fixed whole scale`);
        if (task.visual.kind === 'decimal-grid') assert.ok(task.expected <= 3, `${mission.id}:${step} a count of hundredths must not be mistaken for that many decimal wholes`);
      }
    }
  }
});

test('all authored diagram data respect complete wholes, units, and grade-level operation domains', () => {
  const visuals = [];
  for (const mission of g5Missions) for (const seed of [1, 2, 3]) for (let step = 0; step < 3; step++) visuals.push(g5TaskFor(mission.id, step, seed).visual);
  for (const c of g5Concepts) for (const step of c.steps) visuals.push(step.visual);
  for (const v of visuals) {
    if (v.type === 'upper' && v.kind === 'fraction-bars') {
      assert.ok([1, 2, 3].includes(v.maxWholes));
      if (v.partitionDen) assert.ok(v.partitionDen <= 24 && Number.isInteger(v.partitionDen));
      for (const b of v.bars) {
        assert.ok(Number.isInteger(b.num) && Number.isInteger(b.den) && b.num >= 0 && b.den > 0);
        assert.ok(b.num / b.den <= v.maxWholes, 'Every given amount fits its full fixed unit scale');
        if (v.partitionDen) assert.ok(Number.isInteger(b.num * v.partitionDen / b.den), 'Common partitions do not cut a selected amount between modeled pieces');
      }
    }
    if (v.type === 'upper' && v.kind === 'fraction-product') {
      for (const [num, den] of [v.left, v.right]) assert.ok(Number.isInteger(num) && Number.isInteger(den) && den > 0 && num > 0 && num <= den);
    }
    if (v.type === 'upper' && v.kind === 'decimal-grid') assert.ok(v.values.every(n => n >= 0 && n <= 3 && Math.abs(n * 100 - Math.round(n * 100)) < 1e-7));
    if (v.type === 'upper' && v.kind === 'coordinates') for (const p of v.points) assert.ok(Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.x <= 10 && p.y >= 0 && p.y <= 10);
    if (v.type === 'upper' && v.kind === 'volume-parts') for (const p of v.prisms) assert.ok([p.length, p.width, p.height].every(n => Number.isInteger(n) && n > 0 && n <= 8));
    if (v.type === 'upper' && v.kind === 'quotient') {
      assert.ok(Number.isInteger(v.total) && v.total <= 9999);
      assert.ok(Number.isInteger(v.divisor) && v.divisor >= 10 && v.divisor <= 99);
      assert.ok(v.chunks.every(n => Number.isInteger(n) && n > 0));
      assert.ok(v.chunks.reduce((sum, q) => sum + q * v.divisor, 0) <= v.total);
    }
  }
  for (const seed of [1, 2, 3]) {
    const divisor = g5TaskFor('g5y-unit-fraction-share', 1, seed), inverse = g5TaskFor('g5y-whole-by-unit', 1, seed);
    assert.ok(divisor.expected > 0 && divisor.expected < 1);
    assert.ok(Number.isInteger(inverse.expected) && inverse.expected > 1);
    assert.equal(g5TaskFor('g5y-division-remainders', 1, seed).visual.trialMode, 'remainder');
    assert.equal(g5TaskFor('g5y-division-remainders', 2, seed).visual.trialMode, 'none');
  }
});

test('fourteen focused worked-example families keep their mathematical meaning', () => {
  assert.equal(g5Concepts.length, 14);
  assert.equal(new Set(g5Concepts.map(c => c.id)).size, 14);
  for (const c of g5Concepts) {
    assert.deepEqual(c.bandIds, ['elementary']);
    assert.ok(c.steps.length >= 3 && c.steps.length <= 4);
    assert.ok(c.parentTip.length >= 30);
    assert.ok(c.missionIds.length > 0);
    for (const step of c.steps) {
      for (const key of ['title', 'body', 'caption', 'actionLabel']) assert.ok(step[key].length > 0 && !/undefined|NaN/.test(step[key]));
      assert.equal(Object.hasOwn(step, 'expected'), false);
    }
  }
  const visuals = id => g5Concepts.find(c => c.id === id).steps.map(s => s.visual);
  assert.deepEqual(visuals('g5-decimal-place').map(v => v.value), [6.318, 63.18, 6.318, 6.318]);
  const productExample = visuals('g5-whole-products')[0];
  assert.equal(productExample.rows.reduce((a, b) => a + b, 0), 32);
  assert.equal(productExample.columns.reduce((a, b) => a + b, 0), 14);
  assert.equal(32 * 14, 448);
  const divisionExample = visuals('g5-division-chunks');
  assert.equal(divisionExample[0].chunks[0] * 25, 500);
  assert.equal(divisionExample[1].chunks.reduce((a, b) => a + b, 0), 26);
  assert.equal(divisionExample[2].total - 26 * 25, 8);
  const cubeVolumes = visuals('g5-volume').map(v => v.prisms.reduce((sum, p) => sum + p.length * p.width * p.height, 0));
  assert.deepEqual(cubeVolumes, [1, 6, 24, 28]);
  const data = visuals('g5-fraction-data')[0].values;
  assert.equal(data.length, 4);
  assert.equal(data.reduce((a, b) => a + b, 0), 2);
  assert.equal(data.filter(n => n === .5).length, 2);
  const rules = visuals('g5-coordinates-patterns')[2].points;
  assert.ok(rules.every(p => p.y === 3 * p.x));
});

test('unknown Grade 5 IDs fall through and malformed replay state fails explicitly', () => {
  assert.equal(g5TaskFor('unknown'), null);
  for (const step of [-1, 3, 1.5, NaN]) assert.throws(() => g5TaskFor('g5y-place-shift', step), RangeError);
  for (const seed of [NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => g5TaskFor('g5y-place-shift', 0, seed), TypeError);
});
