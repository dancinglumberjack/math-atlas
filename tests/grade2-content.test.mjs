import test from 'node:test';
import assert from 'node:assert/strict';
import { g2Missions, g2TaskFor, g2Concepts, g2Units } from '../src/grade2-content.mjs';
import { checkTask } from '../src/adventure-model.mjs';

// Hand-worked separately from production formulas. These literal keys pin all
// 72 canonical questions, including each interpreted choice and place value.
const canonical = {
  'hundreds-house': [{ hundreds: 4, tens: 0, ones: 6 }, '400', '10'],
  'number-names': [{ hundreds: 5, tens: 3, ones: 2 }, '500 + 30 + 2', 'five hundred thirty-two'],
  'compare-digits': ['less', 'greater', 'equal'],
  'skip-trails': [50, 150, 820],
  'add-bridge': ['trade', { tens: 4, ones: 5 }, { tens: 4, ones: 2 }],
  'subtract-trade': ['52', { tens: 2, ones: 5 }, { tens: 2, ones: 5 }],
  'three-digit-path': [{ hundreds: 3, tens: 7, ones: 0 }, { hundreds: 3, tens: 4, ones: 2 }, { hundreds: 6, tens: 7, ones: 0 }],
  'two-step-story': [{ tens: 2, ones: 4 }, { tens: 2, ones: 8 }, { tens: 5, ones: 0 }],
  'partner-parade': ['even', 'odd', { rows: 2, columns: 7 }],
  'array-rows': [{ rows: 3, columns: 4 }, '4 + 4 + 4', 12],
  'array-turn': [{ rows: 5, columns: 2 }, '10', '2 + 2 + 2 + 2 + 2'],
  'equal-addends': [6, 6, 2],
  'ruler-start': [6, '3', 'cm'],
  'length-difference': [3, 15, 6],
  'number-line-walk': [35, 27, 33],
  'measurement-plot': [2, 6, '4'],
  'five-minute-clock': [{ hour: 4, minute: 35 }, '4:35', { hour: 4, minute: 40 }],
  'day-clock': ['am', 'pm', 'context'],
  'coin-counter': [38, '43', 'same'],
  'tiny-shop': [5, 20, '5'],
  'shape-features': ['pentagon', '6', 'no'],
  'square-tiles': [{ rows: 3, columns: 4 }, 12, 'equal'],
  'fair-ribbons': ['half', 'third', 4],
  'same-share': ['half', 'same', 'equal-area']
};

// One additional independently worked challenge per lesson uses variation 2.
const secondExamples = {
  'hundreds-house': { hundreds: 5, tens: 2, ones: 0 },
  'number-names': { hundreds: 6, tens: 0, ones: 8 },
  'compare-digits': 'greater', 'skip-trails': 60, 'add-bridge': 'trade', 'subtract-trade': '61',
  'three-digit-path': { hundreds: 5, tens: 9, ones: 0 },
  'two-step-story': { tens: 3, ones: 2 },
  'partner-parade': 'even', 'array-rows': { rows: 4, columns: 3 }, 'array-turn': { rows: 4, columns: 3 },
  'equal-addends': 8, 'ruler-start': 8, 'length-difference': 4, 'number-line-walk': 45, 'measurement-plot': 2,
  'five-minute-clock': { hour: 6, minute: 45 }, 'day-clock': 'am', 'coin-counter': 36, 'tiny-shop': 15,
  'shape-features': 'hexagon', 'square-tiles': { rows: 2, columns: 5 }, 'fair-ribbons': 'third', 'same-share': 'fourth'
};

