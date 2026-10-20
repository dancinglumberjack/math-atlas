/* Authored, deterministic student challenges. These are introductory explorations,
   not a complete curriculum or a measure of mastery. All answers stay in the browser. */
import { extraMissions, extraTaskFor } from './content-expansion.mjs';
import { adaptTask } from './division-builder.mjs';
import { yearMissions, yearTaskFor } from './grade3-year-content.mjs';
import { primaryMissions, primaryTaskFor } from './primary-content.mjs';
import { upperMissions, upperTaskFor } from './upper-content.mjs';
export const ageBands = [
  { id: 'pre-k', title: 'Pre-K · Notice & play', label: 'Pre-K', description: 'Count, compare, sort, and find shape patterns. Explore together with a grown-up.', storyTone: 'Gentle play with things you can count and touch.' },
  { id: 'early', title: 'K–2 · Build the basics', label: 'K–2', description: 'Add, take away, build tens and ones, and explore clocks.', storyTone: 'Short, friendly building challenges.' },
  { id: 'elementary', title: 'Grades 3–5 · Make & discover', label: 'Grades 3–5', description: 'Multiply, share equally, compare fractions, and explore area, perimeter, and volume.', storyTone: 'Make useful things and discover patterns.' },
  { id: 'middle', title: 'Middle school · Solve & explore', label: 'Middle school', description: 'Signed numbers, ratios, percents, rates, and equations through visual models.', storyTone: 'Design, test, and repair.' },
  { id: 'high', title: 'High school · Design & investigate', label: 'High school', description: 'Connect lines, systems, quadratics, powers, and exponential models with graphs.', storyTone: 'Investigations with equations, graphs, and constraints.' },
  { id: 'college', title: 'College · Introductory explorations', label: 'College', description: 'First looks at derivatives, definite integrals, and vectors. Selected explorations, not a full college course.', storyTone: 'Mathematical investigations with explicit assumptions.' }
];

export const worlds = [
  { id: 'meadow', title: 'Discovery Meadow', description: 'Count, combine, group, and share.', color: '#6d853f', icon: '✿' },
  { id: 'garden', title: 'Ratio Garden', description: 'Grow designs that keep their proportions.', color: '#548264', icon: '❧' },
  { id: 'workshop', title: 'Cargo Workshop', description: 'Use balance to uncover an unknown.', color: '#b8753f', icon: '⚖' },
  { id: 'studio', title: 'Room Studio', description: 'Cover, border, and build useful spaces.', color: '#477d91', icon: '▧' },
  { id: 'observatory', title: 'Fountain Observatory', description: 'Connect an arch with its equation.', color: '#79649c', icon: '⌒' },
  { id: 'campus', title: 'Open Campus', description: 'Investigate change, accumulation, and vectors.', color: '#496c95', icon: '∫' }
];

const mission = (id, worldId, bandId, title, goal, skill, lessonId, order, minutes = 7) => ({ id, worldId, bandId, title, goal, skill, lessonId, order, minutes });
export const missions = [
  mission('meadow-count', 'meadow', 'pre-k', 'Little collections', 'Match a small collection to its number.', 'Count objects one time each', null, 1, 4),
  mission('meadow-compare', 'meadow', 'pre-k', 'Which basket?', 'Compare two small collections.', 'More, fewer, and the same', null, 2, 4),
  mission('meadow-shapes', 'meadow', 'pre-k', 'Shape friends', 'Match circles, squares, and triangles.', 'Recognize basic shapes', null, 3, 4),
  mission('meadow-add', 'meadow', 'early', 'Welcome to the pond', 'Combine two groups and find the total.', 'Addition within 10', null, 4, 5),
  mission('meadow-subtract', 'meadow', 'early', 'Snacks to share', 'See what remains when some objects leave.', 'Subtraction within 20', null, 5, 5),
  mission('meadow-tens', 'meadow', 'early', 'Number builders', 'Build and read tens and ones.', 'Place value to 59', null, 6, 5),
  mission('clock-hours', 'meadow', 'early', 'Clock: on the hour', 'Connect the hour hand with a whole hour.', 'Read whole-hour clocks', null, 7, 5),
  mission('clock-halves', 'meadow', 'early', 'Clock: half past', 'Connect half a turn with thirty minutes.', 'Read hours and half-hours', null, 8, 5),
  mission('clock-quarters', 'meadow', 'early', 'Clock: quarter turns', 'Connect quarter turns with fifteen minutes.', 'Read quarter-hour clocks', null, 9, 5),
  mission('meadow-groups', 'meadow', 'elementary', 'Pack the picnic', 'Connect equal groups to multiplication.', 'Equal groups and multiplication', 'distributive-property', 10),
  mission('meadow-fractions', 'meadow', 'elementary', 'Share a whole', 'Describe equal parts of the same whole.', 'Fractions and equivalent fractions', 'fraction-equivalence', 11),
  mission('meadow-arrays', 'meadow', 'elementary', 'Plant in rows', 'Build and interpret rectangular arrays.', 'Arrays, multiplication, and missing factors', 'rectangle-area', 9),
  mission('garden-color', 'garden', 'middle', 'A garden in balance', 'Keep blue and yellow plants in a fixed ratio.', 'Part-to-part ratios', 'unit-rates', 10),
  mission('garden-market', 'garden', 'middle', 'The seed market', 'Find a unit price and use it for a new quantity.', 'Unit rates', 'unit-rates', 11),
  mission('garden-repair', 'garden', 'middle', 'Repair the pattern', 'Scale both parts by the same factor.', 'Equivalent ratios', 'proportions', 12),
  mission('cargo-lift', 'workshop', 'middle', 'Balance the cargo lift', 'Find the mass of one identical crate.', 'Positive two-step equations', 'linear-equations', 13),
  mission('cargo-equality', 'workshop', 'middle', 'A fair move', 'Apply the same operation to both sides.', 'Preserving equality', 'linear-equations', 14),
  mission('cargo-check', 'workshop', 'middle', 'Check the shipment', 'Solve an equation and verify it by substitution.', 'Solving and checking equations', 'linear-equations', 15),
  mission('room-floor', 'studio', 'elementary', 'Lay the floor', 'Use equal rows to cover a rectangle.', 'Rectangle area', 'rectangle-area', 16),
  mission('room-border', 'studio', 'elementary', 'Frame the room', 'Measure the boundary, then compare designs.', 'Rectangle perimeter', 'rectangle-area', 17),
  mission('room-stack', 'studio', 'elementary', 'Build in layers', 'Count equal layers of a rectangular prism.', 'Volume of a rectangular prism', 'rectangular-prism', 18),
  mission('fountain-peak', 'observatory', 'high', 'Place the peak', 'Locate the vertex of a downward-opening parabola.', 'Vertex form', 'quadratic-vertex', 19, 9),
  mission('fountain-land', 'observatory', 'high', 'Plan the landing', 'Connect the roots with ground-level positions.', 'Quadratic roots and symmetry', 'factor-quadratics', 20, 9),
  mission('fountain-height', 'observatory', 'high', 'Test the clearance', 'Evaluate a quadratic and interpret its height.', 'Evaluating vertex form', 'quadratic-vertex', 21, 9),
  mission('campus-slope', 'campus', 'college', 'A changing slope', 'Connect a tangent slope to the derivative of x².', 'Derivative of x²', 'derivatives', 22, 9),
  mission('campus-area', 'campus', 'college', 'Accumulating area', 'Connect a triangular region with an integral.', 'Integral of x on a nonnegative interval', 'integrals', 23, 9),
  mission('campus-vectors', 'campus', 'college', 'Combine directions', 'Add displacement vectors component by component.', 'Two-dimensional vector addition', 'vector-components', 27, 9)
].concat(extraMissions,yearMissions,primaryMissions,upperMissions).map((item, index) => ({ ...item, order: index + 1 }));

