import test from 'node:test';
import assert from 'node:assert/strict';
import { concepts, conceptFor } from '../src/concepts-model.mjs';
import { ageBands, missions } from '../src/adventure-model.mjs';
import { extraMissions } from '../src/content-expansion.mjs';

const visual = (id, step) => conceptFor(id).steps[step].visual;

test('Grade 3 meaning comes before shortcuts and keeps group units distinct',()=>{
  const order=conceptFor('multiplication-order');
  assert.equal(visual(order.id,0).rows*visual(order.id,0).columns,12);
  assert.equal(visual(order.id,1).rows,4);assert.equal(visual(order.id,1).columns,3);
  assert.match(order.steps[1].body,/four rows/);
  const split=visual('multiplication-split',1);
  assert.equal(split.rows*split.splitColumn,15);assert.equal(split.rows*(split.columns-split.splitColumn),6);
  assert.equal(visual('multiplication-zero-one',2).count,0);
  assert.match(conceptFor('division-meaning').steps[1].caption,/snacks per plate/);
  assert.match(conceptFor('division-meaning').steps[2].caption,/bags/);
  assert.match(conceptFor('division-zero-one').steps[2].body,/Dividing by zero is not allowed/);
});

test('every current mission has a plain-language teaching sequence before practice', () => {
  assert.equal(concepts.length, 120);
  assert.equal(new Set(concepts.map(c => c.id)).size, concepts.length);
  for (const mission of missions) {
    const concept = conceptFor(mission);
    assert.ok(concept, `${mission.id} has a concept`);
    assert.ok(concept.bandIds.includes(mission.bandId), `${mission.id} uses appropriate concept band`);
    assert.equal(conceptFor(mission.id), concept, `${mission.id} string lookup agrees`);
  }
  assert.equal(missions.length, 271);
  for (const mission of extraMissions) assert.equal(conceptFor(mission.id).id, mission.conceptKey);
  for (const concept of concepts) {
    assert.ok(concept.steps.length >= 3 && concept.steps.length <= (concept.id === 'fractions' ? 6 : concept.id === 'k-shapes' ? 5 : 4), concept.id);
    assert.ok(concept.parentTip.length > 10);
    for (const band of concept.bandIds) assert.ok(ageBands.some(b => b.id === band), `${concept.id} valid band`);
    for (const step of concept.steps) {
      for (const key of ['title', 'body', 'caption', 'actionLabel']) {
        assert.equal(typeof step[key], 'string', `${concept.id} ${key}`);
        assert.ok(step[key].trim().length > 0);
        assert.ok(!step[key].includes('undefined'));
      }
      assert.equal(typeof step.visual.type, 'string');
      assert.equal(Object.hasOwn(step, 'expected'), false, 'teaching cards do not grade a response');
      assert.doesNotThrow(() => JSON.stringify(step));
    }
  }
});

test('fraction introduction builds meaning before notation, and keeps equal parts explicit', () => {
  const steps = conceptFor('fractions').steps;
  assert.deepEqual(steps.map(step => [step.visual.parts, step.visual.selected]), [[1, 0], [8, 0], [8, 3], [8, 3], [4, 3], [8, 3]]);
  assert.equal(steps[0].visual.emphasize, 'whole');
  assert.equal(steps[1].visual.animate, 'split');
  assert.equal(steps[2].visual.animate, 'select');
  assert.equal(steps[3].visual.showNotation, true);
  assert.equal(steps[3].visual.numeratorLabel, 'parts selected');
  assert.equal(steps[3].visual.denominatorLabel, 'equal parts in the whole');
  assert.equal(steps[3].visual.selected / steps[3].visual.parts, 3 / 8);
  const unequal = steps[4].visual;
  assert.equal(unequal.equalParts, false);
  assert.ok(new Set(unequal.partWidths).size > 1);
  const wholeWidth = unequal.partWidths.reduce((sum, width) => sum + width, 0);
  const selectedWidth = unequal.partWidths.slice(0, unequal.selected).reduce((sum, width) => sum + width, 0);
  assert.equal(selectedWidth / wholeWidth, .5, 'three selected unequal pieces cover half, not three quarters');
  assert.notEqual(selectedWidth / wholeWidth, unequal.selected / unequal.parts);
  assert.equal(steps[5].visual.selected / steps[5].visual.parts, 3 / 8, 'return to the correct picture before practice');
});

test('equivalent fraction examples preserve a fixed selected proportion', () => {
  const values = conceptFor('fraction-equivalence').steps.map(step => [step.visual.selected, step.visual.parts]);
  assert.deepEqual(values, [[1, 2], [2, 4], [4, 8]]);
  for (const [selected, parts] of values) assert.equal(selected / parts, .5);
});

