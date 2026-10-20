import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { root } from '../scripts/build.mjs';

const curriculum = readFileSync(resolve(root, 'src/curriculum.js'), 'utf8');
const app = readFileSync(resolve(root, 'src/app.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(curriculum + '\nglobalThis.api={lessons:LESSONS,courses:COURSES};', context);
const { lessons, courses } = context.api;
const defaults = lesson => Object.fromEntries(lesson.inputs.map(input => [input.key, input.value]));
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) <= Math.max(1e-10, Math.abs(expected) * 1e-10), `${label}: expected ${expected}, got ${actual}`);

test('80 unique lessons in nine courses satisfy contracts at defaults, limits, and seeded samples', () => {
  assert.equal(lessons.length, 80);
  assert.equal(courses.length, 9);
  assert.equal(new Set(lessons.map(lesson => lesson.id)).size, lessons.length);
  let seed = 40531, checked = 0;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (const lesson of lessons) {
    assert.ok(courses.some(course => course.id === lesson.course), lesson.id);
    assert.ok(lesson.title && lesson.goal && lesson.why && lesson.prereq, lesson.id);
    for (const input of lesson.inputs) {
      assert.ok(input.min <= input.value && input.value <= input.max && input.step > 0, lesson.id + ' control bounds');
    }
    const variants = [defaults(lesson), ...['min', 'max'].map(side => Object.fromEntries(lesson.inputs.map(input => [input.key, input[side]])))];
    for (let i = 0; i < 10; i++) variants.push(Object.fromEntries(lesson.inputs.map(input => [input.key, Number((input.min + Math.floor(random() * (Math.round((input.max - input.min) / input.step) + 1)) * input.step).toFixed(8))])));
    for (const params of variants) {
      const model = lesson.model(params); checked++;
      assert.ok(Number.isFinite(model.answer), lesson.id + ': nonfinite answer');
      assert.ok(model.equation && model.question && model.caption && model.hint, lesson.id + ': missing explanation');
      assert.equal(model.steps.length, 3, lesson.id + ': worked steps');
      assert.ok(model.steps.every(step => typeof step === 'string' && step.length), lesson.id);
      assert.ok(model.diagram?.type, lesson.id + ': missing diagram');
      assert.ok(Number.isFinite(model.tolerance) && model.tolerance > 0, lesson.id + ': tolerance');
      assert.doesNotMatch(JSON.stringify({ equation: model.equation, steps: model.steps, diagram: model.diagram }), /NaN|Infinity/, lesson.id);
      const finiteDiagram = value => {
        if (typeof value === 'number') assert.ok(Number.isFinite(value), lesson.id + ': nonfinite diagram value');
        else if (value && typeof value === 'object') Object.values(value).forEach(finiteDiagram);
      };
      finiteDiagram(model.diagram);
    }
  }
  assert.equal(checked, 1040);
});