export function missionById(id) { return missions.find(item => item.id === id) || null; }

// A deliberately small parser: numbers, decimals, fractions, and mixed numbers; never code.
export function parseAnswer(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.length > 100) return null;
  const clean = value.trim().replace(/−/g, '-');
  const decimal = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  if (new RegExp(`^${decimal}$`).test(clean)) {
    const number = Number(clean); return Number.isFinite(number) ? number : null;
  }
  const mixed = clean.match(/^([+-]?)(\d+)[ \t]+(\d+)[ \t]*\/[ \t]*(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[2]), numerator = Number(mixed[3]), denominator = Number(mixed[4]);
    if (denominator === 0 || numerator >= denominator) return null;
    const number = (mixed[1] === '-' ? -1 : 1) * (whole + numerator / denominator);
    return Number.isFinite(number) ? number : null;
  }
  const match = clean.match(new RegExp(`^(${decimal})\\s*/\\s*(${decimal})$`));
  if (!match || Number(match[2]) === 0) return null;
  const number = Number(match[1]) / Number(match[2]);
  return Number.isFinite(number) ? number : null;
}

const numeric = (label, key) => ({ kind: 'number', label, ...(key ? { key } : {}) });
const pair = (keys, labels) => ({ kind: 'pair', keys, labels });
const slider = (key, label, min, max, initial, step = 1) => ({ key, label, min, max, initial, step });
const option = (value, label, feedback) => ({ value: String(value), label, ...(feedback ? { feedback } : {}) });
const choose = { kind: 'choice', label: 'Choose an answer' };
const near = (a, b) => Math.abs(a - b) <= 1e-7;
const fmt = number => String(Number(number.toFixed(5)));
const phase = ['build', 'practice', 'apply'];
const phaseTitle = ['Explore the idea', 'Try it yourself', 'Use it somewhere new'];
const ratioVisual = (blue, yellow, ratioBlue, ratioYellow) => ({ type: 'garden', mode: 'ratio', blue, yellow, ratioBlue, ratioYellow });
const equation = (a, b, c, x = 1) => ({ type: 'equality', a, b, c, x });
const room = (length, width, height = 1, mode = 'area') => ({ type: 'room', length, width, height, mode });
const fountain = (h, k, mode = 'vertex', x = 0) => ({ type: 'fountain', h, k, a: -1, mode, x });
const squareForm = (h, k) => `y = −(x − ${h})² + ${k}`;

function finish(m, step, seed, details) {
  const task = {
    id: `${m.id}:${step}:${seed}`, missionId: m.id, step, kind: phase[step], title: phaseTitle[step],
    prompt: '', instruction: '', visual: {}, inputs: [], answer: numeric('Your answer'),
    hint: '', explanation: '', why: '', expected: 0, unit: '', ...details
  };
  // Parameter names tell the renderer where a submitted answer belongs. A submitted
  // marker must be visibly distinct from the given model, including after a mistake.
  const gardenKey = m.id === 'garden-market' ? step === 0 ? 'rate' : 'cost' : m.id === 'garden-color' ? step === 1 ? 'yellow' : 'blue' : step === 2 ? 'blue' : 'yellow';
  const byType = {
    garden: { value: gardenKey, blue: 'blue', yellow: 'yellow' },
    equality: { value: 'x' },
    room: { value: task.answer.key || (step === 1 ? 'measure' : task.visual.mode === 'volume' ? 'height' : 'length') },
    fountain: { value: task.answer.key || (m.id === 'fountain-height' && step > 0 ? 'y' : m.id === 'fountain-land' && step === 2 ? 'span' : 'h'), h: 'h', k: 'k', left: 'left', right: 'right' },
    calculus: { value: step === 0 ? task.answer.key : task.visual.mode === 'derivative' ? 'slope' : 'area' },
    vector: { x: 'sumX', y: 'sumY', sumX: 'sumX', sumY: 'sumY' },
    array: { value: task.answer.key || (m.id === 'meadow-arrays' && step === 2 ? 'columns' : 'total') },
    fraction: { value: step === 1 ? 'fraction' : 'selected' }
  };
  task.visual.answerKeys = byType[task.visual.type] || { value: task.answer.key || 'answerCount' };
  if (task.choices) {
    // Rotate choice positions deterministically, rather than always putting a
    // correct choice first. The exact same seed restores the same challenge.
    const offset = ((seed + step + m.order) % task.choices.length + task.choices.length) % task.choices.length;
    task.choices = [...task.choices.slice(offset), ...task.choices.slice(0, offset)];
  }
  return task;
}

