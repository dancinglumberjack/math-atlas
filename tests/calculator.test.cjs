'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/calculator.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context, { timeout: 1000 });
const calculator = context.MathCalculator;
assert.ok(calculator && Object.isFrozen(calculator));
assert.doesNotThrow(() => calculator.init());
assert.doesNotThrow(() => calculator.open());
let checks = 3;
function close(expression, expected, options) {
  const actual = calculator.evaluate(expression, options);
  assert.ok(Number.isFinite(actual), expression + ' must be finite');
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * 1e-12), expression + ': expected ' + expected + ', got ' + actual);
  checks++;
}
function rejects(expression, pattern, options) {
  assert.throws(() => calculator.evaluate(expression, options), pattern, 'Must reject ' + expression);
  checks++;
}
[
  ['2+3*4', 14], ['(2+3)*4', 20], ['3/4 + 1/2', 1.25], ['.5 + 2.', 2.5],
  ['2^3^2', 512], ['-2^2', -4], ['(-2)^2', 4], ['2^-2', .25], ['2^-2^2', 1/16], ['-2^-2', -.25],
  ['--2', 2], ['2+-3', -1], ['2--3', 5], ['+2^3', 8], ['2^3!', 64], ['-3!', -6], ['0!', 1], ['5!', 120],
  ['3!!', 720], ['50%', .5], ['50%%', .005], ['200+10%', 200.1], ['200*10%', 20], ['(2+3)!', 120],
  ['2(3+4)', 14], ['(2+3)(4+1)', 25], ['2pi', Math.PI*2], ['2sin(30)', 1], ['6/2(1+2)', 9],
  ['sin(30)', .5], ['cos(60)', .5], ['tan(45)', 1], ['sin(90)', 1], ['sin(180)', 0], ['cos(90)', 0],
  ['sin(-90)', -1], ['cos(-180)', -1], ['sin(360)', 0], ['asin(0.5)', 30], ['acos(0.5)', 60], ['atan(1)', 45],
  ['sqrt(81)', 9], ['sqrt(abs(-9))', 3], ['abs(-4)', 4], ['log(1000)', 3], ['ln(e)', 1], ['log(1)', 0],
  ['e^ln(5)', 5], ['sqrt(9+16)', 5], ['√(16)', 4], ['π', Math.PI], ['2 × 3 − 4 ÷ 2', 4], ['3² + 2³', 17],
  ['1e-3 + 2E-3', .003], ['1.2e3', 1200], ['0.1+0.2', .3], ['sin(1e-12)', Math.sin(1e-12*Math.PI/180)]
].forEach(([expression, expected]) => close(expression, expected));
close('sin(pi/2)', 1, {angleMode:'RAD'});
close('cos(pi)', -1, {angleMode:'RAD'});
close('tan(pi/4)', 1, {angleMode:'RAD'});
close('asin(1)', Math.PI/2, {angleMode:'RAD'});
close('acos(-1)', Math.PI, {angleMode:'RAD'});
close('atan(1)', Math.PI/4, {angleMode:'RAD'});
close('ans*2+1', 15, {ans:7});
close('ans', 0);
close('170!', 7.257415615307994e306);
assert.equal(calculator.format(calculator.evaluate('0.1+0.2')), '0.3'); checks++;
assert.equal(calculator.format(-0), '0'); checks++;
assert.equal(calculator.format(1e-20), '1e-20'); checks++;
assert.equal(calculator.evaluate('cos(90)'), 0); checks++;
assert.equal(calculator.evaluate('sin(pi)', {angleMode:'RAD'}), 0); checks++;
assert.ok(calculator.evaluate('sin(1e-12)') > 0); checks++;
[
  ['1/0', /divide by zero/], ['0/0', /divide by zero/], ['1/(2-2)', /divide by zero/],
  ['sqrt(-1)', /square root/], ['ln(0)', /greater than 0/], ['log(-1)', /greater than 0/],
  ['asin(2)', /−1 to 1/], ['acos(-2)', /−1 to 1/], ['tan(90)', /undefined/], ['tan(-90)', /undefined/],
  ['171!', /170 or less/], ['(-1)!', /whole number/], ['2.5!', /whole number/], ['(-2)^0.5', /negative base/],
  ['0^-1', /divide by zero/], ['0^0', /indeterminate/], ['10^999', /too large/], ['1e309', /too large/],
  ['', /Enter a calculation/], ['()', /needed here/], ['2+', /missing at the end/], ['*2', /needed here/],
  ['2**3', /needed here/], ['sin 30', /parentheses/], ['sin()', /needed here/], ['sin(30', /closing parenthesis/],
  ['2)', /extra closing/], ['2 3', /operation between/], ['1.2.3', /operation between/], ['(2+3', /closing parenthesis/],
  ['Math.random()', /calculator symbols|shown on the keypad/], ['Infinity', /shown on the keypad/], ['NaN', /shown on the keypad/],
  ['constructor(1)', /shown on the keypad/], ['window.location', /shown on the keypad/], ['alert(1)', /shown on the keypad/],
  ['[1]', /calculator symbols/], ['1;2', /calculator symbols/], ['1,2', /calculator symbols/], ['2=2', /calculator symbols/],
  ['"hi"', /calculator symbols/], ['1<2', /calculator symbols/], ['2'.repeat(257), /256/],
  ['('.repeat(100) + '1' + ')'.repeat(100), /nested too deeply/], ['-'.repeat(100) + '1', /nested too deeply/]
].forEach(([expression, pattern]) => rejects(expression, pattern));
rejects('tan(pi/2)', /undefined/, {angleMode:'RAD'});
rejects('1', /DEG or RAD/, {angleMode:'GRAD'});
rejects('ans', /finite number/, {ans:Infinity});
assert.throws(() => calculator.evaluate(null), /mathematical expression/); checks++;
// Check a deterministic grid of precedence/fraction cases against known arithmetic.
for (let a = -4; a <= 4; a++) {
  for (let b = 1; b <= 5; b++) {
    close('(' + a + ')/' + b + ' + 2^3*4', a/b + 32);
  }
}
assert.ok(!/\beval\s*\(|new\s+Function\b/.test(source), 'Calculator must never execute expression text as code'); checks++;
console.log('Scientific calculator: ' + checks + ' deterministic checks passed.');


