import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ageBands, worlds, missions, missionById, taskFor, checkTask, parseAnswer } from '../src/adventure-model.mjs';

// Hand-worked canonical answers. These do not call the production calculation.
const examples = {
  'meadow-count': ['3', '4', '5'],
  'meadow-compare': ['right', 'left', 'same'],
  'meadow-shapes': ['circle', 'triangle', 'square'],
  'meadow-add': [5, 7, 9],
  'meadow-subtract': [6, 6, 6],
  'meadow-tens': [{ tens: 2, ones: 3 }, '25', '27'],
  'clock-hours': [{ hour: 3, minute: 0 }, '7:00', { hour: 10, minute: 0 }],
  'clock-halves': [{ hour: 3, minute: 30 }, '7:30', { hour: 10, minute: 30 }],
  'clock-quarters': [{ hour: 3, minute: 15 }, '7:45', { hour: 10, minute: 15 }],
  'meadow-groups': [12, 9, 8],
  'meadow-fractions': [3, 3 / 4, 6],
  'meadow-arrays': [4, 9, 2],
  'garden-color': [{ blue: 6, yellow: 9 }, 12, 10],
  'garden-market': [3, 24, 27],
  'garden-repair': [6, 'scaled', 15],
  'cargo-lift': [5, 4, 3],
  'cargo-equality': ['both', 5, 'same'],
  'cargo-check': [5, 4, 3],
  'room-floor': [6, 18, 7],
  'room-border': [6, 18, 7],
  'room-stack': [3, 72, 2],
  'fountain-peak': [{ h: 3, k: 9 }, { h: 3, k: 9 }, 4],
  'fountain-land': [3, { left: 1, right: 7 }, 6],
  'fountain-height': [2, 15, 12],
  'campus-slope': [2, 4, 6],
  'campus-area': [4, 8, 12.5],
  'campus-vectors': [{ sumX: 5, sumY: 3 }, { x: 4, y: 0 }, { x: 1, y: 5 }]
};

test('the 271 authored missions connect six learner bands with valid optional lesson links', () => {
  assert.equal(missions.length, 271);
  assert.equal(ageBands.length, 6);
  assert.equal(new Set(missions.map(m => m.id)).size, missions.length);
  assert.deepEqual(missions.map(m => m.order), Array.from({ length: 271 }, (_, i) => i + 1));
  const curriculum = readFileSync(new URL('../src/curriculum.js', import.meta.url), 'utf8');
  for (const m of missions) {
    assert.ok(ageBands.some(band => band.id === m.bandId), m.id);
    assert.ok(worlds.some(world => world.id === m.worldId), m.id);
    if (m.lessonId) assert.ok(curriculum.includes(`define('${m.lessonId}'`), m.lessonId);
    if (m.bandId === 'pre-k') assert.equal(m.lessonId, null);
    assert.equal(missionById(m.id), m);
  }
  assert.equal(missionById('not-a-mission'), null);
});

test('all 81 canonical challenges match independently worked answers', () => {
  assert.deepEqual(Object.keys(examples).sort(), missions.slice(0, 27).map(m => m.id).sort());
  for (const [id, answers] of Object.entries(examples)) {
    answers.forEach((answer, step) => {
      const task = taskFor(id, step, 1);
      assert.deepEqual(task.expected, answer, `${id} step ${step}`);
      const checked = checkTask(task, answer);
      assert.equal(checked.correct, true, `${id} step ${step}: ${JSON.stringify(checked)}`);
      assert.ok(checked.explanation.length > 0, `${id} explanation`);
    });
  }
});

