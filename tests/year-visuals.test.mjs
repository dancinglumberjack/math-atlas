import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const window = {};
runInNewContext(readFileSync(new URL('../src/year-visuals.js', import.meta.url), 'utf8'), { window });
const { fractionLabel, render } = window.AtlasYearVisuals;
const helpers = { svg: body => body, esc: String, fmt: String };

test('fraction labels preserve negative values and never round an unsnapped trial into a correct answer', () => {
  for (const [value, denominator, label] of [[-.25,4,'-1/4'],[-1.25,4,'-1 1/4'],[-1/3,3,'-1/3'],[1/3,3,'1/3'],[7/6,6,'1 1/6'],[.49,4,'0.49'],[1.24,4,'1.24'],[0,6,'0']]) {
    assert.equal(fractionLabel(value, denominator), label);
  }
  const line = render({ type:'number-line', min:0, max:1, fractionDenominator:4 }, .49, {}, helpers);
  assert.match(line.markup, /Your trial: 0\.49/);
  const ruler = render({ type:'measurement', kind:'length', max:2, value:1.25, tickStep:.25, unit:'in' }, 1.24, {}, helpers);
  assert.match(ruler.markup, /Your trial: 1\.24 in/);
});

test('an out-of-range trial is explained without drawing a false endpoint position', () => {
  for (const trial of [-.25, 3]) {
    const line = render({ type:'number-line', min:0, max:2, fractionDenominator:4 }, trial, {}, helpers);
    assert.doesNotMatch(line.markup, /data-fraction-position/);
    assert.match(line.caption, /outside the displayed range/);
    for (const kind of ['capacity','length']) {
      const scale = render({ type:'measurement', kind, max:2, value:1, tickStep:.25, unit:'L' }, trial, {}, helpers);
      assert.doesNotMatch(scale.markup, /data-measure-proposal/);
      assert.match(scale.caption, /outside the displayed scale/);
    }
  }
});

test('a number of equal intervals stays a count rather than becoming a point on the line', () => {
  const line = render({ type:'number-line', min:0, max:2, fractionDenominator:4, answerKeys:{value:'count'} }, 5, {}, helpers);
  assert.doesNotMatch(line.markup, /data-fraction-position/);
  assert.match(line.markup, /Your trial: 5/);
  assert.doesNotMatch(line.caption, /outside the displayed range/);
});