function rawTaskFor(missionId, step = 0, seed = 1) {
  const m = missionById(missionId);
  if (!m) throw new RangeError('Choose a known mission.');
  if (!Number.isInteger(step) || step < 0 || step > 2) throw new RangeError('A mission has three challenges, numbered 0 to 2.');
  if (!Number.isSafeInteger(seed)) throw new TypeError('The variation seed must be a safe integer.');
  const primaryTask=primaryTaskFor(missionId,step,seed);
  if(primaryTask)return primaryTask;
  const upperTask=upperTaskFor(missionId,step,seed);
  if(upperTask)return upperTask;
  const yearTask=yearTaskFor(missionId,step,seed);
  if(yearTask)return yearTask;
  const extension = extraTaskFor(missionId, step, seed);
  if (extension) return extension;
  const v = ((seed % 3 - 1) % 3 + 3) % 3;
  const out = details => finish(m, step, seed, details);

  if (missionId === 'meadow-count') {
    const count = [3, 4, 5][(v + step) % 3];
    return out({ prompt: 'How many dots?', instruction: 'Touch or point to each dot once. Then choose the matching group.',
      visual: { type: 'count', mode: 'count', count }, answer: choose,
      choices: [2, 3, 4, 5].map(n => option(n, `${'● '.repeat(n).trim()}  ${n}`)), expected: String(count),
      hint: 'Start at one end. Give each dot one number.', explanation: `There are ${count} dots. The last count tells how many are in the collection.`, why: 'Moving the dots does not change how many there are.' });
  }
  if (missionId === 'meadow-compare') {
    const sets = [[2, 4], [5, 3], [3, 3]];
    const [count, compareCount] = sets[(v + step) % 3];
    return out({ prompt: 'Which basket has more?', instruction: 'Match one dot from each basket. You can choose “same” too.',
      visual: { type: 'count', mode: 'compare', count, compareCount }, answer: choose,
      choices: [option('left', '◀ Left basket'), option('same', '= Same number'), option('right', 'Right basket ▶')],
      expected: count > compareCount ? 'left' : count < compareCount ? 'right' : 'same',
      hint: 'After matching, look for dots that have no partner.', explanation: count === compareCount ? 'Every dot has a partner. Both baskets have the same number.' : `The ${count > compareCount ? 'left' : 'right'} basket has dots left over, so it has more.`, why: 'A spread-out group can look bigger. Matching helps us compare the actual numbers.' });
  }
  if (missionId === 'meadow-shapes') {
    const target = ['circle', 'triangle', 'square'][(v + step) % 3];
    return out({ prompt: 'Find a shape friend.', instruction: 'Choose the small shape that matches the big shape.', visual: { type: 'shapes', target, shapes: ['circle', 'triangle', 'square'] }, answer: choose,
      choices: [option('circle', '● Circle'), option('triangle', '▲ Triangle'), option('square', '■ Square')], expected: target,
      hint: 'Look at the sides and corners. Turning a shape does not change its kind.', explanation: target === 'circle' ? 'A circle is round, with no corners.' : target === 'triangle' ? 'A triangle has three straight sides and three corners.' : 'A square has four equal straight sides and four square corners.', why: 'The same shape can come in many sizes and colors.' });
  }
  if (missionId === 'meadow-add' || missionId === 'meadow-subtract') {
    const subtract = missionId === 'meadow-subtract';
    const a = (subtract ? [8, 10, 12] : [3, 4, 5])[v] + step;
    const b = [2, 3, 4][(v + step) % 3];
    const expected = subtract ? a - b : a + b;
    return out({ prompt: subtract ? `${a} snacks are on the mat. Friends take ${b}. How many remain?` : `${a} frogs are at the pond. ${b} more arrive. How many frogs are there now?`,
      instruction: subtract ? 'Cross out the snacks that leave, then count the rest.' : 'Count both groups together, or count on from the first group.',
      visual: { type: 'count', mode: subtract ? 'subtract' : 'add', count: a, compareCount: b, answerCount: 0 }, expected,
      inputs: [slider('answerCount', subtract ? 'Build the group that remains' : 'Build the combined group', 0, 20, 0)],
      answer: numeric(subtract ? 'Snacks remaining' : 'Frogs altogether', 'answerCount'), unit: subtract ? 'snacks' : 'frogs',
      hint: subtract ? 'Take away only the group that leaves.' : 'Start with the first number. Count on one time for each new frog.',
      explanation: `${a} ${subtract ? '−' : '+'} ${b} = ${expected}.`, why: subtract ? 'Subtraction describes the amount left after part of a collection leaves.' : 'Addition combines the two collections without leaving any objects out.',
      misconceptions: [{ value: subtract ? a + b : a - b, feedback: subtract ? 'That combines the groups. Here some snacks leave, so the remaining number is smaller.' : 'That takes a group away. Here more frogs arrive, so combine the groups.' }] });
  }
  if (missionId === 'meadow-tens') {
    const tens = [2, 3, 4][v], ones = [3, 5, 7][(v + step) % 3], total = tens * 10 + ones;
    const build = step === 0;
    return out({ prompt: build ? `Build ${total} using tens and ones.` : step === 1 ? 'What number do these tens and ones show?' : `${tens} bundles each hold 10 pencils. There are ${ones} loose pencils. How many pencils is that?`,
      instruction: build ? 'Change the bundles and loose dots until they make the number.' : 'Count each full bundle as ten, then add the loose ones.',
      visual: { type: 'base-ten', tens: build ? 1 : tens, ones: build ? 1 : ones }, inputs: build ? [slider('tens', 'Bundles of ten', 0, 5, 1), slider('ones', 'Loose ones', 0, 9, 1)] : [],
      answer: build ? pair(['tens', 'ones'], ['Tens', 'Ones']) : choose,
      choices: build ? undefined : [total - 10, total, total + 1, total + 10].map(n => option(n, String(n))), expected: build ? { tens, ones } : String(total),
      hint: 'One bundle stands for ten objects. The loose dots are extra ones.', explanation: `${tens} tens and ${ones} ones make ${tens} × 10 + ${ones} = ${total}.`, why: 'The position of a digit tells its value. A 3 in the tens place represents 30.' });
  }
  if (missionId.startsWith('clock-')) {
    const hour = [3, 7, 10][(v + step) % 3];
    const minute = missionId === 'clock-hours' ? 0 : missionId === 'clock-halves' ? 30 : [15, 45, 15][(v + step) % 3];
    const time = `${hour}:${String(minute).padStart(2, '0')}`;
    const setClock = step !== 1;
    return out({ prompt: setClock ? `Set the clock to ${time}.` : 'Which time does this clock show?', instruction: minute === 0 ? 'The long minute hand points to 12 at the start of an hour. Move the short hour hand.' : minute === 30 ? 'Half past is 30 minutes after the hour. The long hand points to 6; the short hand sits halfway to the next hour.' : 'Each quarter turn is 15 minutes. Notice that the hour hand moves gradually as the minutes pass.',
      visual: { type: 'clock', hour: setClock ? 1 : hour, minute: setClock ? 0 : minute, targetHour: hour, targetMinute: minute },
      inputs: setClock ? [slider('hour', 'Hour', 1, 12, 1), slider('minute', 'Minutes', 0, missionId === 'clock-hours' ? 0 : missionId === 'clock-halves' ? 30 : 45, 0, missionId === 'clock-quarters' ? 15 : missionId === 'clock-halves' ? 30 : 1)] : [],
      answer: setClock ? pair(['hour', 'minute'], ['Hour', 'Minutes']) : choose, expected: setClock ? { hour, minute } : time,
      choices: setClock ? undefined : [option(time, time), option(`${hour}:00`, `${hour}:00`), option(`${hour === 12 ? 1 : hour + 1}:${String(minute).padStart(2, '0')}`, `${hour === 12 ? 1 : hour + 1}:${String(minute).padStart(2, '0')}`)].filter((choice, index, options) => options.findIndex(other => other.value === choice.value) === index),
      hint: 'Read the short hour hand first, then count minutes with the long hand. One full turn takes 60 minutes.', explanation: `${time} is ${minute === 0 ? `${hour} o’clock` : minute === 30 ? `half past ${hour}` : minute === 15 ? `a quarter past ${hour}` : `a quarter to ${hour === 12 ? 1 : hour + 1}`}. The minute hand turns ${minute}/60 of a full circle.`, why: 'A clock connects parts of a circle with parts of an hour. These clocks do not specify morning or afternoon.' });
  }
  if (missionId === 'meadow-groups') {
    const groups = [3, 4, 5][v] + (step === 2 ? 1 : 0), each = [4, 3, 2][(v + step) % 3];
    return out({ prompt: step === 2 ? `${groups} picnic bags each need ${each} apples. How many apples are needed?` : `${groups} equal groups hold ${each} items each. How many items altogether?`, instruction: 'Count equal groups rather than adding different amounts.',
      visual: { type: 'array', rows: groups, columns: each }, expected: groups * each, answer: numeric('Items altogether'), unit: 'items',
      hint: 'Add the same group size once for every group, or multiply.', explanation: `${groups} groups × ${each} items per group = ${groups * each} items.`, why: 'Multiplication describes equal groups. Both the number of groups and the size of each group matter.',
      misconceptions: [{ value: groups + each, feedback: 'That adds the two labels. Each row contains a whole group, so count every row of items.' }] });
  }
  if (missionId === 'meadow-fractions') {
    const parts = [4, 6, 8][v], selected = [3, 2, 3][v];
    if (step === 0) return out({ prompt: `Shade ${selected} of the ${parts} equal parts.`, instruction: 'Keep the whole the same size. Change only how many equal parts are shaded.', visual: { type: 'fraction', parts, selected: 1 },
      inputs: [slider('selected', 'Shaded parts', 0, parts, 1)], answer: numeric('Shaded parts', 'selected'), expected: selected,
      hint: 'The denominator counts all equal parts. The numerator counts shaded parts.', explanation: `${selected} out of ${parts} equal parts is ${selected}/${parts} of the whole.`, why: 'A fraction describes equal parts of one specified whole.' });
    if (step === 1) return out({ prompt: 'What fraction of this whole is shaded?', instruction: 'You can type a fraction such as 1/2. Equivalent fractions are welcome.', visual: { type: 'fraction', parts, selected }, expected: selected / parts, answer: numeric('Fraction shaded'),
      hint: 'Count shaded parts for the top number and all equal parts for the bottom number.', explanation: `${selected} of ${parts} equal parts are shaded: ${selected}/${parts}.`, why: 'Equivalent fractions name the same amount of the same whole.' });
    return out({ prompt: `A ribbon has ${parts * 2} equal sections. Shade the same fraction as ${selected}/${parts}. How many sections should be shaded?`, instruction: 'The whole ribbon stays the same size; it is split into twice as many equal sections.', visual: { type: 'fraction', parts: parts * 2, selected: 0 }, expected: selected * 2, answer: numeric('Sections to shade'), unit: 'sections',
      hint: 'When each old part splits in two, each shaded part splits in two as well.', explanation: `${selected}/${parts} = ${selected * 2}/${parts * 2}. Shade ${selected * 2} sections.`, why: 'Multiplying numerator and denominator by the same nonzero number preserves the fraction.' });
  }
  if (missionId === 'meadow-arrays') {
    const rows = [3, 4, 5][v], columns = [4, 3, 2][(v + step) % 3];
    const build = step === 0;
    return out({ prompt: build ? `Make ${rows * columns} planting spaces in ${rows} equal rows.` : step === 1 ? `There are ${rows} rows with ${columns} spaces in each. How many spaces?` : `A display has ${rows * columns} photographs in ${rows} equal rows. How many photographs are in each row?`, instruction: build ? 'Change the number of columns. Each row must have the same number of spaces.' : 'Connect rows × columns with the total number of spaces.',
      visual: { type: 'array', rows, columns: build ? 1 : columns }, inputs: build ? [slider('columns', 'Spaces in each row', 1, 8, 1)] : [], expected: step === 1 ? rows * columns : columns, answer: numeric(step === 1 ? 'Total spaces' : 'Spaces in each row', build ? 'columns' : undefined),
      hint: step === 1 ? 'Count all the equal rows, or multiply.' : 'Find the equal group size that makes the total.', explanation: `${rows} rows × ${columns} spaces per row = ${rows * columns} spaces.`, why: 'An array connects multiplication and division with the same equal groups.' });
  }
  if (missionId === 'garden-color') {
    const n = [3, 4, 2][v] + step, blue = 2 * n, yellow = 3 * n;
    if (step === 0) return out({ prompt: `Plant ${5 * n} flowers with a blue-to-yellow ratio of 2:3.`, instruction: 'Change both colors. Use all the flowers while keeping two blue for every three yellow.', visual: { ...ratioVisual(2, 3, 2, 3), targetTotal: 5 * n }, inputs: [slider('blue', 'Blue flowers', 0, 24, 2), slider('yellow', 'Yellow flowers', 0, 30, 3)], answer: pair(['blue', 'yellow'], ['Blue flowers', 'Yellow flowers']), expected: { blue, yellow },
      hint: 'One ratio group has 2 + 3 flowers. Find how many complete groups fit the total.', explanation: `${5 * n} ÷ 5 = ${n} groups. Blue: 2 × ${n} = ${blue}; yellow: 3 × ${n} = ${yellow}.`, why: 'A part-to-part ratio compares two parts; neither part alone is the whole.' });
    return out({ prompt: step === 1 ? `Keep the ratio 2 blue : 3 yellow. There are ${blue} blue flowers. How many yellow flowers are needed?` : `A tile design uses 2 blue tiles for every 3 gold tiles. With ${yellow} gold tiles, how many blue tiles are needed?`, instruction: 'Use the same scale factor for both parts.', visual: ratioVisual(step === 1 ? blue : 0, step === 1 ? 0 : yellow, 2, 3), expected: step === 1 ? yellow : blue, answer: numeric(step === 1 ? 'Yellow flowers' : 'Blue tiles'),
      hint: 'First find how many ratio groups the known quantity represents.', explanation: step === 1 ? `${blue} ÷ 2 = ${n} groups, so yellow = ${n} × 3 = ${yellow}.` : `${yellow} ÷ 3 = ${n} groups, so blue = ${n} × 2 = ${blue}.`, why: 'Scaling both parts by one factor preserves their relationship.' });
  }
  if (missionId === 'garden-market') {
    const rate = [3, 2.5, 4][v], items = [4, 6, 3][v], cost = rate * items;
    const desired = [7, 8, 5][v] + step;
    return out({ prompt: step === 0 ? `${items} seed packets cost $${fmt(cost)}. What is the cost of one packet?` : step === 1 ? `Seed packets cost $${fmt(rate)} each. What do ${desired} packets cost?` : `A repair shop charges $${fmt(rate)} per wheel. What does repairing ${desired} wheels cost?`, instruction: step === 0 ? 'Explore equal-sized purchases, then find dollars for one item.' : 'Multiply the number of items by the dollars per item.',
      visual: { type: 'garden', mode: 'rate', rate, items: step === 0 ? items : desired, cost: step === 0 ? cost : rate * desired, blue: 0, yellow: 0 },
      inputs: step === 0 ? [slider('items', 'Equal-priced packets', 1, 10, items)] : [], answer: numeric(step === 0 ? 'Dollars per packet' : 'Total cost ($)'), expected: step === 0 ? rate : rate * desired, unit: step === 0 ? '$ per packet' : '$',
      hint: step === 0 ? 'Divide total dollars by the number of packets.' : 'The rate tells the cost for each one. Use it once per item.', explanation: step === 0 ? `$${fmt(cost)} ÷ ${items} = $${fmt(rate)} per packet.` : `${desired} × $${fmt(rate)} = $${fmt(rate * desired)}.`, why: 'A unit rate includes its units. Dollars per item is different from items per dollar.' });
  }
  if (missionId === 'garden-repair') {
    const rb = [3, 2, 4][v], ry = [2, 5, 3][v], factor = [3, 4, 2][v] + step;
    if (step === 0) return out({ prompt: `Repair a bed with ${rb * factor} blue flowers. Keep the ratio ${rb} blue : ${ry} yellow.`, instruction: 'Change the yellow flowers so both parts use the same scale factor.', visual: ratioVisual(rb * factor, ry + factor, rb, ry), inputs: [slider('yellow', 'Yellow flowers', 0, 30, ry + factor)], answer: numeric('Yellow flowers', 'yellow'), expected: ry * factor,
      hint: 'Divide the current blue count by the blue count in one ratio group.', explanation: `Blue is multiplied by ${factor}, so yellow must also be multiplied by ${factor}: ${ry} × ${factor} = ${ry * factor}.`, why: 'Adding the same number to both parts usually changes a ratio.', misconceptions: [{ value: ry + (rb * factor - rb), feedback: 'That adds the same amount to each part. Equivalent ratios need the same multiplier instead.' }] });
    if (step === 1) return out({ prompt: `Which pair has the same blue-to-yellow ratio as ${rb}:${ry}?`, instruction: 'Look for a pair made by multiplying both parts by the same factor.', visual: ratioVisual(rb, ry, rb, ry), answer: choose,
      choices: [option('scaled', `${rb * factor} blue : ${ry * factor} yellow`), option('added', `${rb + factor} blue : ${ry + factor} yellow`, 'That adds the same number. Compare the multipliers instead.'), option('one-side', `${rb * factor} blue : ${ry} yellow`, 'Only one part changed. Both parts need the same scale factor.')], expected: 'scaled',
      hint: 'Test the multiplier on each part, not just one.', explanation: `(${rb} × ${factor}):(${ry} × ${factor}) = ${rb * factor}:${ry * factor}.`, why: 'Equivalent ratios describe the same relative amounts, even when the total changes.' });
    return out({ prompt: `A paint mix uses ${rb} cups of blue for ${ry} cups of yellow. With ${ry * factor} cups of yellow, how many cups of blue keep the color?`, instruction: 'Carry the ratio from the garden into a new situation.', visual: ratioVisual(0, ry * factor, rb, ry), answer: numeric('Cups of blue'), expected: rb * factor, unit: 'cups',
      hint: 'How many original batches fit the yellow amount?', explanation: `${ry * factor} ÷ ${ry} = ${factor} batches. Blue: ${rb} × ${factor} = ${rb * factor} cups.`, why: 'The same proportional relationship can describe flowers, paint, or other measured quantities.' });
  }
  if (missionId === 'cargo-lift' || missionId === 'cargo-check') {
    const a = (missionId === 'cargo-check' ? [4, 3, 5] : [3, 2, 4])[v], b = (missionId === 'cargo-check' ? [2, 5, 4] : [4, 6, 3])[v] + step, x = [5, 4, 3][(v + step) % 3], c = a * x + b;
    return out({ prompt: step === 0 ? `${a} identical crates and ${b} kg of loose cargo balance ${c} kg. Find one crate’s mass.` : step === 1 ? `Solve ${a}x + ${b} = ${c}.` : `A hire charge is $${b} plus $${a} per hour. The bill is $${c}. How many hours were used?`, instruction: step === 0 ? 'Change one crate’s mass and watch both totals. Balance the two sides.' : 'Remove the fixed amount from both sides, then divide both sides into equal groups.',
      visual: { ...equation(a, b, c, 1), unknownKey: 'x' }, inputs: step === 0 ? [slider('x', 'Mass of each crate (kg)', 1, 10, 1)] : [], answer: numeric(step === 2 ? 'Hours' : 'Value of x', step === 0 ? 'x' : undefined), expected: x, unit: step === 2 ? 'hours' : step === 0 ? 'kg' : '',
      hint: `Subtract the loose amount (${b}) from both totals. Then share the remaining total among ${a} equal groups.`, explanation: `${a}x = ${c} − ${b} = ${a * x}. Divide by ${a}: x = ${x}. Check: ${a} × ${x} + ${b} = ${c}.`, why: 'An equation states that two expressions are equal. The same valid operation on both sides preserves that equality.',
      misconceptions: [{ value: c - b, feedback: 'You removed the fixed amount. That leaves the total for all the equal crates, so one more equal-sharing step is needed.' }, { value: c / a, feedback: 'The loose amount is part of the total too. Remove it from both sides before dividing into equal groups.' }] });
  }
  if (missionId === 'cargo-equality') {
    const a = [3, 4, 2][v], b = [4, 3, 6][v], x = [5, 3, 6][v], c = a * x + b;
    if (step === 0) return out({ prompt: `The lift balances: ${a}x + ${b} = ${c}. Which move keeps it balanced and removes the loose cargo?`, instruction: 'Choose a move that changes both sides equally.', visual: equation(a, b, c, x), answer: choose,
      choices: [option('both', `Remove ${b} from both sides`), option('left', `Remove ${b} from the left only`, 'Changing only one side changes the balance.'), option('divide', `Divide the right side by ${a} only`, 'The same operation must be applied to each whole side.')], expected: 'both',
      hint: 'Whatever you remove from one balanced side, remove from the other.', explanation: `Subtract ${b} from both sides: ${a}x = ${c - b}.`, why: 'Equality is a relationship between two entire expressions.' });
    if (step === 1) return out({ prompt: `After removing ${b} kg from each side, ${a}x = ${c - b}. What is x?`, instruction: `Split both sides into ${a} equal groups.`, visual: equation(a, 0, c - b, x), expected: x,
      hint: 'The remaining mass belongs to all the identical crates together.', explanation: `x = ${c - b} ÷ ${a} = ${x}.`, why: 'Dividing both equal quantities by the same nonzero number preserves equality.' });
    return out({ prompt: `You know two totals are equal. Which action is guaranteed to keep them equal?`, instruction: 'The rule should work for any equal starting totals.', visual: equation(a, b, c, x), answer: choose,
      choices: [option('same', 'Add 7 to both totals'), option('different', 'Add 7 to one and 3 to the other', 'Different changes do not preserve equal totals.'), option('one', 'Double just the left total', 'Changing only one side generally breaks equality.')], expected: 'same',
      hint: 'Use exactly the same change on each whole side.', explanation: 'If L = R, then L + 7 = R + 7.', why: 'This principle is the reason equation-solving operations work.' });
  }
  if (missionId === 'room-floor' || missionId === 'room-border' || missionId === 'room-stack') {
    const length = [6, 5, 4][v] + (step === 2 ? 1 : 0), width = [4, 3, 5][(v + step) % 3], height = [3, 4, 2][(v + step) % 3];
    const mode = missionId === 'room-floor' ? 'area' : missionId === 'room-border' ? 'perimeter' : 'volume';
    const measure = mode === 'area' ? length * width : mode === 'perimeter' ? 2 * (length + width) : length * width * height;
    const key = mode === 'volume' ? 'height' : 'length';
    const missing = key === 'height' ? height : length;
    const label = mode === 'volume' ? 'Height' : 'Length';
    const unit = mode === 'volume' ? 'cubic units' : mode === 'area' ? 'square units' : 'units';
    const formula = mode === 'volume' ? `${length} × ${width} × ${height} = ${measure}` : mode === 'area' ? `${length} × ${width} = ${measure}` : `2 × (${length} + ${width}) = ${measure}`;
    return out({ prompt: step === 0 ? mode === 'volume' ? `Build a box with a ${length}-by-${width} base and volume ${measure} cubic units.` : `Keep the width at ${width}. Build a room with ${mode} ${measure} ${unit}.` : step === 1 ? mode === 'volume' ? `Find the volume of this ${length} × ${width} × ${height} box.` : `Find the ${mode} of a ${length}-by-${width} room.` : mode === 'volume' ? `A storage box has volume ${measure} cubic units and base ${length} by ${width}. What is its height?` : mode === 'area' ? `A rug covers ${measure} square units and is ${width} units wide. How long is it?` : `A rectangular garden needs ${measure} units of fencing. Its width is ${width}. What is its length?`,
      instruction: mode === 'volume' ? 'Count the cubes in one base layer, then the number of layers.' : mode === 'area' ? 'Area measures the equal squares covering the inside.' : 'Perimeter measures the distance around all four edges.',
      visual: { ...room(step !== 1 && key === 'length' ? 1 : length, width, step !== 1 && key === 'height' ? 1 : height, mode), unknownKey: step !== 1 ? key : null, targetMeasure: measure }, inputs: step === 0 ? [slider(key, label, 1, 12, 1)] : [],
      expected: step === 1 ? measure : missing, answer: numeric(step === 1 ? mode === 'volume' ? 'Volume' : mode === 'area' ? 'Area' : 'Perimeter' : label, step === 0 ? key : undefined), unit: step === 1 ? unit : 'units',
      hint: mode === 'volume' ? 'Use base area × number of layers.' : mode === 'area' ? 'Use length × width.' : 'There are two lengths and two widths. Add all four sides.', explanation: `${mode === 'volume' ? 'Volume' : mode === 'area' ? 'Area' : 'Perimeter'}: ${formula} ${unit}.${step !== 1 ? ` The missing ${label.toLowerCase()} is ${missing} units.` : ''}`, why: 'Area, perimeter, and volume measure different things. Their square, length, and cubic units tell you which measure you are using.',
      misconceptions: step === 1 ? [{ value: mode === 'area' ? 2 * (length + width) : mode === 'perimeter' ? length * width : length * width, feedback: mode === 'area' ? 'That measures the boundary. This question asks how many unit squares cover the inside.' : mode === 'perimeter' ? 'That counts the squares inside. This question asks for the distance around the outside.' : 'That counts one base layer. Include all the layers for volume.' }] : [] });
  }
  if (missionId === 'fountain-peak') {
    const h = [3, 4, 2][v] + (step === 2 ? 1 : 0), k = [9, 16, 4][v];
    const build = step === 0;
    return out({ prompt: build ? `Place the arch’s peak at (${h}, ${k}).` : step === 1 ? `For ${squareForm(h, k)}, where is the vertex?` : `A reflector follows ${squareForm(h, k)}. What x-coordinate locates its highest point?`, instruction: build ? 'Move the horizontal and vertical peak controls. The axes are measured in meters.' : 'Vertex form shows a horizontal position h and a vertical height k.',
      visual: fountain(build ? 1 : h, build ? 1 : k), inputs: build ? [slider('h', 'Horizontal peak h (m)', 0, 8, 1), slider('k', 'Peak height k (m)', 1, 20, 1)] : [],
      answer: step === 2 ? numeric('Peak x-coordinate') : pair(['h', 'k'], ['x-coordinate', 'Height']), expected: step === 2 ? h : { h, k }, unit: 'm',
      hint: 'At x = h the squared term is zero. Everywhere else its negative lowers the height.', explanation: `At x = ${h}, y = −0² + ${k} = ${k}. The vertex is (${h}, ${k}), and it is a maximum because the squared term is negative.`, why: 'This is an idealized quadratic path. Its graph connects the equation’s parameters with geometric features.' });
  }
  if (missionId === 'fountain-land') {
    const s = [3, 4, 2][v], h = s + (step === 1 ? 1 : 0), k = s * s, left = h - s, right = h + s;
    if (step === 0) return out({ prompt: `The arch’s peak height is ${k} m. Shift it until its left ground-level point is x = 0.`, instruction: 'Change h. Ground level means y = 0.', visual: fountain(1, k, 'roots'), inputs: [slider('h', 'Horizontal peak h (m)', 0, 8, 1)], answer: numeric('Horizontal peak h', 'h'), expected: s, unit: 'm',
      hint: `The two ground points lie √${k} units to either side of the peak.`, explanation: `0 = −(x − h)² + ${k} means x = h ± ${s}. Set h − ${s} = 0, giving h = ${s}.`, why: 'The roots are the x-coordinates where a graph has height zero.' });
    if (step === 1) return out({ prompt: `Find both ground-level positions of ${squareForm(h, k)}.`, instruction: 'Give the left position first and the right position second.', visual: fountain(h, k, 'roots'), answer: pair(['left', 'right'], ['Left root', 'Right root']), expected: { left, right }, unit: 'm',
      hint: `At ground level, (x − ${h})² = ${k}. Remember both square-root directions.`, explanation: `x − ${h} = ±${s}, so x = ${left} or x = ${right}.`, why: 'A positive squared quantity has both a positive and a negative square root.' });
    return out({ prompt: `An arch follows ${squareForm(h, k)}. How far apart are its two ground-level points?`, instruction: 'Find the two roots, then subtract left position from right position.', visual: fountain(h, k, 'roots'), answer: numeric('Ground-level span'), expected: 2 * s, unit: 'm',
      hint: 'Each root lies the same horizontal distance from the vertex.', explanation: `The roots are ${left} and ${right}. Their separation is ${right} − ${left} = ${2 * s} m.`, why: 'Moving an arch horizontally changes both roots equally, so it does not change the span.' });
  }
  if (missionId === 'fountain-height') {
    const h = [4, 5, 3][v], k = [16, 25, 9][v], d = step === 1 ? 1 : 2, x = h - d, height = k - d * d;
    if (step === 0) return out({ prompt: `On the left half of ${squareForm(h, k)}, find the position with height ${height} m.`, instruction: `Move the marker between x = 0 and x = ${h}. Only the left half is allowed, so there is one answer.`, visual: fountain(h, k, 'height', 0), inputs: [slider('x', 'Marker x-coordinate (m)', 0, h, 0)], answer: numeric('Marker x-coordinate', 'x'), expected: x, unit: 'm',
      hint: 'Measure the horizontal distance from the peak, square it, and subtract it from the peak height.', explanation: `At x = ${x}, y = −(${x} − ${h})² + ${k} = −${d * d} + ${k} = ${height} m.`, why: 'Two positions can share a height on a parabola. Restricting to the left half makes this position unique.' });
    if (step === 1) return out({ prompt: `For ${squareForm(h, k)}, what is the height at x = ${x}?`, instruction: 'Substitute the coordinate, square the difference, then apply the negative sign.', visual: fountain(h, k, 'height', x), expected: height, answer: numeric('Height'), unit: 'm',
      hint: 'The negative sign is outside the square: first square the distance.', explanation: `y = −(${x} − ${h})² + ${k} = −${d * d} + ${k} = ${height}.`, why: 'Parentheses determine which quantity is squared.' });
    return out({ prompt: `A tunnel roof follows ${squareForm(h, k)}. At x = ${x}, what clearance is available above ground?`, instruction: 'Use the height at that location. This is a simplified mathematical model.', visual: fountain(h, k, 'height', x), answer: numeric('Clearance'), expected: height, unit: 'm',
      hint: 'A new setting can use the same equation. Calculate y at the given x.', explanation: `At x = ${x}, clearance = −(${x} − ${h})² + ${k} = ${height} m.`, why: 'A model lets you answer a question about a specific location, within its stated assumptions.' });
  }
  if (missionId === 'campus-slope') {
    const x = [2, 3, -1][v] + (step === 2 ? 1 : 0);
    return out({ prompt: step === 0 ? `For f(x) = x², move the tangent point to where its slope is ${2 * x}.` : step === 1 ? `For f(x) = x², find f′(${x}).` : `A position model is s(t) = t² meters for t ≥ 0. What is the instantaneous velocity at t = ${Math.abs(x)} seconds?`,
      instruction: 'The derivative f′(x) = 2x gives tangent slope at each x, rather than the curve’s height.', visual: { type: 'calculus', mode: 'derivative', coefficient: 1, x: step === 0 ? 0 : step === 2 ? Math.abs(x) : x },
      inputs: step === 0 ? [slider('x', 'Tangent x-coordinate', -3, 5, 0)] : [], answer: numeric(step === 0 ? 'Tangent x-coordinate' : step === 2 ? 'Velocity' : 'Tangent slope', step === 0 ? 'x' : undefined), expected: step === 0 ? x : step === 2 ? 2 * Math.abs(x) : 2 * x, unit: step === 2 ? 'm/s' : '',
      hint: 'For a square function the derivative is twice the input. Slope and function value are different quantities.', explanation: `f′(x) = lim as h → 0 of [(x + h)² − x²]/h = lim(2x + h) = 2x.${step === 0 ? ` Slope ${2 * x} occurs at x = ${x}.` : ` At input ${step === 2 ? Math.abs(x) : x}, the derivative is ${step === 2 ? 2 * Math.abs(x) : 2 * x}.`}`, why: 'A tangent line has the same instantaneous rate of change as a differentiable curve at its contact point.' });
  }
  if (missionId === 'campus-area') {
    const upper = [4, 3, 5][v] + (step === 2 ? 1 : 0), area = upper * upper / 2;
    return out({ prompt: step === 0 ? `For y = x on [0, b], choose b so the shaded area is ${fmt(area)} square units.` : step === 1 ? `Evaluate ∫₀^${upper} x dx.` : `Flow is q(t) = t liters per minute for 0 ≤ t ≤ ${upper}. How many liters accumulate?`, instruction: 'The nonnegative region is a right triangle with base b and height b. Its area is b²/2.',
      visual: { type: 'calculus', mode: 'integral', coefficient: 1, upper: step === 0 ? 1 : upper, x: 0 }, inputs: step === 0 ? [slider('upper', 'Upper bound b', 1, 8, 1)] : [],
      answer: numeric(step === 0 ? 'Upper bound b' : step === 2 ? 'Accumulated amount' : 'Integral value', step === 0 ? 'upper' : undefined), expected: step === 0 ? upper : area, unit: step === 0 ? '' : step === 2 ? 'liters' : 'square units',
      hint: 'Use ½ × base × height. Here the base and height have the same numerical value.', explanation: `∫₀^${upper} x dx = [x²/2]₀^${upper} = ${upper}²/2 = ${fmt(area)}.${step === 0 ? ` Thus b = ${upper} for nonnegative b.` : ''}`, why: 'The definite integral accumulates signed values. On this nonnegative interval it equals ordinary area; integrating a rate produces an amount.' });
  }
  if (missionId === 'campus-vectors') {
    const x = [2, -1, 3][v], y = [1, 3, -2][v], dx = [3, 2, -1][(v + step) % 3], dy = [2, -1, 4][(v + step) % 3];
    const expected = { x: x + dx, y: y + dy };
    return out({ prompt: step === 0 ? `Combine displacement (${x}, ${y}) with (${dx}, ${dy}). Place the endpoint of the sum.` : step === 1 ? `Compute (${x}, ${y}) + (${dx}, ${dy}).` : `A robot moves (${x}, ${y}) meters, then (${dx}, ${dy}) meters from the origin. What is its final position?`, instruction: 'Add horizontal components together and vertical components together. The arrows use the same scale.',
      visual: { type: 'vector', x, y, dx, dy, sumX: step === 0 ? 0 : x + dx, sumY: step === 0 ? 0 : y + dy }, inputs: step === 0 ? [slider('sumX', 'Endpoint horizontal coordinate', -8, 8, 0), slider('sumY', 'Endpoint vertical coordinate', -8, 8, 0)] : [],
      answer: step === 0 ? pair(['sumX', 'sumY'], ['Horizontal coordinate', 'Vertical coordinate']) : pair(['x', 'y'], ['Horizontal coordinate', 'Vertical coordinate']), expected: step === 0 ? { sumX: expected.x, sumY: expected.y } : expected, unit: step === 2 ? 'm' : '',
      hint: 'Keep components in order: horizontal with horizontal, vertical with vertical.', explanation: `(${x}, ${y}) + (${dx}, ${dy}) = (${x} + (${dx}), ${y} + (${dy})) = (${expected.x}, ${expected.y}).`, why: 'Vector addition combines displacements; the final vector does not encode the total distance traveled along the path.' });
  }
  throw new RangeError('This mission has no authored challenges yet.');
}

