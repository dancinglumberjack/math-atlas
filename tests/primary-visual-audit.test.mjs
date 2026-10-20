import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { kMissions, kTaskFor, kConcepts } from '../src/grade-k-content.mjs';
import { g1Missions, g1TaskFor, g1Concepts } from '../src/grade1-content.mjs';
import { g2Missions, g2TaskFor, g2Concepts } from '../src/grade2-content.mjs';

const window = {};
runInNewContext(readFileSync(new URL('../src/primary-visuals.js', import.meta.url), 'utf8'), { window });
const renderer = window.AtlasPrimaryVisuals;
const draw = v => renderer.render(v, null, {}, { svg: (body, label, viewBox) => `<svg viewBox="${viewBox}">${body}<title>${label}</title></svg>`, esc: String });
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const tags = (markup, name, attribute) => [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(m => attributes(m[0])).filter(a => !attribute || Object.hasOwn(a, attribute));
const number = (a, key) => Number(a[key]);
const count = (markup, attr) => tags(markup, 'g', attr).length;
const near = (a, b, note) => assert.ok(Math.abs(a - b) < 1e-7, `${note}: ${a} versus ${b}`);

const authoredScenes = [];
for (const [missions, taskFor] of [[kMissions, kTaskFor], [g1Missions, g1TaskFor], [g2Missions, g2TaskFor]]) for (const mission of missions) for (const seed of [1, 2, 3]) for (let step = 0; step < 3; step++) {
  const task = taskFor(mission.id, step, seed);
  const initial = Object.fromEntries(task.inputs.map(i => [i.key, i.initial]));
  const solved = task.answer.kind === 'pair' ? task.expected : task.answer.key ? { [task.answer.key]: task.expected } : {};
  for (const [state, values] of [['initial', initial], ['solved', { ...initial, ...solved }]]) {
    const visual = { ...task.visual, ...values };
    if (renderer.supports(visual)) authoredScenes.push({ id: `${mission.id}:${step}:${seed}:${state}`, visual });
  }
}
for (const concept of [...kConcepts, ...g1Concepts, ...g2Concepts]) for (const [step, card] of concept.steps.entries()) if (renderer.supports(card.visual)) authoredScenes.push({ id: `${concept.id}:card:${step}`, visual: card.visual });

test('large authored comparisons conserve weighted place values rather than number of bundles', () => {
  const scenes = authoredScenes.filter(s => s.visual.kind === 'comparison' && Math.max(s.visual.left, s.visual.right) > 20);
  assert.ok(scenes.some(s => Math.max(s.visual.left, s.visual.right) >= 100), 'Three-digit comparisons are audited');
  assert.ok(scenes.some(s => Math.max(s.visual.left, s.visual.right) < 100), 'Two-digit comparisons are audited');
  for (const { id, visual } of scenes) {
    const { markup } = draw(visual);
    for (const side of ['left', 'right']) {
      const units = tags(markup, 'g', 'data-unit-value').filter(a => a['data-compare-side'] === side);
      assert.equal(units.reduce((sum, a) => sum + number(a, 'data-unit-value'), 0), visual[side], `${id} ${side}`);
      assert.ok(units.every(a => ['1', '10', '100'].includes(a['data-unit-value'])));
    }
    for (const match of markup.matchAll(/<g ([^>]*data-unit-value="[^"]*"[^>]*)>([\s\S]*?)<\/g>/g)) {
      const unit = attributes(match[1]), rect = tags(match[2], 'rect')[0];
      assert.ok(rect, 'Every weighted bundle has a visible area model');
      near(number(rect, 'width') * number(rect, 'height'), number(unit, 'data-unit-value') * 4, 'One-, ten-, and hundred-unit areas use the same underlying square');
    }
  }
});

test('two-centimeter blocks preserve the same length as one-centimeter intervals', () => {
  for (const [length, expectedBlocks] of [[6, 3], [8, 4], [10, 5]]) for (const orientation of ['horizontal', 'vertical']) {
    const original = tags(draw({ type: 'primary', kind: 'length', lengths: [length], unit: 'cm', orientation }).markup, 'rect', 'data-length-unit');
    const grouped = tags(draw({ type: 'primary', kind: 'length', lengths: [length], unit: 'cm', orientation, unitStep: 2 }).markup, 'rect', 'data-length-unit');
    assert.equal(grouped.length, expectedBlocks);
    assert.equal(grouped.reduce((sum, a) => sum + number(a, 'data-length-unit-size'), 0), length);
    const axis = orientation === 'horizontal' ? 'x' : 'y', dimension = orientation === 'horizontal' ? 'width' : 'height';
    const min = units => Math.min(...units.map(a => number(a, axis)));
    const max = units => Math.max(...units.map(a => number(a, axis) + number(a, dimension)));
    near(min(original), min(grouped), 'Shared beginning');
    near(max(original), max(grouped), 'Shared endpoint');
    const ordered = [...grouped].sort((a, b) => number(a, axis) - number(b, axis));
    for (let i = 1; i < ordered.length; i++) near(number(ordered[i - 1], axis) + number(ordered[i - 1], dimension), number(ordered[i], axis), 'Blocks touch without overlap or gap');
  }
});

test('partition layouts keep identical whole areas and equal non-overlapping pieces', () => {
  for (const parts of [2, 3, 4]) for (const layout of ['rows', 'columns', 'grid']) {
    const pieces = tags(draw({ type: 'primary', kind: 'partition', parts, selected: 1, layout }).markup, 'rect', 'data-equal-part');
    assert.equal(pieces.length, parts);
    const areas = pieces.map(a => number(a, 'width') * number(a, 'height'));
    for (const area of areas) near(area, 360 * 132 / parts, 'Equal share area');
    near(areas.reduce((a, b) => a + b, 0), 360 * 132, 'Whole area');
    for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) {
      const a = pieces[i], b = pieces[j];
      const overlapX = Math.min(number(a, 'x') + number(a, 'width'), number(b, 'x') + number(b, 'width')) - Math.max(number(a, 'x'), number(b, 'x'));
      const overlapY = Math.min(number(a, 'y') + number(a, 'height'), number(b, 'y') + number(b, 'height')) - Math.max(number(a, 'y'), number(b, 'y'));
      assert.ok(overlapX <= 1e-7 || overlapY <= 1e-7, 'Shares do not overlap');
    }
  }
});

test('composed triangles and squares conserve the area of their outside boundary', () => {
  const triangles = tags(draw({ type: 'primary', kind: 'shapes', compose: 'square' }).markup, 'polygon', 'data-primary-shape');
  const area = points => Math.abs(points.reduce((sum, [x, y], i) => { const [nextX, nextY] = points[(i + 1) % points.length]; return sum + x * nextY - nextX * y; }, 0)) / 2;
  const points = triangles.map(t => t.points.trim().split(/\s+/).map(p => p.split(',').map(Number)));
  assert.equal(points.length, 2);
  near(area(points[0]), 14450, 'First half-square');
  near(area(points[1]), 14450, 'Second half-square');
  near(area(points[0]) + area(points[1]), 28900, '170 by 170 whole');
  const squares = tags(draw({ type: 'primary', kind: 'shapes', compose: 'rectangle' }).markup, 'rect', 'data-primary-shape');
  assert.equal(squares.length, 2);
  assert.ok(squares.every(a => number(a, 'width') === 140 && number(a, 'height') === 140));
  near(number(squares[0], 'x') + number(squares[0], 'width'), number(squares[1], 'x'), 'Shared full side');
  near(squares.reduce((sum, a) => sum + number(a, 'width') * number(a, 'height'), 0), 280 * 140, 'Joined rectangle area');
});

test('every authored primary rectangle and coin fits its declared drawing bounds', () => {
  assert.ok(authoredScenes.length > 500);
  for (const { id, visual } of authoredScenes) {
    const { markup } = draw(visual);
    assert.doesNotMatch(markup, /NaN|Infinity/, id);
    if (visual.kind === 'shapes') continue; // Their local coordinates are transformed; browser QA checks these.
    const box = tags(markup, 'svg')[0].viewBox.split(' ').map(Number);
    for (const rect of tags(markup, 'rect')) {
      assert.ok(number(rect, 'x') >= -1e-7 && number(rect, 'y') >= -1e-7, id);
      assert.ok(number(rect, 'x') + number(rect, 'width') <= box[2] + 1e-7, `${id} rectangle horizontal bounds`);
      assert.ok(number(rect, 'y') + number(rect, 'height') <= box[3] + 1e-7, `${id} rectangle vertical bounds`);
    }
    for (const circle of tags(markup, 'circle')) {
      assert.ok(number(circle, 'cx') - number(circle, 'r') >= 0 && number(circle, 'cy') - number(circle, 'r') >= 0, id);
      assert.ok(number(circle, 'cx') + number(circle, 'r') <= box[2] && number(circle, 'cy') + number(circle, 'r') <= box[3], `${id} circle bounds`);
    }
  }
});

test('all authored money values retain their separate dollar or cent labels', () => {
  for (const { id, visual } of authoredScenes.filter(s => s.visual.kind === 'money')) {
    const { markup } = draw(visual);
    assert.equal(count(markup, 'data-coin-value'), visual.coins.length, id);
    assert.equal(count(markup, 'data-bill-value'), (visual.bills || []).length, id);
    for (const value of visual.coins) assert.match(markup, new RegExp(`>${value}¢<`), `${id} cent label`);
    for (const value of visual.bills || []) assert.ok(markup.includes(`>$${value}<`), `${id} dollar label`);
    assert.ok(visual.coins.every(n => [1, 5, 10, 25].includes(n)));
    assert.ok((visual.bills || []).every(n => n === 1));
  }
});

test('compared dime and nickel collections stay separate while a missing amount joins its whole', () => {
  const examples = [
    g2TaskFor('g2y-coin-counter', 2, 1).visual,
    g2Concepts.find(c => c.id === 'g2-money').steps[1].visual
  ];
  for (const visual of examples) {
    const { markup, caption } = draw(visual);
    const coins = tags(markup, 'g', 'data-coin-value');
    for (const side of ['left', 'right']) assert.equal(coins.filter(c => c['data-money-group'] === side).reduce((sum, c) => sum + number(c, 'data-coin-value'), 0), 10, `${side} collection has ten cents`);
    assert.match(caption, /within each group/);
    assert.match(caption, /compare/);
  }
  const missing = g2Concepts.find(c => c.id === 'g2-money').steps[2].visual;
  assert.equal(missing.groupBreak, undefined, '25 cents and the missing five cents join to make thirty, rather than being two comparison targets');
  const { markup } = draw(missing);
  assert.equal(tags(markup, 'g', 'data-coin-value').reduce((sum, c) => sum + number(c, 'data-coin-value'), 0), 30);
  const billsOnly = draw(g2TaskFor('g2y-tiny-shop', 2, 1).visual);
  assert.match(billsOnly.caption, /dollars/);
  assert.doesNotMatch(billsOnly.markup, />Read the value of each coin\.</);
});

test('authored shape-sorting displays every requested object without silently truncating the category', () => {
  const scenes = authoredScenes.filter(s => s.visual.kind === 'shapes' && !s.visual.compose && s.visual.layout !== 'join-triangles');
  assert.ok(scenes.some(s => s.visual.shapes.length > 4), 'Actual sorting scenes include larger collections');
  for (const { id, visual } of scenes) {
    const drawn = tags(draw(visual).markup, 'g', 'data-primary-shape');
    assert.deepEqual(drawn.map(a => a['data-primary-shape']), visual.shapes, id);
  }
});
