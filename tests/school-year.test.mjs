import test from 'node:test';
import assert from 'node:assert/strict';
import { grade3Year, schoolYearForGrade, unitForMission, orderedMissions, nextInYear } from '../src/school-year.mjs';
import { missions } from '../src/adventure-model.mjs';
import { yearMissions } from '../src/grade3-year-content.mjs';
import { missionPlacement } from '../src/curriculum-map.mjs';

const ids = grade3Year.units.flatMap(unit => unit.missionIds);
const newIds = [
  'hundreds-trade', 'number-compose', 'round-ten', 'round-hundred', 'add-regroup', 'subtract-regroup',
  'equal-area-split', 'near-ten-fact', 'three-factor-pack', 'divide-split', 'unknown-position', 'two-step-inventory',
  'unit-line', 'locate-share', 'whole-number', 'above-one', 'equivalent-line', 'compare-same-bottom', 'compare-same-top', 'compare-half',
  'minute-clock', 'elapsed-cross-hour', 'liters-scale', 'mass-balance', 'bar-chart', 'picture-key', 'line-plot', 'length-plot',
  'attributes', 'quadrilateral-sort', 'tile-area', 'area-compose', 'same-perimeter', 'missing-side', 'plan-picnic', 'design-garden'
].map(id => 'g3y-' + id);