export function taskFor(missionId, step = 0, seed = 1) {
  return adaptTask(missionById(missionId), rawTaskFor(missionId, step, seed));
}

export function checkTask(task, response) {
  const failure = feedback => ({ correct: false, feedback, explanation: '' });
  if (!task || !task.answer) return failure('Choose a challenge first.');
  let correct = false;
  if (task.answer.kind === 'choice') {
    if (typeof response !== 'string' && typeof response !== 'number') return failure('Choose one of the answers.');
    const selected = task.choices?.find(choice => choice.value === String(response));
    if (!selected) return failure('Choose one of the displayed answers.');
    correct = String(response) === String(task.expected);
    if (!correct) return failure(selected.feedback || 'Take another look at the model. You can use a hint and try again.');
  } else if (task.answer.kind === 'pair') {
    if (!response || typeof response !== 'object' || Array.isArray(response)) return failure('Enter both values, in the labeled places.');
    const values = task.answer.keys.map(key => parseAnswer(response[key]));
    if (values.some(value => value === null)) return failure('Enter a number or a fraction in each labeled place.');
    correct = task.answer.keys.every((key, index) => near(values[index], task.expected[key]));
    if (!correct && task.visual.type === 'garden') {
      const { blue, yellow } = response;
      const b = parseAnswer(blue), y = parseAnswer(yellow);
      if (b !== null && y !== null && task.visual.targetTotal !== undefined && near(b + y, task.visual.targetTotal)) return failure('The total fits. Now check that both colors use the same ratio scale factor.');
    }
  } else {
    const value = parseAnswer(response);
    if (value === null) return failure('Enter a number or a fraction, such as 3 or 1/2.');
    correct = near(value, task.expected);
    if (!correct) {
      const misconception = task.misconceptions?.find(item => near(value, item.value));
      if (misconception) return failure(misconception.feedback);
    }
  }
  return correct ? { correct: true, feedback: 'That fits. Your model and answer agree.', explanation: task.explanation } : failure('Not quite yet. Check the labeled quantities, use a hint if useful, and try another move.');
}
