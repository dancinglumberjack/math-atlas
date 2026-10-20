/* Original, adult-guided Kindergarten explorations. Three short challenges
   and three bounded examples per lesson support revisiting an idea. These
   lessons practice selected standards; they do not establish fluency or
   replace a complete school curriculum. No speech, timers, or typed answers. */
const K = (suffix, title, topicId, unit, conceptKey, standards, goal, prerequisite, workedExample, explainPrompt, reviewPrompt) => ({
  id: 'ky-' + suffix, title, topicId, unitId: `k-unit-${unit}`, conceptKey, conceptId: conceptKey,
  bandId: 'early', gradeIds: ['k'], worldId: unit >= 5 ? 'studio' : 'meadow', standards, sourceIds: [], lessonId: null,
  minutes: 6, goal, skill: goal, teacherNotes: 'Explore with a grown-up. Point, build, and explain with objects or gestures. Pause whenever useful; finishing is practice, not proof of mastery.',
  lessonPlan: { goal, prerequisite, workedExample, explainPrompt, reviewPrompt }
});

export const kMissions = [
  K('count-picnic', 'Pebbles for a tiny picnic', 'counting', 1, 'k-count', ['K.CC.B.4a', 'K.CC.B.4b', 'K.CC.B.5'], 'Count each object once and build a requested collection.', 'Point to one object at a time with a grown-up.', 'Touch each of four pebbles once: one, two, three, four. The last number tells how many.', 'Can you point to one pebble for each number?', 'Count a small group of spoons together.'),
  K('empty-nest', 'The wonderfully empty nest', 'counting', 1, 'k-count', ['K.CC.A.3', 'K.CC.B.4b'], 'Connect zero with an empty collection.', 'Notice when a place has some objects or none.', 'A plate with no berries has zero berries. Put one berry on it and the count becomes one.', 'What is different about zero and one?', 'Find an empty cup and describe its count of counters.'),
  K('one-more', 'One more guest!', 'counting', 1, 'k-count', ['K.CC.B.4c', 'K.CC.A.2'], 'See that adding one moves the count to the next number.', 'Count a collection of up to ten objects.', 'Four buttons and one more button make five. Five is the number just after four.', 'What changed when one more arrived?', 'Put one more block beside a small collection.'),
  K('count-same', 'The pebbles changed seats', 'counting', 1, 'k-count', ['K.CC.B.4b', 'K.CC.B.5'], 'Notice that moving a collection does not change how many.', 'Count each object once without skipping it.', 'Six counters stay six when moved from a line into a frame. None came in or went away.', 'Did any object arrive or leave?', 'Move five buttons around, then count again.'),
  K('fill-ten', 'The ten-seat snail bus', 'counting', 2, 'k-teen', ['K.CC.B.5', 'K.OA.A.4'], 'Use a ten-frame to see a count and its empty spaces.', 'Recognize a small count and the number ten.', 'A frame has ten seats. With four filled, six seats remain empty; four and six make ten.', 'How can the empty seats help you see ten?', 'Draw ten boxes and fill some with beans.'),
  K('teen-bundles', 'Ten and a little extra', 'place-value', 2, 'k-teen', ['K.NBT.A.1', 'K.CC.B.5'], 'Read a teen number as ten ones and some extra ones.', 'Count one full ten-frame as ten objects.', 'Sixteen is ten ones and six more ones: 16 = 10 + 6. Keep all sixteen objects.', 'Which part is the full ten? Which part is extra?', 'Build seventeen using ten counters and seven extra.'),
  K('build-teen', 'A full frame has friends', 'place-value', 2, 'k-teen', ['K.NBT.A.1', 'K.CC.B.5'], 'Build a teen number using one ten and extra ones.', 'Understand one ten as a group of ten ones.', 'To build nineteen, fill one frame of ten and place nine extra ones next to it.', 'How do the two parts tell the whole number?', 'Build eleven and point to its ten and extra one.'),
  K('count-forward', 'The path keeps going', 'counting', 2, 'k-teen', ['K.CC.A.2', 'K.CC.B.4c', 'K.CC.B.5'], 'Count forward from a teen number without starting at one.', 'Know number names through the teen numbers.', 'Start at twelve. One more is thirteen; another is fourteen. We can begin counting at twelve.', 'Can you start with the count you already know?', 'Start at seventeen and count on to twenty.'),
  K('match-bags', 'Fair bags for two friends', 'counting', 3, 'k-compare', ['K.CC.C.6'], 'Match collections and make two counts equal.', 'Count each collection once per object.', 'One bag has three nuts and another has five. Giving the first bag two more makes both counts five.', 'Can every object find a partner in the other bag?', 'Make two equal groups of small toys.'),
  K('compare-numerals', 'The number sign detectives', 'counting', 3, 'k-compare', ['K.CC.C.6', 'K.CC.C.7'], 'Compare written numbers from one to ten with collections.', 'Connect a written numeral to its object count.', 'The numeral 8 names more objects than the numeral 4. Equal counts can use the same numeral.', 'What does each written number count?', 'Choose two numerals from one to ten and build them.'),
  K('split-five', 'Five snacks, two bowls', 'addition', 3, 'k-parts', ['K.OA.A.3'], 'Split five into two parts in more than one way.', 'Count five objects as one whole collection.', 'Five snacks can be four in one bowl and one in another, or two and three. Both totals stay five.', 'Can the two parts change while the whole stays five?', 'Find another way to share five counters between two bowls.'),
  K('make-ten', 'Ten has a missing friend', 'addition', 3, 'k-parts', ['K.OA.A.3', 'K.OA.A.4'], 'Find the part that joins a given part to make ten.', 'Count filled and empty seats in a ten-frame.', 'Two filled spaces and eight empty spaces make ten spaces. Add eight to make the frame full.', 'Which spaces show the missing part?', 'Show ten as five and five, then six and four.'),
  K('add-arrivals', 'More guests at the picnic', 'addition', 4, 'k-add', ['K.OA.A.1', 'K.OA.A.2'], 'Show addition by keeping the starting objects and adding new ones.', 'Understand the next number as one more.', 'Three frogs wait. Two more arrive. Keep the first three and add two: now there are five frogs.', 'Which objects were here first? Which are new?', 'Act out one guest arriving, then two more.'),
  K('add-parts', 'Two bowls, one snack pile', 'addition', 4, 'k-add', ['K.OA.A.1', 'K.OA.A.2'], 'Join two parts within ten and connect the model to an equation.', 'Count each of two small groups.', 'One bowl has one berry and another has four. Together there are five: 1 + 4 = 5.', 'Where can you see each number in the picture?', 'Combine three counters and four counters.'),
  K('take-away', 'The ducks went for a wobble', 'subtraction', 4, 'k-subtract', ['K.OA.A.1', 'K.OA.A.2'], 'Take a part away from a whole within ten and count what remains.', 'Recognize that removed objects are no longer in the remaining group.', 'Five ducks rest. Two waddle away. Three stay: 5 − 2 = 3. Count the ducks that remain.', 'Which ducks stayed? Which went away?', 'Start with six toys and put one back.'),
  K('missing-snacks', 'The snack bowl mystery', 'subtraction', 4, 'k-subtract', ['K.OA.A.1', 'K.OA.A.2', 'K.OA.A.3'], 'Use a known whole and one part to find the other part.', 'Understand a whole made from two parts.', 'Eight snacks belong in two bowls. Five are in the first bowl, so the other bowl needs three.', 'How can you check both parts together?', 'Hide part of a group of six under a cup.'),
  K('ribbon-length', 'Ribbons at the same starting line', 'measuring', 5, 'k-measure-sort', ['K.MD.A.1', 'K.MD.A.2'], 'Directly compare two lengths from the same starting point.', 'Notice where each ribbon begins and ends.', 'Line up one end of two ribbons. The ribbon that reaches farther is longer; an equal endpoint means equal length.', 'Why do the ribbons need the same starting line?', 'Line up two pencils and compare their lengths.'),
  K('tower-height', 'A very small tower contest', 'measuring', 5, 'k-measure-sort', ['K.MD.A.1', 'K.MD.A.2'], 'Compare heights from the same bottom level.', 'Notice the bottom and top of each tower.', 'Place two towers on the same table. A tower reaching higher is taller, even when it has a different color.', 'Are both towers standing on the same level?', 'Build two block towers and find the shorter one.'),
  K('shape-sort', 'Round things in this basket', 'data', 5, 'k-measure-sort', ['K.MD.B.3', 'K.G.A.2'], 'Sort by a named shape and count the objects in that category.', 'Notice circles and triangles by their features.', 'From three circles and two triangles, place the three circles in one group. That category has three objects.', 'Which feature tells you where an object belongs?', 'Sort a few paper circles and triangles into groups.'),
  K('category-count', 'Which shape basket has more?', 'data', 5, 'k-measure-sort', ['K.MD.B.3', 'K.CC.C.6'], 'Compare counts in named categories, including equal counts.', 'Sort objects using one clear rule.', 'A square basket has five shapes and a triangle basket has two. The square category has more objects.', 'Are you comparing shape names or how many objects?', 'Make two named groups and compare their counts.'),
  K('flat-shapes', 'Flat shape friends', 'geometry', 6, 'k-shapes', ['K.G.A.2', 'K.G.A.3', 'K.G.B.4'], 'Name flat shapes and notice their straight sides.', 'Look at a shape outline and follow its boundary.', 'A rectangle is a flat shape with four straight sides. A circle has a curved boundary and no straight sides.', 'Can you trace the boundary and count straight sides?', 'Find a flat triangle and a flat circle on paper.'),
  K('solid-shapes', 'Shapes you can hold', 'geometry', 6, 'k-shapes', ['K.G.A.2', 'K.G.A.3', 'K.G.B.4'], 'Name familiar solid shapes and distinguish solids from flat shapes.', 'Compare a flat drawing with an object you can hold.', 'A ball is shaped like a sphere. A circle is flat; a sphere takes up space in every direction.', 'Could this shape be a flat cutout or a solid object?', 'Look for a cube-shaped box or a cylinder-shaped can.'),
  K('turn-shapes', 'A square can do a cartwheel', 'geometry', 6, 'k-shapes', ['K.G.A.2', 'K.G.B.4'], 'Recognize a shape after a turn by checking its sides and corners.', 'Name a few flat shapes by their features.', 'Turn a paper square onto a corner. It still has four equal sides and four square corners, so it stays a square.', 'Which features stayed the same after the turn?', 'Turn a paper triangle and name it each time.'),
  K('shapes-together', 'A tiny shape building crew', 'geometry', 6, 'k-shapes', ['K.G.A.1', 'K.G.B.6'], 'Use position words and join simple shapes into a larger shape.', 'Name the shapes and notice where each one is.', 'Put a circle above a square. Then join two equal squares side by side, with whole sides touching, to make a rectangle.', 'Where is each shape? Which full sides touch in the new shape?', 'Join two paper triangles to make a square.')
].map((m, index) => ({ ...m, order: 200 + index }));