test('the independent Grade 3 map has eight coherent units and thirty-six flexible weeks', () => {
  assert.equal(grade3Year.gradeId, '3');
  assert.equal(grade3Year.units.length, 8);
  assert.deepEqual(grade3Year.units.map(unit => unit.sequence), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(grade3Year.units.map(unit => unit.weeks), [5, 4, 4, 6, 6, 5, 4, 2]);
  assert.equal(grade3Year.units.reduce((sum, unit) => sum + unit.weeks, 0), 36);
  assert.equal(ids.length, 76);
  assert.equal(new Set(ids).size, ids.length, 'each lesson has one primary home');
  assert.deepEqual(ids.filter(id => id.startsWith('g3y-')).sort(), newIds.slice().sort());
  for (const unit of grade3Year.units) {
    assert.ok(unit.title.length > 10 && unit.goal.length > 20);
    assert.ok(unit.prerequisiteSkills.length >= 2);
    assert.ok(unit.methods.length >= 3);
    assert.ok(unit.everydayPractice.length >= 2);
    assert.equal(unit.reviewMissionIds.length, 3);
    assert.ok(unit.standards.length >= 3);
    assert.ok(unit.standards.every(code => /^3\.(OA|NBT|NF|MD|G)\.[A-D]\.\d+$/.test(code)));
    for (const url of unit.sourceUrls) {
      const parsed = new URL(url);
      assert.equal(parsed.protocol, 'https:');
      assert.ok(['www.thecorestandards.org', 'im.kendallhunt.com'].includes(parsed.hostname));
      assert.ok(!url.includes('accessim'), 'the consulted curriculum source is the first edition');
    }
  }
});

test('all existing Grade 3 work has a primary unit and planned new work stays in its intended domain', () => {
  const old = ids.filter(id => !id.startsWith('g3y-'));
  assert.equal(old.length, 40);
  assert.ok(old.every(id => missions.some(mission => mission.id === id)), 'all existing references resolve');
  assert.deepEqual(grade3Year.units[2].missionIds.slice(0, 6).sort(), ['g3y-number-compose', 'g3y-hundreds-trade', 'g3y-round-ten', 'g3y-round-hundred', 'g3y-add-regroup', 'g3y-subtract-regroup'].sort());
  assert.equal(unitForMission('g3y-unit-line').sequence, 5);
  assert.equal(unitForMission('g3y-liters-scale').sequence, 6);
  assert.equal(unitForMission('g3y-quadrilateral-sort').sequence, 7);
  assert.equal(unitForMission('g3y-plan-picnic').sequence, 8);
  assert.equal(unitForMission('room-stack'), null, 'Grade 5 volume is not silently placed in Grade 3');
});

test('the complete authored inventory resolves once and agrees with every new lesson unit', () => {
  const inventory = [...new Map([...missions, ...yearMissions].map(mission => [mission.id, mission])).values()];
  const ordered = orderedMissions(inventory);
  assert.deepEqual(ordered.map(mission => mission.id), ids);
  assert.deepEqual(yearMissions.map(mission => mission.id).sort(), newIds.slice().sort());
  for (const mission of yearMissions) {
    assert.equal(unitForMission(mission.id)?.id, mission.unitId, mission.id + ': authored primary unit');
    assert.ok(mission.gradeIds.includes('3'));
    assert.equal(typeof mission.lessonPlan?.workedExample, 'string');
    assert.ok(mission.lessonPlan.workedExample.length > 30, mission.id + ': teaching before practice');
  }
  const grade3 = inventory.filter(mission => missionPlacement(mission).gradeIds.includes('3'));
  assert.deepEqual(grade3.map(mission => mission.id).sort(), ids.slice().sort(), 'every Grade 3 activity has a primary home');
});

test('prerequisite suggestions are optional foundations or earlier units, and reviews revisit introduced work', () => {
  const known = new Set([...missions.map(mission => mission.id), ...newIds]);
  for (const unit of grade3Year.units) {
    for (const id of unit.prerequisiteMissionIds) {
      assert.ok(known.has(id), `${unit.id}: known prerequisite ${id}`);
      const prior = unitForMission(id);
      if (prior) assert.ok(prior.sequence < unit.sequence, `${unit.id}: no circular prerequisite`);
    }
    for (const id of unit.reviewMissionIds) {
      const home = unitForMission(id);
      assert.ok(home && home.sequence <= unit.sequence, `${unit.id}: review ${id} has already been introduced`);
    }
  }
});

test('year lookup and ordering preserve supplied mission objects without inventing inventory', () => {
  assert.equal(schoolYearForGrade('3'), grade3Year);
  assert.equal(schoolYearForGrade(3), grade3Year);
  for (const id of ['all', '2', '4', null, undefined, {}, ['3']]) assert.equal(schoolYearForGrade(id), null);
  const first = { id: ids[0], title: 'First actual object' }, later = { id: ids[6], title: 'Later actual object' };
  const input = [later, { id: 'unmapped' }, first, { id: first.id, title: 'Duplicate' }, null];
  const before = input.slice();
  const ordered = orderedMissions(input);
  assert.deepEqual(ordered, [first, later]);
  assert.equal(ordered[0], first);
  assert.deepEqual(input, before);
  assert.deepEqual(orderedMissions(undefined), []);
  assert.deepEqual(orderedMissions([]), []);
  assert.equal(unitForMission('unknown'), null);
  assert.equal(unitForMission(null), null);
});

test('next recommendation starts at the first lesson and freely resumes an unfinished later unit', () => {
  assert.deepEqual(nextInYear(null), { missionId: ids[0], unitId: 'g3-unit-1', unitTitle: grade3Year.units[0].title, sequence: 1 });
  const late = grade3Year.units[4].missionIds[2];
  const state = { completed: {}, inProgress: { missionId: late }, preferences: { gradeId: '3' } };
  const copy = structuredClone(state);
  assert.equal(nextInYear(state).missionId, late, 'no prerequisite gate blocks an intentionally chosen unit');
  assert.equal(nextInYear(state).unitId, 'g3-unit-5');
  assert.deepEqual(state, copy, 'recommendations do not mutate progress, currency, or preferences');
  assert.equal(nextInYear({ inProgress: { missionId: 'unmapped' } }).missionId, ids[0]);
});

test('completion means practiced, including supported work, rather than a claim of mastery', () => {
  const state = { completed: { [ids[0]]: { supported: true }, [ids[1]]: true } };
  assert.equal(nextInYear(state).missionId, ids[2]);
  state.inProgress = { missionId: ids[0] };
  assert.equal(nextInYear(state).missionId, ids[2], 'a completed replay does not replace the next unfinished suggestion');
  const complete = Object.fromEntries(ids.map(id => [id, { supported: true }]));
  assert.equal(nextInYear({ completed: complete }), null);
  for (const malformed of [null, false, 'done', [], 0]) assert.equal(nextInYear({ completed: { [ids[0]]: malformed } }).missionId, ids[0]);
});

test('methods retain the units and meaning of the independent worked family examples', () => {
  assert.match(grade3Year.units[3].methods.join(' '), /whole.*number of groups.*number in each group/);
  assert.match(grade3Year.units[4].methods.join(' '), /whole.*equal parts/);
  assert.match(grade3Year.units[5].methods.join(' '), /grams.*kilograms.*liters/);
  // Independent examples used in the guide; no model answer is used as an oracle.
  assert.equal(268 + 157, 425);
  assert.equal(403 - 178, 225);
  assert.equal(18 / 3, 6);
  assert.equal(5 * 8 + 1 * 8, 48);
  assert.equal(80 / 4 + 4 / 4, 21);
  assert.equal((6 - 2) * 4, 16);
  assert.ok(3 / 8 > 1 / 8 && 1 / 3 > 1 / 6);
  assert.equal((3 * 60 + 15) - (2 * 60 + 40), 35);
});