test('variation families preserve their mathematical constraints and finite controls', () => {
  for (const m of missions) for (const seed of [-8, -1, 0, 1, 2, 3, 17, 101]) for (let step = 0; step < 3; step++) {
    const task = taskFor(m.id, step, seed);
    assert.deepEqual(task, taskFor(m.id, step, seed), `${m.id} deterministic`);
    assert.equal(JSON.parse(JSON.stringify(task)).id, task.id);
    for (const field of ['prompt', 'instruction', 'hint', 'explanation', 'why']) {
      assert.ok(typeof task[field] === 'string' && task[field].length > 0, `${m.id} ${field}`);
      assert.ok(!task[field].includes('undefined'), `${m.id} ${field}`);
    }
    for (const control of task.inputs) {
      assert.ok([control.min, control.max, control.initial, control.step].every(Number.isFinite));
      assert.ok(control.min <= control.initial && control.initial <= control.max && control.step > 0, `${m.id} ${control.key}`);
      const expected = task.answer.kind === 'pair' ? task.expected[control.key] : task.answer.key === control.key ? task.expected : null;
      if (expected !== null && expected !== undefined) {
        assert.ok(expected >= control.min && expected <= control.max, `${m.id} expected reachable`);
        assert.ok(Math.abs((expected - control.min) / control.step - Math.round((expected - control.min) / control.step)) < 1e-7, `${m.id} expected on control step`);
      }
    }
    assert.equal(checkTask(task, task.expected).correct, true, `${m.id} all variants`);
    assert.equal(checkTask(task, null).correct, false);
    if (task.answer.kind === 'choice') {
      assert.equal(new Set(task.choices.map(c => c.value)).size, task.choices.length);
      assert.ok(task.choices.some(c => c.value === task.expected));
      assert.ok(task.choices.some(c => !checkTask(task, c.value).correct));
      assert.equal(checkTask(task, 'not-displayed').correct, false);
    } else if (task.answer.kind === 'pair') {
      const wrong = { ...task.expected, [task.answer.keys[0]]: task.expected[task.answer.keys[0]] + 1 };
      assert.equal(checkTask(task, wrong).correct, false);
    } else {
      assert.equal(checkTask(task, task.expected + 1).correct, false);
      assert.equal(checkTask(task, '2+2').correct, false);
    }
    // Substitute independently into equations and use geometric definitions.
    const p = task.visual;
    if (p.type === 'equality' && task.answer.kind === 'number') assert.equal(p.a * task.expected + p.b, p.c, `${m.id} substitution`);
    if (p.type === 'garden' && p.mode === 'ratio' && Object.hasOwn(examples, m.id)) {
      if (task.answer.kind === 'pair') {
        assert.equal(task.expected.blue * p.ratioYellow, task.expected.yellow * p.ratioBlue);
        assert.equal(task.expected.blue + task.expected.yellow, p.targetTotal);
      } else if (task.answer.kind === 'number' && m.id === 'garden-repair' && step === 0) {
        assert.equal(p.blue * p.ratioYellow, task.expected * p.ratioBlue);
      } else if (task.answer.kind === 'choice') {
        const selected = task.choices.find(c => c.value === task.expected).label.match(/(\d+) blue : (\d+) yellow/);
        assert.equal(Number(selected[1]) * p.ratioYellow, Number(selected[2]) * p.ratioBlue);
      }
    }
    if (m.id === 'garden-market') assert.equal(task.expected, step === 0 ? p.cost / p.items : p.rate * p.items);
    if (p.type === 'clock' && task.answer.kind === 'pair') {
      assert.ok(task.expected.hour >= 1 && task.expected.hour <= 12);
      assert.ok(Number.isInteger(task.expected.minute) && task.expected.minute >= 0 && task.expected.minute < 60);
      assert.deepEqual(task.expected, { hour: p.targetHour, minute: p.targetMinute });
    }
    if (p.type === 'fountain' && m.id === 'fountain-land' && step === 1) {
      assert.equal(-((task.expected.left - p.h) ** 2) + p.k, 0);
      assert.equal(-((task.expected.right - p.h) ** 2) + p.k, 0);
    }
    if (p.type === 'room' && Object.hasOwn(examples, m.id)) {
      const length = p.unknownKey === 'length' ? task.expected : p.length;
      const height = p.unknownKey === 'height' ? task.expected : p.height;
      const independentlyMeasured = p.mode === 'area' ? Array.from({ length }, () => p.width).reduce((a, b) => a + b, 0) : p.mode === 'perimeter' ? length + p.width + length + p.width : length * p.width * height;
      assert.equal(step === 1 ? task.expected : p.targetMeasure, independentlyMeasured, `${m.id} dimensions`);
    }
    if (m.id === 'campus-slope' && step === 1) {
      // A symmetric secant of x² has exact slope 2x even before taking a limit.
      const delta = .125;
      assert.equal(task.expected, ((p.x + delta) ** 2 - (p.x - delta) ** 2) / (2 * delta));
    }
    if (m.id === 'campus-area' && step === 1) {
      // Integrate using the exact area of the triangle under y=x, not the model formula.
      assert.equal(task.expected, .5 * p.upper * p.upper);
    }
    if (m.bandId === 'pre-k') assert.equal(task.answer.kind, 'choice', 'youngest learners choose, never type');
    if (m.bandId === 'early' && task.answer.kind === 'number') assert.ok(task.answer.key && task.inputs.some(c => c.key === task.answer.key), 'early number answers come directly from build controls');
  }
});