const byId = new Map(kMissions.map(m => [m.id, m]));
const option = (value, label = value) => ({ value: String(value), label: String(label) });
const control = (key, label, min, max, initial = min) => ({ key, label, min, max, initial, step: 1 });
const frame = (count, capacity = 10) => ({ type: 'primary', kind: 'ten-frame', count, capacity });
const collection = count => ({ type: 'count', mode: 'count', count });
const comparison = (left, right) => ({ type: 'primary', kind: 'comparison', left, right, labels: ['Left group', 'Right group'] });
const shapes = (names, rest = {}) => ({ type: 'primary', kind: 'shapes', shapes: names, ...rest });

export function kTaskFor(id, step = 0, seed = 1) {
  if (!byId.has(id)) return null;
  if (!Number.isInteger(step) || step < 0 || step > 2) throw new RangeError('A Kindergarten lesson has three challenges, numbered 0 to 2.');
  if (!Number.isSafeInteger(seed)) throw new TypeError('The variation seed must be a safe integer.');
  const v = ((seed % 3 - 1) % 3 + 3) % 3;
  const out = details => ({ id: `${id}:${step}:${seed}`, missionId: id, step, kind: ['build', 'practice', 'apply'][step], title: ['Let’s build', 'Have a little try', 'One more adventure'][step], prompt: '', instruction: 'Point, tap, and explore together.', inputs: [], visual: {}, answer: { kind: 'number', label: 'Your build', key: 'count' }, expected: 0, hint: '', explanation: '', why: 'The picture helps us see what the numbers mean.', unit: '', ...details });
  const pick = (expected, options, details) => {
    const choices = options.map(o => typeof o === 'object' ? o : option(o));
    const shift = ((seed % choices.length + step) % choices.length + choices.length) % choices.length;
    return out({ answer: { kind: 'choice', label: 'Tap your choice' }, expected: String(expected), choices: [...choices.slice(shift), ...choices.slice(0, shift)], ...details });
  };
  const pickNumber = (n, details) => pick(n, [Math.max(0, n - 1), n, Math.min(20, n + 1)].filter((a, i, all) => all.indexOf(a) === i), details);
  const build = (expected, visual, key, min, max, initial, details) => out({ visual, inputs: [control(key, key === 'count' ? 'Objects' : key === 'remove' ? 'Take away' : 'Right group', min, max, initial)], answer: { kind: 'number', label: 'Your build', key }, expected, ...details });

  if (id === 'ky-count-picnic') {
    const n = [3, 4, 5][v] + [0, 2, 5][step];
    const details = { prompt: step === 1 ? `Put ${n} pebbles on the frame.` : 'How many pebbles are here?', instruction: step === 1 ? 'Tap + to add one pebble at a time.' : 'Touch each pebble once. Then tap its number.', hint: 'Each pebble gets one number name.', explanation: `There are ${n} pebbles. The last count tells how many.` };
    return step === 1 ? build(n, frame(0), 'count', 0, 10, 0, details) : pickNumber(n, { ...details, visual: collection(n) });
  }
  if (id === 'ky-empty-nest') {
    if (step === 0) return pick(0, [0, 1, 2], { prompt: 'No pebbles in this nest! Which number fits?', visual: frame(0), hint: 'Zero means none.', explanation: 'An empty collection has zero objects.' });
    if (step === 1) { const n = [3, 4, 5][v]; return pick(0, [0, 1, n], { prompt: `All ${n} ducks leave. How many stay?`, visual: { type: 'blocks', start: n, remove: n }, hint: 'None are left in the staying group.', explanation: `${n} take away ${n} leaves zero.` }); }
    const n = [1, 2, 3][v]; return build(n, frame(0), 'count', 0, 10, 0, { prompt: `The empty nest gets ${n} pebble${n === 1 ? '' : 's'}. Build it.`, hint: 'Start with no pebbles, then add the guests.', explanation: `Zero pebbles and ${n} new pebbles make ${n}.` });
  }
  if (id === 'ky-one-more') {
    const n = [3, 5, 7][v] + step;
    const details = { prompt: `${n} guests are here. One more arrives. How many now?`, hint: `Keep ${n}, then count one more.`, explanation: `${n} and one more make ${n + 1}.` };
    return step === 1 ? pickNumber(n + 1, { ...details, visual: collection(n) }) : build(n + 1, frame(n), 'count', 0, 10, n, details);
  }
  if (id === 'ky-count-same') {
    const n = [5, 7, 9][v];
    if (step < 2) return pickNumber(n, { prompt: step === 0 ? 'Count these pebbles.' : 'The same pebbles moved into seats. How many now?', visual: step === 0 ? collection(n) : frame(n), hint: 'Moving things does not add or take any away.', explanation: `There are still ${n}. No pebble arrived or left.` });
    return pick('same', [option('more', 'More on the right'), option('same', 'The same number'), option('fewer', 'Fewer on the right')], { prompt: 'The pebbles changed places. What happened to the count?', visual: comparison(n, n), hint: 'Match one pebble on the left with one on the right.', explanation: 'The arrangements can change while the count stays the same.' });
  }
  if (id === 'ky-fill-ten') {
    const n = [6, 7, 8][v];
    if (step === 0) return build(n, frame(0), 'count', 0, 10, 0, { prompt: `Give ${n} snails a seat.`, hint: 'Each filled seat holds one snail.', explanation: `${n} filled seats show ${n} snails.` });
    if (step === 1) return pickNumber(10 - n, { prompt: 'How many seats are empty?', visual: frame(n), hint: 'Count just the empty spaces.', explanation: `${n} filled and ${10 - n} empty make ten seats.` });
    return build(10, frame(n), 'count', 0, 10, n, { prompt: 'Fill the bus. It has ten seats.', hint: 'Add one snail to each empty seat.', explanation: 'All ten seats are filled. The frame shows ten.' });
  }
  if (id === 'ky-teen-bundles') {
    const n = [13, 15, 17][v], extra = n - 10;
    if (step === 0) return pickNumber(n, { prompt: 'One full ten, then some extra. How many altogether?', visual: frame(n, 20), hint: 'Start with ten, then count the extra ones.', explanation: `Ten and ${extra} make ${n}.` });
    if (step === 1) return pickNumber(extra, { prompt: 'The bundle holds ten. How many extra ones?', visual: { type: 'base-ten', hundreds: 0, tens: 1, ones: extra }, hint: 'Count the loose ones, outside the ten bundle.', explanation: `${n} is ten ones and ${extra} extra ones.` });
    return pick(`10+${extra}`, [option(`10+${extra}`, `10 + ${extra}`), option(`10+${extra - 1}`, `10 + ${extra - 1}`), option(`1+${extra}`, `1 + ${extra}`)], { prompt: `Which parts build ${n}?`, visual: frame(n, 20), hint: 'One full frame is ten, not one.', explanation: `${n} = 10 + ${extra}. The ten contains ten ones.` });
  }
  if (id === 'ky-build-teen') {
    const n = [12, 14, 18][v], extra = n - 10;
    if (step === 1) return out({ prompt: `Keep one ten. Add the ones to make ${n}.`, visual: { type: 'base-ten', hundreds: 0, tens: 1, ones: 0 }, inputs: [control('tens', 'Tens', 1, 1, 1), control('ones', 'Extra ones', 0, 9, 0)], answer: { kind: 'pair', keys: ['tens', 'ones'], labels: ['Tens', 'Extra ones'] }, expected: { tens: 1, ones: extra }, hint: 'The ten stays. Count on with the extra ones.', explanation: `One ten and ${extra} ones make ${n}.` });
    const goal = n + (step === 2 ? 1 : 0); return build(goal, frame(10, 20), 'count', 10, 20, 10, { prompt: `One frame is full. Build ${goal} altogether.`, hint: `Keep the first ten. Add ${goal - 10} extra ones.`, explanation: `10 + ${goal - 10} = ${goal}.` });
  }
  if (id === 'ky-count-forward') {
    const n = [15, 16, 17][v], goal = n + step + 1;
    const details = { prompt: `Start at ${n}. Count on ${step + 1}. Where do you land?`, hint: `Keep ${n} in mind. Each new object is one more.`, explanation: `Starting at ${n}, ${step + 1} more reaches ${goal}.` };
    return step === 1 ? build(goal, frame(n, 20), 'count', 0, 20, n, details) : pickNumber(goal, { ...details, visual: frame(n, 20) });
  }
  if (id === 'ky-match-bags') {
    const a = [4, 5, 6][v];
    if (step === 0) return pick('right', [option('left', 'Left bag'), option('right', 'Right bag'), option('equal', 'Both are equal')], { prompt: 'Which bag has more?', visual: comparison(a, a + 2), hint: 'Give each object a partner across the bags.', explanation: `The right bag has ${a + 2}; the left has ${a}. The right has more.` });
    if (step === 1) return build(a, comparison(a, 0), 'right', 0, 10, 0, { prompt: 'Fill the right bag to match the left bag.', hint: 'Each object on the left needs one partner on the right.', explanation: `Both bags now have ${a}, so their counts are equal.` });
    return pick('equal', [option('left', 'Left bag has more'), option('right', 'Right bag has more'), option('equal', 'The bags are equal')], { prompt: 'Two new bags! Which has more?', visual: comparison(a + 1, a + 1), hint: 'Check whether any object lacks a partner.', explanation: `Each bag has ${a + 1}. Neither has more.` });
  }
  if (id === 'ky-compare-numerals') {
    const a = [3, 4, 5][v], b = a + 4;
    if (step === 0) return pick(b, [a, b, b - 1], { prompt: `Which written number is greater: ${a} or ${b}?`, visual: comparison(a, b), hint: 'A greater number names more objects.', explanation: `${b} names more objects than ${a}, so ${b} is greater.` });
    if (step === 1) return pick(b - 1, [b - 1, b, b + 1], { prompt: `Which number is less than ${b}?`, visual: frame(b), hint: 'Less means a smaller count.', explanation: `${b - 1} is less than ${b}.` });
    return pick('equal', [option('greater', 'Greater'), option('less', 'Less'), option('equal', 'Equal')], { prompt: `Compare ${b - 1} and ${b - 1}.`, visual: comparison(b - 1, b - 1), hint: 'The same numeral names the same count.', explanation: `${b - 1} and ${b - 1} are equal.` });
  }
  if (id === 'ky-split-five') {
    const left = [[1, 2, 4], [2, 3, 1], [3, 4, 2]][step][v], right = 5 - left;
    const details = { prompt: `Five snacks altogether. Put ${left} on the left and the rest on the right.`, hint: 'Count both bowls together. They must still hold five.', explanation: `${left} + ${right} = 5. Changing the parts can keep the whole five.` };
    if (step < 2) return build(right, comparison(left, 0), 'right', 0, 5, 0, details);
    return out({ ...details, visual: comparison(0, 0), inputs: [control('left', 'Left bowl', 0, 5, 0), control('right', 'Right bowl', 0, 5, 0)], answer: { kind: 'pair', keys: ['left', 'right'], labels: ['Left bowl', 'Right bowl'] }, expected: { left, right } });
  }
  if (id === 'ky-make-ten') {
    const a = [7, 6, 8][v];
    if (step === 0) return pickNumber(10 - a, { prompt: `${a} are here. How many more make ten?`, visual: frame(a), hint: 'Look at the empty seats.', explanation: `${a} and ${10 - a} make ten.` });
    if (step === 1) return build(10, frame(a), 'count', 0, 10, a, { prompt: 'Add the missing friends until the frame has ten.', hint: 'One friend fills one empty seat.', explanation: `You added ${10 - a} to ${a}. Now there are ten.` });
    return build(10 - a, comparison(a, 0), 'right', 0, 10, 0, { prompt: `${a} in the left bowl. Build the part that makes ten.`, hint: 'Keep the left bowl. Count on to ten in the right bowl.', explanation: `${a} + ${10 - a} = 10.` });
  }
  if (id === 'ky-add-arrivals') {
    const a = [2, 3, 4][v], b = [1, 2, 3][v], start = a + step, added = step === 1 ? 1 : b, total = start + added;
    return build(total, frame(start), 'count', 0, 10, start, { prompt: `${start} guests wait. ${added} more arrive. Build the new group.`, hint: 'Keep the guests already here and add the new guests.', explanation: `${start} + ${added} = ${total}. Adding joins the guests.` });
  }
  if (id === 'ky-add-parts') {
    const a = [2, 3, 4][v], b = [3, 4, 5][v], total = a + b;
    if (step === 0) return pickNumber(total, { prompt: 'How many snacks in both bowls together?', visual: comparison(a, b), hint: 'Count every snack in both bowls once.', explanation: `${a} and ${b} make ${total} altogether.` });
    if (step === 1) return build(total, frame(0), 'count', 0, 10, 0, { prompt: `Join ${a} snacks and ${b} snacks on one frame.`, hint: 'Build the first part, then the second part.', explanation: `${a} + ${b} = ${total}.` });
    return pick(`${a}+${b}=${total}`, [option(`${a}+${b}=${total}`, `${a} + ${b} = ${total}`), option(`${a}+${b}=${total - 1}`, `${a} + ${b} = ${total - 1}`), option(`${a}-${b}=${total}`, `${a} − ${b} = ${total}`)], { prompt: 'Which number sentence tells the joining story?', visual: comparison(a, b), hint: 'The plus sign means join these parts.', explanation: `${a} + ${b} = ${total} describes both parts and their whole.` });
  }
  if (id === 'ky-take-away') {
    const start = [6, 8, 9][v] + (step === 2 ? 1 : 0), remove = [2, 3, 2][v] + (step === 2 ? 1 : 0), remain = start - remove;
    if (step === 1) return build(remove, { type: 'blocks', start, remove: 0 }, 'remove', 0, start, 0, { prompt: `${start} ducks rest. Make ${remove} ducks waddle away.`, hint: 'Take away just the ducks that leave.', explanation: `${start} − ${remove} = ${remain}. ${remain} ducks stay.` });
    return pickNumber(remain, { prompt: `${start} ducks rest. ${remove} leave. How many stay?`, visual: { type: 'blocks', start, remove }, hint: 'Count the ducks that remain, not the ones that left.', explanation: `${start} − ${remove} = ${remain}.` });
  }
  if (id === 'ky-missing-snacks') {
    const whole = [5, 7, 9][v], part = [2, 3, 4][v], missing = whole - part;
    if (step === 0) return build(missing, comparison(part, 0), 'right', 0, 10, 0, { prompt: `${whole} snacks altogether. ${part} are on the left. Build the other part.`, hint: 'Count both bowls together until the total matches.', explanation: `${part} and ${missing} make ${whole}.` });
    if (step === 1) return pickNumber(missing, { prompt: `${whole} snacks: ${part} are showing and the rest are hidden. How many are hidden?`, visual: comparison(part, 0), hint: `Start with ${part}. Count on to ${whole}.`, explanation: `The hidden part is ${missing}, because ${part} + ${missing} = ${whole}.` });
    return build(missing, { type: 'blocks', start: whole, remove: 0 }, 'remove', 0, whole, 0, { prompt: `There are ${whole} snacks. Put some back until ${part} stay.`, hint: 'Watch the part that stays while taking away one at a time.', explanation: `Put back ${missing}. ${whole} − ${missing} = ${part}.` });
  }
  if (id === 'ky-ribbon-length' || id === 'ky-tower-height') {
    const vertical = id === 'ky-tower-height', a = [3, 4, 5][v], b = a + (vertical ? 2 : 3), lengths = step === 2 ? [a + 1, a + 1] : [a, b];
    const expected = step === 0 ? 'right' : step === 1 ? 'left' : 'equal';
    return pick(expected, [option('left', vertical ? 'Left tower' : 'Top ribbon'), option('right', vertical ? 'Right tower' : 'Bottom ribbon'), option('equal', 'They are equal')], { prompt: step === 2 ? `These ${vertical ? 'towers' : 'ribbons'} changed. Which is ${vertical ? 'taller' : 'longer'}?` : `Which is ${step === 0 ? (vertical ? 'taller' : 'longer') : (vertical ? 'shorter' : 'shorter')}?`, instruction: vertical ? 'Both towers stand on the same bottom line.' : 'Both ribbons start at the same left line.', visual: { type: 'primary', kind: 'length', lengths, labels: vertical ? ['Left tower', 'Right tower'] : ['Top ribbon', 'Bottom ribbon'], unit: 'cubes', orientation: vertical ? 'vertical' : 'horizontal' }, hint: 'Compare the endpoints from the shared starting line.', explanation: step === 2 ? 'The endpoints match, so the lengths are equal.' : `${step === 0 ? (vertical ? 'The right tower' : 'The bottom ribbon') : (vertical ? 'The left tower' : 'The top ribbon')} is ${step === 0 ? (vertical ? 'taller' : 'longer') : 'shorter'}.` });
  }
  if (id === 'ky-shape-sort') {
    const circles = [2, 3, 4][v], triangles = [3, 2, 2][v], names = [...Array(circles).fill('circle'), ...Array(triangles).fill('triangle')];
    if (step === 0) return pickNumber(circles, { prompt: 'Count only the circles.', visual: shapes(names), hint: 'A circle has a round boundary and no straight sides.', explanation: `The circle group has ${circles} objects.` });
    if (step === 1) return pick('circle', [option('circle', 'Circles'), option('triangle', 'Triangles'), option('square', 'Squares')], { prompt: 'The round-boundary basket is ready. Which group belongs?', visual: shapes(Array(circles).fill('circle')), hint: 'Name the shape with no straight sides.', explanation: 'Circles belong in the circle basket.' });
    return pickNumber(triangles, { prompt: 'Now count only the triangles.', visual: shapes(names), hint: 'Each triangle has three straight sides.', explanation: `The triangle group has ${triangles} objects.` });
  }
  if (id === 'ky-category-count') {
    const squares = [2, 4, 3][v], triangles = [4, 2, 3][v], names = [...Array(squares).fill('square'), ...Array(triangles).fill('triangle')];
    if (step === 0) return pick(squares === triangles ? 'equal' : squares > triangles ? 'square' : 'triangle', [option('square', 'Square group'), option('triangle', 'Triangle group'), option('equal', 'Equal counts')], { prompt: 'Which shape group has more objects?', visual: shapes(names), hint: 'Count the squares. Then count the triangles.', explanation: `${squares} squares and ${triangles} triangles: ${squares === triangles ? 'equal counts' : (squares > triangles ? 'more squares' : 'more triangles')}.` });
    if (step === 1) return pickNumber(Math.max(squares, triangles), { prompt: 'How many objects are in the larger group? If equal, choose their shared count.', visual: { type: 'data', kind: 'bar', labels: ['Squares', 'Triangles'], values: [squares, triangles], key: 1, max: 5, title: 'Our shape groups' }, hint: 'Each scale step stands for one shape.', explanation: `The larger count is ${Math.max(squares, triangles)}${squares === triangles ? ', shared by both groups' : ''}.` });
    return pick('shape', [option('shape', 'Sort by shape'), option('size', 'Sort by size'), option('color', 'Sort by color')], { prompt: 'Our baskets say “squares” and “triangles.” Which sorting rule fits?', visual: shapes(names), hint: 'The basket names tell you which feature to use.', explanation: 'Use the shape rule: squares in one basket and triangles in the other.' });
  }
  if (id === 'ky-flat-shapes') {
    const name = ['triangle', 'square', 'hexagon'][v], sides = [3, 4, 6][v];
    if (step === 1) return pickNumber(sides, { prompt: 'How many straight sides?', visual: shapes([name]), hint: 'Trace each straight edge once.', explanation: `A ${name} has ${sides} straight sides.` });
    return pick(name, [option('triangle', 'Triangle'), option('square', 'Square'), option('hexagon', 'Hexagon')], { prompt: step === 0 ? 'Which flat shape is this?' : 'It turned! Which flat shape is it now?', visual: shapes([name], { rotate: step === 2 }), hint: 'Look at the sides and corners, even after a turn.', explanation: `It is a ${name}. Turning it does not change its sides.` });
  }
  if (id === 'ky-solid-shapes') {
    const name = ['cube', 'sphere', 'cylinder'][v], flat = ['square', 'circle', 'rectangle'][v];
    if (step === 0) return pick(name, [option('cube', 'Cube'), option('sphere', 'Sphere'), option('cylinder', 'Cylinder')], { prompt: 'Which solid shape is this?', visual: shapes([name]), hint: 'Think of a box, a ball, or a can.', explanation: `This is a ${name}, a solid shape.` });
    if (step === 1) return pick('first', [option('first', 'First shape: left'), option('second', 'Second shape: right')], { prompt: 'Which picture represents a solid shape?', instruction: 'The first picture is on the left; the second is on the right.', visual: shapes([name, flat], { layout: 'beside' }), hint: 'A solid takes up space. A flat shape lies in a plane.', explanation: `The first picture represents a ${name}. The second shows a flat ${flat}.` });
    const other = ['cone', 'cube', 'sphere'][v]; return pick('solid', [option('solid', 'A solid shape'), option('flat', 'A flat shape')], { prompt: 'What kind of shape does this picture represent?', visual: shapes([other]), hint: 'Imagine the object the picture stands for.', explanation: `A ${other} is a solid shape. It takes up space.` });
  }
  if (id === 'ky-turn-shapes') {
    const name = ['square', 'triangle', 'rectangle'][v], corners = [4, 3, 4][v];
    if (step === 0) return pick(name, [option('square', 'Square'), option('triangle', 'Triangle'), option('rectangle', 'Rectangle with two long sides')], { prompt: 'The shape is doing a cartwheel. What is it?', visual: shapes([name], { rotate: true }), hint: 'Use the sides and corners, not which way it points.', explanation: `It is still a ${name}.` });
    if (step === 1) return pick('no', [option('yes', 'Yes, a new shape'), option('no', 'No, the same shape')], { prompt: `A ${name} turns. Does turning alone change its shape family?`, visual: shapes([name, name], { rotate: true }), hint: 'No side or corner was added, removed, or stretched.', explanation: 'A turn changes the direction it faces, not its shape family.' });
    return pickNumber(corners, { prompt: 'How many corners after the turn?', visual: shapes([name], { rotate: true }), hint: 'Trace around and find every meeting of two sides.', explanation: `The ${name} still has ${corners} corners.` });
  }
  if (id === 'ky-shapes-together') {
    const first = ['circle', 'triangle', 'hexagon'][v], second = ['square', 'circle', 'rectangle'][v];
    if (step === 0) return pick(first, [option(first, first[0].toUpperCase() + first.slice(1)), option(second, second[0].toUpperCase() + second.slice(1))], { prompt: `Which shape is beside the ${second}?`, instruction: `The ${first} is first, on the left. The ${second} is second, on the right.`, visual: shapes([first, second], { layout: 'beside' }), hint: 'Beside means next to.', explanation: `The ${first} is beside the ${second}.` });
    if (step === 1) return pick('above', [option('above', 'Above'), option('below', 'Below'), option('beside', 'Beside')], { prompt: `Where is the ${first} compared with the ${second}?`, instruction: `The ${first} is the first picture. The ${second} is the second picture.`, visual: shapes([first, second], { layout: 'above' }), hint: 'Look for the picture nearer the top.', explanation: `The ${first} is above the ${second}.` });
    const square = v !== 1; return pick(square ? 'square' : 'rectangle', [option('square', 'Square'), option('rectangle', 'Rectangle with two long sides'), option('triangle', 'Triangle')], { prompt: 'The little shapes joined along whole sides. What larger shape did they make?', visual: shapes(square ? ['triangle', 'triangle'] : ['square', 'square'], { compose: square ? 'square' : 'rectangle', layout: square ? 'join-triangles' : 'beside' }), hint: 'Trace just the outside boundary of the joined shape.', explanation: square ? 'The two right triangles join along their longest sides to make a square.' : 'Two equal squares join along one whole side to make a longer rectangle.' });
  }
  throw new Error(`Missing Kindergarten lesson: ${id}`);
}