test('Grade 2 has 24 original lessons in six ordered units with planning notes', () => {
  assert.equal(g2Missions.length, 24);
  assert.equal(new Set(g2Missions.map(m => m.id)).size, 24);
  assert.deepEqual(g2Missions.map(m => m.id).sort(), Object.keys(canonical).map(s => `g2y-${s}`).sort());
  assert.equal(g2Units.length, 6);
  assert.equal(g2Units.reduce((sum, unit) => sum + unit.weeks, 0), 36);
  assert.deepEqual(g2Units.map(u => u.sequence), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(g2Units.flatMap(u => u.missionIds), g2Missions.map(m => m.id));
  for (const unit of g2Units) {
    assert.equal(unit.missionIds.length, 4);
    assert.equal(unit.weeks, 6);
    assert.ok(unit.title.length > 8 && unit.goal.length > 20);
    assert.ok(unit.methods.length >= 3 && unit.prerequisiteSkills.length >= 2 && unit.everydayPractice.length >= 2);
    assert.deepEqual(unit.reviewMissionIds, []);
    assert.deepEqual(unit.prerequisiteMissionIds, []);
    assert.ok(unit.sourceUrls.every(url => url.startsWith('https://www.thecorestandards.org/Math/Content/2/')));
    for (const id of unit.missionIds) assert.equal(g2Missions.find(m => m.id === id)?.unitId, unit.id);
  }
  for (const mission of g2Missions) {
    assert.equal(mission.bandId, 'early');
    assert.deepEqual(mission.gradeIds, ['2']);
    assert.deepEqual(mission.sourceIds, []);
    assert.match(mission.unitId, /^g2-unit-[1-6]$/);
    assert.ok(mission.standards.length && mission.standards.every(s => /^2\.(?:NBT|OA|MD|G)\.[A-D]\.\d+[a-b]?$/.test(s)));
    assert.ok(g2Concepts.some(c => c.id === mission.conceptKey));
    for (const name of ['goal', 'prerequisite', 'workedExample', 'explainPrompt', 'reviewPrompt']) assert.ok(mission.lessonPlan[name].length >= 20, `${mission.id} ${name}`);
  }
});

test('72 canonical challenges agree with literal, independently worked answer keys', () => {
  for (const [suffix, expected] of Object.entries(canonical)) for (let step = 0; step < 3; step++) {
    const task = g2TaskFor(`g2y-${suffix}`, step, 1);
    assert.deepEqual(task.expected, expected[step], `${suffix}:${step}`);
    assert.equal(checkTask(task, expected[step]).correct, true, `${suffix}:${step}`);
    const wrong = task.answer.kind === 'pair' ? Object.fromEntries(task.answer.keys.map(key => [key, expected[step][key] + 1])) : task.answer.kind === 'choice' ? task.choices.find(c => c.value !== expected[step]).value : expected[step] + 1;
    assert.equal(checkTask(task, wrong).correct, false, `${suffix}:${step} must distinguish a wrong answer`);
  }
});

test('24 second-seed worked answers and three bounded variations preserve reachability', () => {
  assert.equal(Object.keys(secondExamples).length, 24);
  for (const [suffix, expected] of Object.entries(secondExamples)) {
    const task = g2TaskFor(`g2y-${suffix}`, 0, 2);
    assert.deepEqual(task.expected, expected, suffix);
    assert.equal(checkTask(task, expected).correct, true);
  }
  const variants = [-8, -1, 0, 1, 2, 3, 17, Number.MAX_SAFE_INTEGER];
  for (const mission of g2Missions) {
    assert.equal(new Set([1, 2, 3].map(seed => JSON.stringify([0, 1, 2].map(step => { const t = g2TaskFor(mission.id, step, seed); return [t.prompt, t.visual, t.expected]; })))).size, 3, `${mission.id} three meaningful variations`);
    for (const seed of variants) for (let step = 0; step < 3; step++) {
      const task = g2TaskFor(mission.id, step, seed);
      assert.deepEqual(task, g2TaskFor(mission.id, step, seed));
      assert.equal(checkTask(task, task.expected).correct, true);
      for (const key of ['prompt', 'instruction', 'hint', 'explanation', 'why']) assert.ok(typeof task[key] === 'string' && task[key].length > 10 && !/undefined|NaN/.test(task[key]), `${mission.id}:${step} ${key}`);
      assert.ok(task.prompt.length < 240 && task.instruction.length < 240);
      if (task.answer.kind === 'choice') {
        assert.ok(task.choices.length >= 2);
        assert.equal(new Set(task.choices.map(c => c.value)).size, task.choices.length);
        assert.ok(task.choices.some(c => c.value === task.expected));
        assert.deepEqual(task.inputs, []);
      } else {
        const keys = task.answer.kind === 'pair' ? task.answer.keys : [task.answer.key];
        assert.ok(keys.length > 0 && keys.every(key => task.inputs.some(i => i.key === key)), `${mission.id} must not require typed answers`);
        assert.equal(task.inputs.length, keys.length);
        for (const def of task.inputs) {
          const expected = task.answer.kind === 'pair' ? task.expected[def.key] : task.expected;
          assert.ok([def.min, def.max, def.initial, def.step, expected].every(Number.isFinite));
          assert.ok(def.min <= def.initial && def.initial <= def.max && def.step > 0);
          assert.ok(expected >= def.min && expected <= def.max, `${mission.id}:${step} reachable`);
          assert.ok(Number.isInteger((expected - def.min) / def.step));
        }
        const initial = task.answer.kind === 'pair' ? Object.fromEntries(task.inputs.map(i => [i.key, i.initial])) : task.inputs[0].initial;
        assert.equal(checkTask(task, initial).correct, false, `${mission.id}:${step} needs a learner action`);
      }
      const v = task.visual;
      if (v.type === 'base-ten') {
        assert.ok(Number.isInteger(v.hundreds) && v.hundreds >= 0 && v.hundreds <= 9);
        for (const key of ['tens', 'ones']) assert.ok(Number.isInteger(v[key]) && v[key] >= 0 && v[key] <= (v.teachingTrade ? 19 : 9));
      }
      if (v.type === 'number-line') assert.ok(v.min >= 0 && v.max <= 1000 && v.min < v.max && v.end >= v.min && v.end <= v.max && v.tickStep > 0);
      if (v.type === 'clock') assert.ok(v.hour >= 1 && v.hour <= 12 && v.minute >= 0 && v.minute < 60 && v.minute % 5 === 0);
      if (v.type === 'data') {
        assert.ok(v.values.every(Number.isInteger));
        if (v.kind === 'line-plot') assert.equal(v.tickStep, 1);
        else assert.equal(v.key, 1);
      }
      if (v.type === 'primary' && v.kind === 'partition') assert.ok([2, 3, 4].includes(v.parts) && v.selected >= 0 && v.selected <= v.parts);
      if (v.type === 'primary' && v.kind === 'money') assert.ok(v.currency === 'USD' && v.coins.every(c => [1, 5, 10, 25].includes(c)) && (v.bills || []).every(b => b === 1));
      if (v.type === 'measurement') assert.ok(v.unit === 'cm' && Number.isInteger(v.value) && v.tickStep === 1);
    }
  }
});

test('worked teaching cards explain eight ideas using independent examples', () => {
  assert.equal(g2Concepts.length, 8);
  assert.equal(new Set(g2Concepts.map(c => c.id)).size, 8);
  for (const concept of g2Concepts) {
    assert.deepEqual(concept.bandIds, ['early']);
    assert.equal(concept.steps.length, 4);
    assert.ok(concept.parentTip.length >= 40);
    for (const card of concept.steps) {
      for (const key of ['title', 'body', 'caption', 'actionLabel']) assert.ok(typeof card[key] === 'string' && card[key].length > 0);
      assert.ok(card.visual.type);
      assert.equal(Object.hasOwn(card, 'expected'), false);
    }
  }
  const visuals = id => g2Concepts.find(c => c.id === id).steps.map(s => s.visual);
  const value = v => 100 * v.hundreds + 10 * v.tens + v.ones;
  assert.deepEqual(visuals('g2-bundles').map(value), [100, 315, 305, 241]);
  assert.deepEqual(visuals('g2-trades').map(value), [44, 44, 44, 27]);
  const [combined, traded, opened, left] = visuals('g2-trades');
  assert.deepEqual([traded.tens - combined.tens, traded.ones - combined.ones], [1, -10]);
  assert.deepEqual([opened.tens - traded.tens, opened.ones - traded.ones], [-1, 10]);
  assert.equal(value(opened) - value(left), 17);
  const groups = visuals('g2-equal-groups');
  assert.equal(groups[0].count % 2, 0);
  assert.equal(groups[1].count % 2, 1);
  assert.equal(groups[2].rows * groups[2].columns, 12);
  assert.equal(groups[3].rows * groups[3].columns, 12);
  assert.deepEqual([groups[2].rows, groups[2].columns], [groups[3].columns, groups[3].rows]);
  assert.equal(visuals('g2-length-lines')[3].values.length, 4);
  assert.equal(visuals('g2-length-lines')[3].values.filter(x => x === 4).length, 2);
  assert.deepEqual(visuals('g2-money').map(v => v.coins.reduce((a, b) => a + b, 0)), [41, 20, 30, 40]);
  assert.deepEqual(visuals('g2-time-day').map(v => [v.hour, v.minute]), [[3, 20], [3, 20], [3, 25], [3, 25]]);
});

test('lesson handlers reject invalid step and seed state without swallowing unknown IDs', () => {
  assert.equal(g2TaskFor('missing'), null);
  for (const step of [-1, 3, 1.5, NaN]) assert.throws(() => g2TaskFor('g2y-hundreds-house', step, 1), RangeError);
  for (const seed of [1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => g2TaskFor('g2y-hundreds-house', 0, seed), TypeError);
});