test('fraction parsing rejects executable expressions and non-finite values', () => {
  for (const [input, expected] of [['1/2', .5], ['−3/4', -.75], [' 2.5 / .5 ', 5], ['.25', .25], ['+4', 4], [0, 0], [-2.5, -2.5]]) assert.equal(parseAnswer(input), expected);
  for (const input of ['', ' ', null, undefined, true, {}, [], NaN, Infinity, 'Infinity', '1/0', '0/0', '2+2', 'Math.sqrt(4)', '1e3', '3/4/5', '<script>', '1,000', '1'.repeat(101)]) assert.equal(parseAnswer(input), null, String(input));
});

test('mixed-number parsing applies the sign to the whole quantity and rejects malformed parts', () => {
  for (const [input, expected] of [['1 1/4', 1.25], ['-1 1/4', -1.25], ['−1 1/4', -1.25], ['+2 3 / 4', 2.75], ['0 1/2', .5], ['-0 1/4', -.25], ['3 0/4', 3], [' 2\t1/2 ', 2.5]]) assert.equal(parseAnswer(input), expected, input);
  for (const input of ['1 1/0', '1 1/-4', '1 -1/4', '1 +1/4', '1.5 1/4', '1 1.5/4', '1 1/4.5', '1 4/4', '1 5/4', '1 1/4/2', '1 1/4+2', '1 1/4;alert(1)', '1\n1/4', '1 1/4 extra', '1 1 1/4']) assert.equal(parseAnswer(input), null, input);
  assert.equal(checkTask(taskFor('g3y-length-plot', 0, 1), '1 1/4').correct, true);
  assert.equal(checkTask(taskFor('g3y-length-plot', 0, 2), '1 1/2').correct, true);
  assert.equal(checkTask(taskFor('g3y-length-plot', 0, 3), '1 3/4').correct, true);
});

test('feedback supports a next move without exposing worked solutions on incorrect attempts', () => {
  const task = taskFor('cargo-lift');
  const result = checkTask(task, 15); // Total for all three crates, not one crate.
  assert.equal(result.correct, false);
  assert.match(result.feedback, /all the equal crates/);
  assert.equal(result.explanation, '');
  const garden = checkTask(taskFor('garden-color'), { blue: 7, yellow: 8 });
  assert.match(garden.feedback, /total fits/);
  assert.equal(checkTask(taskFor('meadow-fractions', 1), '6/8').correct, true);
});

test('invalid mission inputs fail explicitly', () => {
  assert.throws(() => taskFor('missing'), RangeError);
  for (const step of [-1, 3, .5, NaN]) assert.throws(() => taskFor('meadow-count', step), RangeError);
  for (const seed of ['1', 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => taskFor('meadow-count', 0, seed), TypeError);
});