const card = (title, body, visual, caption, actionLabel = 'See the next little step') => ({ title, body, visual, caption, actionLabel });
const concept = (id, title, steps, parentTip) => ({ id, title, bandIds: ['early'], missionIds: [], steps, parentTip });
export const kConcepts = [
  concept('k-count', 'Each little object gets one count', [
    card('An empty home', 'No counters are here. We call this count zero.', frame(0), 'Zero means no objects.'),
    card('One count for each', 'Touch each of four counters once. One, two, three, four.', collection(4), 'The last number, four, tells how many.'),
    card('One more joins', 'Keep those four and add one. Now the count is five.', frame(5), '4 and 1 more make 5.'),
    card('A move keeps the count', 'Move all five into seats. No counter arrived or left.', frame(5), 'Five is still five.', 'Try a counting adventure')
  ], 'Point with your child or let them point. Help each object get exactly one number. Recount after rearranging. No spoken response or writing is required.'),
  concept('k-teen', 'A teen is ten and some extra', [
    card('Meet a full ten', 'A full frame has ten counters: two rows of five.', frame(10), 'One full ten-frame = 10 ones.'),
    card('A second frame begins', 'Keep the full ten and add six extra counters.', frame(16, 20), '10 and 6 make 16.'),
    card('A bundle tells the same story', 'One bundle holds ten ones. Six loose ones are the extra part.', { type: 'base-ten', hundreds: 0, tens: 1, ones: 6 }, '16 = 10 + 6.', 'Try building a teen')
  ], 'Keep ten objects visible before using a ten bundle. Start counting the extras from ten. The teen lessons stop at twenty; they do not cover counting to one hundred.'),
  concept('k-compare', 'Find a partner. Compare the groups.', [
    card('Match across', 'Match one counter on the left with one on the right.', comparison(2, 5), 'There are 2 on the left and 5 on the right.'),
    card('Some have no partner', 'Three counters on the right have no left partner. The right group has more.', comparison(2, 5), '5 is greater than 2; 2 is less than 5.'),
    card('Everyone has a partner', 'Both groups have three. Each object has a partner, with none left over.', comparison(3, 3), 'Equal means the same count.', 'Try making equal groups')
  ], 'Use matching rather than space taken up by a collection. A spread-out group need not have more objects. Connect the count to its written numeral.'),
  concept('k-parts', 'Two little parts can make a whole', [
    card('One whole of five', 'These five counters belong to one whole collection.', frame(5), 'The whole is 5.'),
    card('Share the whole', 'Four can go left and one can go right. Both parts still total five.', comparison(4, 1), '4 + 1 = 5.'),
    card('Another way is allowed', 'Two left and three right also keep the whole five.', comparison(2, 3), '2 + 3 = 5.'),
    card('Ten has missing spaces', 'Two seats are filled. Eight empty seats complete the whole ten.', frame(2), '2 and 8 make 10.', 'Try finding a missing part')
  ], 'Use two bowls and a fixed collection. Move counters between bowls without adding any. Tell which number names a part and which names the whole.'),
  concept('k-add', 'Keep these. Add the new friends.', [
    card('A starting group', 'One friend waits at the picnic.', frame(1), 'Start with 1.'),
    card('Another group arrives', 'Four more friends arrive. Keep the first friend too.', comparison(1, 4), 'Join 1 and 4.'),
    card('One whole group now', 'Count all the friends. There are five together.', frame(5), '1 + 4 = 5. Plus means join.', 'Try a joining story')
  ], 'Act out the story with toys. Keep the first group when the second arrives. Read an equation together only after the object story makes sense.'),
  concept('k-subtract', 'Some leave. Some stay.', [
    card('Begin with the whole', 'Five ducks are resting together.', { type: 'blocks', start: 5, remove: 0 }, 'Start with 5 ducks.'),
    card('A part goes away', 'Two ducks leave. They belong to the part we take away.', { type: 'blocks', start: 5, remove: 2 }, 'Take away 2.'),
    card('Count the part that stays', 'Three ducks remain. Count the ones that stayed, not the ones that left.', frame(3), '5 − 2 = 3.', 'Try a take-away story')
  ], 'Move objects away where the learner can still see the action. Point to the starting whole, the removed part, and the remaining part. A missing-part story can also use the same whole.'),
  concept('k-measure-sort', 'Look for the feature we are comparing', [
    card('Start in the same place', 'Both ribbons start at one left line. The lower ribbon reaches farther.', { type: 'primary', kind: 'length', lengths: [2, 5], labels: ['Top ribbon', 'Bottom ribbon'], unit: 'cubes', orientation: 'horizontal' }, 'Compare endpoints from a shared start.'),
    card('Height begins at the bottom', 'Both towers stand on one baseline. The left tower reaches higher.', { type: 'primary', kind: 'length', lengths: [5, 2], labels: ['Left tower', 'Right tower'], unit: 'cubes', orientation: 'vertical' }, 'The left tower is taller.'),
    card('Sorting uses a named rule', 'Put circles together and triangles together. Count each group.', shapes(['circle', 'circle', 'circle', 'triangle', 'triangle']), '3 circles and 2 triangles.'),
    card('Compare the category counts', 'The circle category has more objects. We compare counts, not the names.', { type: 'data', kind: 'bar', labels: ['Circles', 'Triangles'], values: [3, 2], key: 1, max: 5, title: 'Sorted shape counts' }, 'Each scale step stands for one shape.', 'Try a comparing adventure')
  ], 'Line up real objects before comparing length or height. The drawn cubes are equal visual units, not a claim of formal ruler instruction. Say the sorting rule before grouping.'),
  concept('k-shapes', 'Shape friends can turn and build', [
    card('Trace a flat shape', 'This triangle is flat. Trace its three straight sides and three corners.', shapes(['triangle']), 'A triangle has 3 straight sides.'),
    card('A turn keeps its name', 'Turn the triangle. It still has the same three sides.', shapes(['triangle'], { rotate: true }), 'A turned triangle is still a triangle.'),
    card('A solid takes up space', 'A sphere is like a ball. A circle is flat. These are different shape ideas.', shapes(['sphere', 'circle'], { layout: 'beside' }), 'First: a sphere. Second: a circle.'),
    card('Where are the shapes?', 'The circle is above the square. The square is below the circle.', shapes(['circle', 'square'], { layout: 'above' }), 'Above and below describe positions.'),
    card('Little shapes can join', 'Two equal squares join with full sides touching. Their outside boundary is a longer rectangle.', shapes(['square', 'square'], { compose: 'rectangle', layout: 'beside' }), 'Two squares can compose a rectangle.', 'Try a shape adventure')
  ], 'Find objects and paper cutouts together. Name a shape using its features even after a turn. A square is also a rectangle; choice labels specify a rectangle with two long sides when a unique answer is needed.')
];