test('small-number introductions use independently checked collections and operations', () => {
  assert.deepEqual(conceptFor('counting').steps.map(step => step.visual.count), [1, 2, 3]);
  assert.deepEqual(conceptFor('zero').steps.map(step => step.visual.count), [2, 1, 0]);
  assert.deepEqual(conceptFor('compare').steps.map(step => Math.sign(step.visual.count - step.visual.compareCount)), [0, -1, 1]);
  const plus = visual('addition', 1), minus = visual('subtraction', 1);
  assert.equal(plus.count, 2); assert.equal(plus.compareCount, 1); assert.equal(plus.answerCount, 3);
  assert.equal(minus.count, 5); assert.equal(minus.compareCount, 2); assert.equal(minus.answerCount, 3);
  assert.equal(plus.count + plus.compareCount, plus.answerCount);
  assert.equal(minus.count - minus.compareCount, minus.answerCount);
  assert.deepEqual(conceptFor('place-value').steps.map(step => 10 * step.visual.tens + step.visual.ones), [10, 13, 23]);
  assert.deepEqual(conceptFor('multiplication').steps.map(step => step.visual.rows * step.visual.columns), [3, 6, 6]);
  assert.deepEqual(conceptFor('division').steps.map(step => [step.visual.rows, step.visual.columns]), [[1, 12], [3, 4], [3, 4]]);
  assert.equal(visual('make-ten', 1).parts - visual('make-ten', 1).selected, 4);
  const move = visual('negatives', 2);
  assert.equal(move.start, -3); assert.equal(move.moves[0], 5); assert.equal(move.end, 2);
});

test('clock examples show valid hours and actual elapsed fractions of an hour', () => {
  assert.deepEqual(conceptFor('clock-hours').steps.map(step => [step.visual.hour, step.visual.minute]), [[12, 0], [3, 0], [7, 0]]);
  assert.deepEqual(conceptFor('clock-halves').steps.map(step => [step.visual.hour, step.visual.minute]), [[3, 0], [3, 30], [4, 0]]);
  assert.deepEqual(conceptFor('clock-quarters').steps.map(step => [step.visual.hour, step.visual.minute]), [[3, 0], [3, 15], [3, 45], [4, 0]]);
  for (const id of ['clock-hours', 'clock-halves', 'clock-quarters']) for (const step of conceptFor(id).steps) {
    const { hour, minute } = step.visual;
    assert.ok(hour >= 1 && hour <= 12 && [0, 15, 30, 45].includes(minute));
    assert.equal(step.visual.showDigital, true, 'worked clock examples can show notation');
  }
  assert.equal(visual('clock-halves', 1).minute / 60, .5);
  assert.equal(visual('clock-quarters', 1).minute / 60, .25);
  assert.equal(visual('clock-quarters', 2).minute / 60, .75);
});

test('geometry, ratios, and rates agree with their worked quantities', () => {
  assert.deepEqual(conceptFor('area').steps.map(step => step.visual.length * step.visual.width), [3, 6, 6]);
  assert.deepEqual(conceptFor('perimeter').steps.map(step => 2 * (step.visual.length + step.visual.width)), [6, 10, 10]);
  assert.deepEqual(conceptFor('volume').steps.map(step => step.visual.length * step.visual.width * step.visual.height), [6, 12, 18]);
  for (const id of ['ratio', 'proportion']) for (const step of conceptFor(id).steps) {
    const { blue, yellow, ratioBlue, ratioYellow } = step.visual;
    assert.equal(blue * ratioYellow, yellow * ratioBlue);
  }
  assert.deepEqual(conceptFor('ratio').steps.map(step => step.visual.blue + step.visual.yellow), [5, 10, 15]);
  assert.deepEqual(conceptFor('unit-rate').steps.map(step => step.visual.cost), [6, 2, 8]);
  for (const step of conceptFor('unit-rate').steps) assert.equal(step.visual.cost / step.visual.items, 2);
});

test('algebra and function examples match independent substitutions', () => {
  for (const id of ['equality', 'equations']) for (const step of conceptFor(id).steps) {
    const { a, b, c, x } = step.visual;
    assert.equal(x, 4); assert.equal(a * x + b, c);
  }
  assert.deepEqual(conceptFor('lines').steps.map(step => step.visual.a * step.visual.markerX + step.visual.b), [1, 3, 7]);
  const vertex = visual('quadratics', 0), height = visual('quadratics', 1), roots = visual('quadratics', 2);
  assert.deepEqual([vertex.h, vertex.k], [2, 4]);
  assert.equal(-((height.x - height.h) ** 2) + height.k, 3);
  assert.equal(-((0 - roots.h) ** 2) + roots.k, 0);
  assert.equal(-((4 - roots.h) ** 2) + roots.k, 0);
  assert.deepEqual(conceptFor('exponentials').steps.map(step => step.visual.a * step.visual.b ** step.visual.markerX + step.visual.c), [2, 8, 16]);
  const square = visual('powers', 2);
  assert.equal(square.a * square.markerX ** square.exponent + square.c, 9);
});