test('every default model agrees with an independently calculated numeric example', () => {
  const known = {
    'integer-addition':4,'integer-subtraction':7,'absolute-value':6,'factors-multiples':6,'fraction-equivalence':4,
    'fraction-addition':7/12,'fraction-multiplication':2/25,'fraction-division':3,'decimals-percents':35/100,
    'powers':2*2*2,'order-operations':14,'unit-rates':6/3,'proportions':3*4,'percent-of':80/4,'percent-change':120,
    'scale-drawings':4*5,'simple-interest':500*.05*3,'distributive-property':18,'combine-like-terms':20,
    'linear-equations':(16-4)/3,'inequalities':3,'coordinate-plane':3,'scientific-notation':30000,
    'slope':3/2,'slope-intercept':5,'systems':-4/3,'function-input-output':11,'quadratic-vertex':2,
    'factor-quadratics':1,'absolute-value-graphs':2,'rectangle-area':6*4,'triangle-area':8*5/2,'trapezoid-area':20,
    'circle-measurement':16*Math.PI,'pythagorean':Math.hypot(3,4),'triangle-angles':70,'supplementary-angles':115,
    'polygon-angles':108,'similarity-scale':2.25,'translations':3,'reflections':-3,'rotations':-2,
    'rectangular-prism':5*4*3,'surface-area':2*(4*3+4*2+3*2),'volume-cylinder':Math.PI*3*3*5,'volume-cone':Math.PI*3*3*5/3,'volume-sphere':4/3*Math.PI*3**3,
    'arc-length':2*Math.PI,'exponent-laws':5,'radicals':Math.sqrt(18),'quadratic-formula':16,
    'polynomial-structure':20,'rational-functions':1,'exponential-growth':6.75,'logarithms':3,'inverse-functions':2,
    'right-triangle-trig':6*Math.sin(35*Math.PI/180),'cosine-law':Math.sqrt(31),'scatter-regression':33/35,
    'unit-circle':Math.SQRT1_2,'radians':2*Math.PI/3,'sine-waves':2*Math.PI,'trig-identity':1,'vector-components':5,
    'mean-median':4,'range-variation':7,'boxplots':5,'standard-deviation':Math.sqrt(8/3),'theoretical-probability':3/5,
    'independent-events':1/6,'conditional-probability':.6,'counting-combinations':10,'expected-value':2,
    'normal-zscore':1.5,'arithmetic-sequences':14,'geometric-sequences':16,'complex-numbers':5,'limits':4,'derivatives':4,'integrals':4.5
  };
  assert.equal(Object.keys(known).length, lessons.length);
  for (const [id, expected] of Object.entries(known)) {
    const lesson = lessons.find(lesson => lesson.id === id);
    close(lesson.model(defaults(lesson)).answer, expected, id);
  }
});

test('changing selected models agrees with formulas outside the default examples', () => {
  const answer = (id, params) => lessons.find(lesson => lesson.id === id).model(params).answer;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    close(answer('fraction-addition', {a,b,c:6}), a/b+1/6, 'fraction addition');
    close(answer('scale-drawings', {a,b}), a*b, 'scale conversion');
    close(answer('linear-equations', {a,b,c:20}), (20-b)/a, 'linear equation');
    close(answer('rectangular-prism', {a,b,c:3}), a*b*3, 'prism volume');
  }
});

test('answer and equation parsers accept supported inputs and reject executable or unsupported text', () => {
  const functions = app.slice(app.indexOf('function parseAnswer('), app.indexOf('function checkAnswer(')) + '\n' + app.slice(app.indexOf('function parseSchoolEquation('), app.indexOf("$('problem-form').addEventListener"));
  vm.runInContext(functions + '\nglobalThis.parsers={parseAnswer,answerCorrect,parseSchoolEquation};', context);
  const { parseAnswer, answerCorrect, parseSchoolEquation } = context.parsers;
  for (const raw of ['', '1/0', '2+2', 'NaN', 'Infinity', '<script>', '1/2/3', 'alert(1)']) assert.equal(parseAnswer(raw), null, raw);
  assert.equal(parseAnswer('3/4'), .75);
  assert.equal(parseAnswer('3e-5'), .00003);
  assert.equal(parseAnswer('−2'), -2);
  for (let a = 1; a <= 6; a++) for (let b = -6; b <= 6; b++) {
    const p = parseSchoolEquation(`${a}x${b < 0 ? '-' : '+'}${Math.abs(b)}=20`);
    assert.equal(p.a, a); assert.equal(p.b, b); assert.equal(p.c, 20);
  }
  for (const raw of ['0x+4=16', 'x²=4', '7x=20', 'x+7=20', 'x=31', 'x=-21', 'alert(1)']) assert.ok(parseSchoolEquation(raw).error, raw);
  assert.equal(answerCorrect(.58,7/12,.0051), true);
  assert.equal(answerCorrect(999999,4,.0051), false);
});