const domain = 'https://www.thecorestandards.org/Math/Content/K/';
const unit = (sequence, title, goal, methods, prerequisiteSkills, everydayPractice, standards, domains) => ({
  id: `k-unit-${sequence}`, sequence, title, weeks: 6, goal, methods, prerequisiteSkills, everydayPractice, standards,
  missionIds: kMissions.filter(m => m.unitId === `k-unit-${sequence}`).map(m => m.id), prerequisiteMissionIds: [], reviewMissionIds: [], sourceUrls: domains.map(d => domain + d + '/')
});
export const kUnits = [
  unit(1, 'Little collections and one more', 'Count small collections, connect zero with none, and keep the count when objects move.', ['Give every object exactly one number name.', 'The final count tells the size of the collection.', 'Add one and notice the next count.'], ['Point to an object with a grown-up.'], ['Count spoons, pebbles, or buttons.', 'Move a collection and recount it.'], ['K.CC.A.2', 'K.CC.A.3', 'K.CC.B.4', 'K.CC.B.5'], ['CC']),
  unit(2, 'A full ten and extra friends', 'Build counts through twenty and interpret a teen as ten ones plus extra ones.', ['Recognize a full ten-frame.', 'Keep the group of ten while adding extra ones.', 'Count forward from a known count.'], ['Count a small collection once per object.'], ['Make a ten-frame on paper.', 'Build teen numbers with ten buttons and extras.'], ['K.CC.A.2', 'K.CC.B.5', 'K.NBT.A.1'], ['CC', 'NBT']),
  unit(3, 'Compare counts and find the parts', 'Compare collections and written numerals, split five, and find a missing part of ten.', ['Match one object with one partner.', 'Connect a numeral to its collection.', 'Keep a fixed whole while changing the parts.'], ['Count objects through ten.', 'Connect a numeral with its count.'], ['Share five counters between two bowls.', 'Fill empty ten-frame spaces.'], ['K.CC.C.6', 'K.CC.C.7', 'K.OA.A.3', 'K.OA.A.4'], ['CC', 'OA']),
  unit(4, 'Join, take away, and tell the story', 'Model addition and subtraction stories within ten before reading their number sentences.', ['Keep the first group when another arrives.', 'Separate the starting whole, removed part, and remaining part.', 'Check missing parts by joining them again.'], ['Recognize parts and a whole.', 'Count collections within ten.'], ['Act out guests arriving with toys.', 'Hide a few counters under a cup.'], ['K.OA.A.1', 'K.OA.A.2', 'K.OA.A.3'], ['OA']),
  unit(5, 'Compare, sort, and count', 'Compare length and height directly, then sort objects by shape and compare category counts.', ['Use a shared starting line or bottom baseline.', 'Say the attribute being compared.', 'Name a category rule before sorting.'], ['Notice an object’s beginning and end.', 'Count each sorted group once per object.'], ['Compare two pencil lengths.', 'Sort paper shapes and compare the counts.'], ['K.MD.A.1', 'K.MD.A.2', 'K.MD.B.3'], ['MD']),
  unit(6, 'Shape friends and little builders', 'Name flat and solid shapes, recognize turned shapes, use position words, and compose simple shapes.', ['Trace sides and corners.', 'Keep a shape’s name after a turn.', 'Join whole sides and trace the new outside boundary.'], ['Notice straight and curved boundaries.', 'Explore paper shapes and real solid objects with an adult.'], ['Find a can, ball, and box.', 'Put a paper circle above a square and join paper shapes.'], ['K.G.A.1', 'K.G.A.2', 'K.G.A.3', 'K.G.B.4', 'K.G.B.6'], ['G'])
];