test('college examples distinguish rate, height, accumulation, and displacement', () => {
  const tangent = conceptFor('derivative').steps.map(step => step.visual);
  assert.deepEqual(tangent.map(p => p.coefficient * p.x ** 2), [1, 4, 1]);
  assert.deepEqual(tangent.map(p => 2 * p.coefficient * p.x), [2, 4, -2]);
  assert.deepEqual(conceptFor('integral').steps.map(step => step.visual.upper ** 2 / 2), [2, 2, 4.5]);
  const vectors = visual('vectors', 2);
  assert.equal(vectors.x + vectors.dx, 1);
  assert.equal(vectors.y + vectors.dy, 3);
  assert.deepEqual([vectors.sumX, vectors.sumY], [1, 3]);
});

test('targeted introductions teach the added principles with separate worked examples', () => {
  assert.deepEqual(conceptFor('clock-minutes').steps.map(step => step.visual.minute), [0, 5, 20]);
  assert.deepEqual(conceptFor('clock-elapsed').steps.map(step => 60 * step.visual.hour + step.visual.minute), [150, 180, 210]);
  const meeting = visual('systems', 2);
  assert.equal(meeting.a * 3 + meeting.b, 7);
  assert.equal(meeting.comparison.a * 3 + meeting.comparison.b, 7);
  assert.deepEqual(conceptFor('quadratics-up').steps.map(step => step.visual.a * step.visual.markerX ** 2 + step.visual.b * step.visual.markerX + step.visual.c), [-4, 0, -3]);
  assert.deepEqual(conceptFor('exponential-decay').steps.map(step => step.visual.a * step.visual.b ** step.visual.markerX), [16, 4, 2]);
  for (const step of conceptFor('derivative-power').steps) {
    const p = step.visual;
    const height = p.a * p.markerX ** p.exponent + p.c;
    assert.equal(p.comparison.a * p.markerX + p.comparison.b, height, 'tangent passes through contact point');
    assert.equal(p.comparison.a, p.a * p.exponent * p.markerX ** (p.exponent - 1), 'tangent has derivative slope');
  }
  assert.deepEqual(conceptFor('derivative-power').steps.map(step => step.visual.comparison.a), [6, 6, 24]);
  const tangent = visual('tangent-line', 2);
  const estimate = tangent.comparison.a * 2.1 + tangent.comparison.b;
  assert.ok(Math.abs(estimate - 4.4) < 1e-10);
  assert.ok(Math.abs(2.1 ** 2 - estimate - .01) < 1e-10);
  assert.ok(conceptFor('integral-constant').steps.every(step => step.visual.b * (step.visual.integralEnd - step.visual.integralStart) === 6));
  assert.deepEqual(conceptFor('integral-interval').steps.map(step => (step.visual.integralEnd ** 2 - step.visual.integralStart ** 2) / 2), [4, -2, 0]);
  assert.deepEqual(conceptFor('vector-scale').steps.map(step => [step.visual.sumX, step.visual.sumY]), [[4, 2], [1, .5], [-2, -1]]);
  for (const step of conceptFor('vector-scale').steps) {
    assert.equal(step.visual.mode, 'scale');
    assert.equal(step.visual.scalar * step.visual.x, step.visual.sumX);
    assert.equal(step.visual.scalar * step.visual.y, step.visual.sumY);
  }
  const difference = visual('vector-difference', 1);
  assert.equal(difference.endX - difference.startX, difference.sumX);
  assert.equal(difference.endY - difference.startY, difference.sumY);
  const reverse = visual('vector-difference', 2);
  assert.deepEqual([reverse.sumX, reverse.sumY], [-3, -2]);
});

test('concept lookup accepts mission metadata, direct concepts, and missing values safely', () => {
  assert.equal(conceptFor({ id: 'future-mission', conceptKey: 'fractions' }), conceptFor('fractions'));
  assert.equal(conceptFor({ id: 'future-mission', conceptId: 'lines' }), conceptFor('lines'));
  for (const value of [null, undefined, '', 'missing', 8, {}, { conceptKey: 'missing' }]) assert.equal(conceptFor(value), null);
});
