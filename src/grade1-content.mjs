/* Original adult-guided Grade 1 practice. Three small variations per challenge;
   a flexible study companion, with silent, self-paced controls and choices. */
const C = 'https://www.thecorestandards.org/Math/Content/1/';
const mission = (suffix, title, topicId, unit, conceptKey, standards, goal, prerequisite, workedExample, explainPrompt, reviewPrompt) => ({
  id: `g1y-${suffix}`, title, bandId: 'early', gradeIds: ['1'], topicId, unitId: `g1-unit-${unit}`,
  worldId: ['geometry', 'measuring', 'time'].includes(topicId) ? 'studio' : topicId === 'fractions' ? 'garden' : 'meadow',
  conceptKey, conceptId: conceptKey, standards, sourceIds: [], lessonId: null, minutes: 7, goal, skill: goal,
  teacherNotes: 'Explore together. Point, build, and describe before checking. Pause or repeat whenever helpful; completion records practice.',
  lessonPlan: { goal, prerequisite, workedExample, explainPrompt, reviewPrompt }
});

export const g1Missions = [
  mission('count-forward', 'The next-number trail', 'counting', 1, 'g1-count', ['1.NBT.A.1'], 'Continue a counting sequence from a number other than one.', 'Count a small collection once per object.', 'After 66 come 67, 68, and 69. Start at 66; there is no need to start again at one.', 'What changes when you move to the next number?', 'Start at 78 and say the next three numbers.'),
  mission('teen-builder', 'One ten and a few more', 'place-value', 1, 'g1-tens', ['1.NBT.B.2b'], 'Build teen numbers as one ten and some ones.', 'Count ten objects into a full group.', 'Sixteen is one full bundle of ten and six loose ones: 10 + 6 = 16.', 'Which part is a full ten, and which part is loose ones?', 'Build thirteen with one bundle and loose counters.'),
  mission('bundles-ten', 'The bundle wagon', 'place-value', 1, 'g1-tens', ['1.NBT.B.2a', '1.NBT.B.2c'], 'Count tens as groups containing ten ones each.', 'Make a bundle of ten equal counters.', 'Four tens contain forty ones. The four counts bundles; forty counts the ones inside.', 'What does the bundle count tell us?', 'Draw six bundles of ten and name their total.'),
  mission('read-build120', 'Beyond the hundred hill', 'place-value', 1, 'g1-count', ['1.NBT.A.1'], 'Read and build quantities through one hundred twenty.', 'Recognize a ten as ten ones.', 'One hundred eight is one hundred, zero tens, and eight ones. A zero keeps the empty tens place.', 'How does the model help you read the whole number?', 'Build 117 and say what each place contributes.'),
  mission('count-on', 'A few more fireflies', 'addition', 2, 'g1-add', ['1.OA.C.5', '1.OA.C.6'], 'Count on from a known amount to add a small amount.', 'Keep a starting number in mind.', 'For 5 + 3, keep five and count six, seven, eight. Three new counts give a total of eight.', 'Why can you keep the first group instead of recounting it?', 'Show 9 + 2 by counting on twice.'),
  mission('make-ten', 'Fill the ten-frame picnic', 'addition', 2, 'g1-add', ['1.OA.C.6'], 'Split an addend to make a ten before adding the rest.', 'Know how many more complete a group of ten.', 'For 7 + 6, use three of the six to fill ten. Three remain, so 10 + 3 = 13.', 'How much of the second group fills the first ten?', 'Explain how a full ten helps with 8 + 5.'),
  mission('doubles', 'A matching pair of paws', 'addition', 2, 'g1-add', ['1.OA.B.3', '1.OA.C.6'], 'Use equal addends and a nearby double to add.', 'Combine two small groups.', '4 + 4 is eight. A nearby sum, 4 + 5, is one more: nine.', 'What stays the same when just one addend grows by one?', 'Use a known double to explain 6 + 7.'),
  mission('three-addends', 'Three tiny snack packs', 'addition', 2, 'g1-add', ['1.OA.A.2', '1.OA.B.3'], 'Combine three groups by choosing a useful pair first.', 'Add two small numbers and identify a full ten.', 'In 3 + 5 + 7, put three and seven together to make ten, then add five to reach fifteen.', 'Which two groups would you combine first? Why?', 'Choose a helpful pair in 6 + 2 + 4.'),
  mission('take-away', 'Some berries go home', 'subtraction', 3, 'g1-subtract', ['1.OA.A.1', '1.OA.C.6'], 'Model taking some objects away and count what remains.', 'Count a collection and keep track of removed objects.', 'From nine berries, remove four. Five remain, so 9 − 4 = 5.', 'Which amount names the start, the removed part, and the rest?', 'Use counters to act out 11 − 3.'),
  mission('back-through-ten', 'A ten is a helpful rest stop', 'subtraction', 3, 'g1-subtract', ['1.OA.C.6'], 'Split a subtraction to reach ten before subtracting more.', 'Recognize teen numbers as ten and extra ones.', 'For 14 − 6, remove four to reach ten, then remove two more. Eight remain.', 'How much do you remove before reaching ten?', 'Show how to use ten as a stop in 12 − 5.'),
  mission('related-facts', 'Two parts, one whole', 'subtraction', 3, 'g1-subtract', ['1.OA.B.4', '1.OA.D.8'], 'Find an unknown part using related addition and subtraction.', 'Know that two parts can form a whole.', 'If 7 + 5 = 12, then 12 − 7 = 5 and 12 − 5 = 7. The same two parts stay together.', 'How can addition check the missing part?', 'Find the missing part in 9 + ? = 15.'),
  mission('mystery-start', 'The missing-number mailbox', 'addition', 3, 'g1-subtract', ['1.OA.D.7', '1.OA.D.8'], 'Find unknown starting amounts and compare both sides of an equation.', 'Explain addition as joining and subtraction as taking away.', 'If ? − 4 = 7, the starting amount was eleven: 7 + 4 = 11. An equal sign means both sides have the same value.', 'Which amount is missing, and how can you check both sides?', 'Explain why 5 + 3 = 6 + 2 is true.'),
  mission('compare-tens', 'Which wagon holds more?', 'place-value', 4, 'g1-tens-calculation', ['1.NBT.B.3'], 'Compare two-digit amounts using tens first and ones next.', 'Identify tens and ones in a two-digit number.', '62 is greater than 57 because six tens are more than five tens. For 62 and 68, compare the ones.', 'When do the ones decide the comparison?', 'Compare 46 and 49, then compare 46 and 64.'),
  mission('ten-more-less', 'The ten-step elevator', 'place-value', 4, 'g1-tens-calculation', ['1.NBT.C.5'], 'Find ten more and ten less without recounting every one.', 'Read tens and ones in a two-digit number.', 'Ten more than 43 is 53. Ten less than 43 is 33. The three ones stay the same.', 'Which part changes when one whole ten joins?', 'Describe ten more and ten less than 67.'),
  mission('add-tens-ones', 'More bundles, same loose ones', 'addition', 4, 'g1-tens-calculation', ['1.NBT.C.4'], 'Add tens and ones, including making a new ten.', 'Compose one ten from ten ones.', 'For 36 + 20, add two bundles to the three bundles: 56. For 36 + 7, thirteen ones trade for one ten and three ones: 43.', 'Did you add bundles, loose ones, or both?', 'Build 48 + 5 and explain the new bundle.'),
  mission('subtract-tens', 'Return some bundles', 'subtraction', 4, 'g1-tens-calculation', ['1.NBT.C.6'], 'Subtract whole tens with nonnegative results.', 'Count bundles by tens.', 'Seven tens take away three tens leave four tens: 70 − 30 = 40.', 'Why do we count bundles before naming the number of ones?', 'Build 80 − 50 and name what remains.'),
  mission('cube-length', 'Measure the tiny bridge', 'measuring', 5, 'g1-length-data', ['1.MD.A.2'], 'Measure a length with equal units placed end to end.', 'Count objects once and recognize equal sizes.', 'Five equal cubes touch end to end from one end of a ribbon to the other. Its length is five cube units.', 'Would a gap or overlap change the measurement?', 'Measure a pencil with equal paper squares.'),
  mission('order-lengths', 'Short, middle, and long', 'measuring', 5, 'g1-length-data', ['1.MD.A.1'], 'Compare and order three lengths measured with the same unit.', 'Line up objects at a shared starting point.', 'A four-cube stick is shorter than a six-cube stick; a six-cube stick is shorter than a nine-cube stick.', 'Why do the starting point and unit size matter?', 'Order three ribbons from shortest to longest.'),
  mission('forest-votes', 'Three favorite forest games', 'data', 5, 'g1-length-data', ['1.MD.C.4'], 'Read category counts and find totals and differences.', 'Count objects in a small group.', 'Three votes for tag, five for ball, and two for hoops make ten votes. Ball has two more votes than tag.', 'What does each picture represent?', 'Collect three family choices and compare the category counts.'),
  mission('clock-hours-halves', 'Time for a little adventure', 'time', 5, 'g1-clock', ['1.MD.B.3'], 'Read and set hour and half-hour times.', 'Recognize the numbers one through twelve.', 'At 8:30 the long hand points to six. The short hand is halfway from eight toward nine.', 'Which hand gives hours, and which hand gives minutes?', 'Set a paper clock to 5:00 and then to 5:30.'),
  mission('shape-rules', 'The shape detective club', 'geometry', 6, 'g1-shares-shapes', ['1.G.A.1'], 'Recognize shapes by defining features despite a turn or color change.', 'Trace straight sides and identify corners.', 'A turned triangle is still a triangle because it stays closed and has three straight sides. Its color does not decide its name.', 'Which features must stay for the shape to keep its name?', 'Turn a paper square and describe what stays the same.'),
  mission('shape-compose', 'Put the shape puzzle together', 'geometry', 6, 'g1-shares-shapes', ['1.G.A.2'], 'Compose a new shape from smaller shapes and notice the join.', 'Recognize squares, triangles, and rectangles.', 'Two matching right triangles join along their longest sides to make a square. Two squares join edge to edge to make a rectangle.', 'Where is the join, and what shape outlines the whole?', 'Use two paper squares to make a longer rectangle.'),
  mission('halves', 'A fair share for two', 'fractions', 6, 'g1-shares-shapes', ['1.G.A.3'], 'Describe one of two equal shares as a half.', 'Keep track of one whole and compare piece sizes.', 'Fold one rectangle into two equal parts. Each is a half; both halves together make the whole.', 'Why must the two shares be equal?', 'Fold another paper rectangle into two equal shares in a different way.'),
  mission('quarters', 'A fair share for four', 'fractions', 6, 'g1-shares-shapes', ['1.G.A.3'], 'Describe fourths and compare half and quarter shares of the same whole.', 'Name a half as one of two equal parts.', 'Fold the same-sized whole into four equal parts. Each is a quarter. Four quarters make the whole, and a quarter is smaller than a half.', 'What happens to each share when this whole has more equal parts?', 'Fold matching rectangles into halves and fourths; compare one share of each.')
].map((m, index) => ({ ...m, order: 300 + index }));

const unitSpecs = [
  ['Numbers on the woodland trail', 'Count through 120 and build teen numbers, tens, and ones.', ['Count from a chosen number.', 'Bundle ten ones and read each place.'], ['Count a small collection once per object.'], ['Bundle household counters into tens; read the number together.']],
  ['Joining groups with helpful strategies', 'Count on, make ten, and use doubles to combine small groups.', ['Keep one addend and count on.', 'Make ten or use a known double before adding the rest.'], ['Count and build numbers through twenty.'], ['Join two snack groups; describe a ten and the extra pieces.']],
  ['Taking apart and finding a missing piece', 'Use subtraction, related facts, and equality to find unknown quantities.', ['Name the start, the removed part, and the remainder.', 'Check an unknown with its related addition fact.'], ['Combine two small groups.'], ['Hide a few of twelve counters and find the hidden part.']],
  ['Think in tens', 'Compare and calculate with bundles of ten and loose ones.', ['Compare tens first, then ones when needed.', 'Add or remove complete tens; trade ten ones when needed.'], ['Represent a two-digit number as tens and ones.'], ['Use paper bundles to show ten more and ten less than a chosen number.']],
  ['Lengths, votes, and friendly clocks', 'Use equal length units, interpret three categories, and read hour and half-hour times.', ['Measure from a shared start with equal units and no gaps.', 'Read one vote per symbol; distinguish clock hands by length.'], ['Count a small collection and compare quantities.'], ['Measure three objects with equal cubes; set a paper clock for an everyday event.']],
  ['Shapes and fair shares', 'Build shapes from smaller shapes and describe equal halves and fourths.', ['Name defining sides and corners even after a turn.', 'Join shapes and partition a fixed whole into equal shares.'], ['Recognize common flat shapes and a whole object.'], ['Fold matching paper rectangles into halves and quarters; build shapes with paper pieces.']]
];
export const g1Units = unitSpecs.map(([title, goal, methods, prerequisiteSkills, everydayPractice], index) => ({
  id: `g1-unit-${index + 1}`, title, sequence: index + 1, weeks: 6, goal, methods, prerequisiteSkills, everydayPractice,
  missionIds: g1Missions.filter(m => m.unitId === `g1-unit-${index + 1}`).map(m => m.id),
  prerequisiteMissionIds: [], reviewMissionIds: [],
  standards: [...new Set(g1Missions.filter(m => m.unitId === `g1-unit-${index + 1}`).flatMap(m => m.standards))],
  sourceUrls: [C + (index === 0 || index === 3 ? 'NBT/' : index < 3 ? 'OA/' : index === 4 ? 'MD/' : 'G/')]
}));

const card = (title, body, visual, caption) => ({ title, body, visual, caption, actionLabel: 'See the next little part' });
const concept = (id, title, steps, parentTip) => ({ id, title, bandIds: ['early'], missionIds: g1Missions.filter(m => m.conceptKey === id).map(m => m.id), steps, parentTip });
const ten = count => ({ type: 'primary', kind: 'ten-frame', count, capacity: 20, answerKeys: { value: 'count' } });
const base = (tens, ones, hundreds = 0) => ({ type: 'base-ten', hundreds, tens, ones });
const chart = highlight => ({ type: 'primary', kind: 'number-chart', start: 1, end: 120, highlight });
const shapes = (list, rest = {}) => ({ type: 'primary', kind: 'shapes', shapes: list, ...rest });
const partition = (parts, selected) => ({ type: 'primary', kind: 'partition', parts, selected });
const lengths = values => ({ type: 'primary', kind: 'length', lengths: values, labels: values.map((_, i) => ['Leaf', 'Twig', 'Ribbon'][i]), unit: 'cubes' });
const clock = (hour, minute) => ({ type: 'clock', hour, minute, showDigital: true });

export const g1Concepts = [
  concept('g1-count', 'Every next number has a place', [
    card('Start right here', 'We can begin counting at 85. Find its place in the chart.', chart([85]), 'Start at eighty-five.'),
    card('One more moves one place', 'The next number is 86. It names one more than 85.', chart([85, 86]), '85, then 86.'),
    card('Crossing a new ten', 'After 89 comes 90. Ten ones form the next ten.', chart([89, 90]), '89 + 1 = 90.'),
    card('The trail goes past one hundred', 'After 109 come 110 and 111. Every next number still adds one.', chart([109, 110, 111]), '109, 110, 111.')
  ], 'Point together. Count from a new start instead of always beginning at one.'),
  concept('g1-tens', 'A bundle is ten ones', [
    card('Fill one full ten', 'Ten counters make a full group. We can call that group one ten.', ten(10), '10 ones = 1 ten.'),
    card('A teen has a ten', 'Seventeen has one ten and seven more ones.', base(1, 7), '17 = 10 + 7.'),
    card('Count whole bundles', 'Six tens hold sixty ones. The loose ones place is empty.', base(6, 0), '6 tens = 60 ones.'),
    card('Read both places', 'Six tens and two ones make sixty-two.', base(6, 2), '62 = 60 + 2.')
  ], 'Ask whether the number counts bundles or the ones inside them. Let the child build each name.'),
  concept('g1-add', 'Find a friendly way to join', [
    card('Keep the first group', 'Start with six and add two. Count on: seven, eight.', ten(8), '6 + 2 = 8.'),
    card('A double is two matching groups', 'Five and five are ten. Matching groups can be a helpful fact.', ten(10), '5 + 5 = 10.'),
    card('Fill ten before the rest', 'For 9 + 5, one of the five fills ten. Four remain.', ten(10), '9 + 5 = 10 + 4.'),
    card('A full ten and four more', 'The ten and the four together make fourteen.', ten(14), '10 + 4 = 14.')
  ], 'Act out the split with counters. Keep every counter when moving some to make a full ten.'),
  concept('g1-subtract', 'The whole and its two parts', [
    card('Name the starting whole', 'Fourteen counters are our starting whole.', ten(14), 'Start with 14.'),
    card('Take one part away', 'Five counters leave. Nine remain.', { type: 'count', mode: 'subtract', count: 14, compareCount: 5 }, '14 − 5 = 9.'),
    card('The parts join back', 'The nine remaining and the five removed make fourteen again.', ten(14), '9 + 5 = 14.'),
    card('Missing parts work both ways', 'If nine plus a mystery part makes fourteen, that part is five.', ten(5), '9 + ? = 14; the missing part is 5.')
  ], 'Name what each number counts. Use addition to check a removed part or a missing starting amount.'),
  concept('g1-tens-calculation', 'Change the bundles, keep the value clear', [
    card('Read the starting number', 'Thirty-four is three tens and four ones.', base(3, 4), '34 = 30 + 4.'),
    card('One ten more', 'Add a full ten. Four tens and four ones make forty-four.', base(4, 4), '34 + 10 = 44.'),
    card('Two tens less', 'Remove two tens from forty-four. Two tens and four ones remain.', base(2, 4), '44 − 20 = 24.'),
    card('Compare matching units', 'Twenty-four is less than thirty-four because two tens are fewer than three tens.', { type: 'primary', kind: 'comparison', left: 24, right: 34 }, '24 < 34.')
  ], 'Name tens and ones. Moving one bundle changes the total by ten, rather than by one.'),
  concept('g1-length-data', 'Same units make a fair comparison', [
    card('Begin at the same end', 'These objects line up at one starting point. Equal cubes measure their lengths.', lengths([3, 5, 7]), 'Lengths: 3, 5, and 7 cubes.'),
    card('No gaps and no overlaps', 'Five cubes touch end to end along the middle object. Its length is five cube units.', lengths([5]), 'Count the equal units spanning the whole length.'),
    card('A picture can count a vote', 'Here one picture means one vote. Tag has four votes and ball has six.', { type: 'data', kind: 'picture', labels: ['Tag', 'Ball', 'Hoops'], values: [4, 6, 3], key: 1, max: 7, title: 'Playtime choices' }, 'Key: one picture = one vote.'),
    card('Ask about the difference', 'Ball has two more votes than tag: six take away four leaves two.', { type: 'data', kind: 'bar', labels: ['Tag', 'Ball', 'Hoops'], values: [4, 6, 3], key: 1, max: 7, title: 'The same votes as bars' }, '6 − 4 = 2 more votes.')
  ], 'Use equal-size units and a shared start for length. For graphs, name the key before counting.'),
  concept('g1-clock', 'Two hands, two different jobs', [
    card('Find the short hand', 'At nine o’clock, the short hand points to nine. It tells the hour.', clock(9, 0), '9:00 is nine o’clock.'),
    card('Find the long hand', 'The long hand points to twelve at the start of an hour. Zero minutes have passed.', clock(9, 0), 'Long hand at 12: :00.'),
    card('Half an hour later', 'Thirty minutes is half an hour. The long hand reaches six.', clock(9, 30), '9:30 is half past nine.'),
    card('The short hand moves too', 'At 9:30, the short hand is halfway toward ten. It has not reached ten yet.', clock(9, 30), 'Read the hour already passed.')
  ], 'Use hand length as well as color. Turn the hands together and pause at hours and half-hours.'),
  concept('g1-shares-shapes', 'Shapes can join, and wholes can share', [
    card('Follow the sides', 'A triangle has three straight sides and is closed. Turning it does not change those features.', shapes(['triangle'], { rotate: true }), 'A turned triangle is still a triangle.'),
    card('Join two pieces', 'These matching triangles fit together along their long sides. The whole outline is a square.', shapes(['triangle', 'triangle'], { compose: 'square' }), 'Two pieces make one new shape.'),
    card('Share one whole fairly', 'Split one rectangle into two equal shares. Each share is called a half.', partition(2, 1), 'Two halves make the whole.'),
    card('More equal shares are smaller', 'Split that same-sized rectangle into four equal shares. Each is a quarter, smaller than a half.', partition(4, 1), 'Four quarters make the same whole.')
  ], 'Trace the whole outline after joining. For fair shares, keep the whole size the same and check equal pieces.')
];

const byId = new Map(g1Missions.map(m => [m.id, m]));
const control = (key, label, min, max, initial = min, step = 1) => ({ key, label, min, max, initial, step });
const option = (value, label = value) => ({ value: String(value), label: String(label) });
const digits = n => ({ hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 });

export function g1TaskFor(id, step = 0, seed = 1) {
  if (!byId.has(id)) return null;
  if (!Number.isInteger(step) || step < 0 || step > 2) throw new RangeError('A lesson has three challenges, numbered zero to two.');
  if (!Number.isSafeInteger(seed)) throw new TypeError('The variation seed must be a safe integer.');
  const v = ((seed % 3 - 1) % 3 + 3) % 3;
  const out = details => ({ id: `${id}:${step}:${seed}`, missionId: id, step, kind: ['build', 'practice', 'apply'][step], title: ['Build it together', 'Try another little step', 'Use your new idea'][step], prompt: '', instruction: 'Point, explore, and check when ready.', inputs: [], visual: ten(0), answer: { kind: 'number', label: 'Your build', key: 'count' }, expected: 0, hint: '', explanation: '', why: '', unit: '', ...details });
  const pick = (expected, options, details) => {
    const choices = options.map(o => typeof o === 'object' ? o : option(o));
    const offset = ((seed % choices.length + step) % choices.length + choices.length) % choices.length;
    return out({ answer: { kind: 'choice', label: 'Tap your choice' }, expected: String(expected), choices: [...choices.slice(offset), ...choices.slice(0, offset)], ...details });
  };
  const build = (expected, details, max = 20) => out({ inputs: [control('count', 'Counters', 0, max, expected === 0 ? 1 : 0)], visual: ten(0), expected, ...details });
  const buildPlace = (n, details) => {
    const keys = n >= 100 ? ['hundreds', 'tens', 'ones'] : ['tens', 'ones'], d = digits(n);
    return out({ visual: base(0, 0), inputs: keys.map(key => control(key, { hundreds: 'Hundreds', tens: 'Tens', ones: 'Ones' }[key], 0, key === 'hundreds' ? 1 : 9, n === 0 && key === 'tens' ? 1 : 0)), answer: { kind: 'pair', keys, labels: keys.map(k => ({ hundreds: 'Hundreds', tens: 'Tens', ones: 'Ones' }[k])) }, expected: Object.fromEntries(keys.map(key => [key, d[key]])), ...details });
  };
  if (id === 'g1y-count-forward') {
    const starts = [[37, 58, 98], [48, 79, 108], [69, 89, 118]][v], start = starts[step];
    return pick(start + 1, [start + 1, start, start + 2], { prompt: `The trail starts at ${start}. Which number comes next?`, visual: chart([start]), hint: 'Say one more number after the starting number.', explanation: `After ${start} comes ${start + 1}.`, why: 'Counting can start at any number; the next number is one more.' });
  }
  if (id === 'g1y-teen-builder') {
    const n = [[14, 18, 11], [16, 13, 19], [12, 17, 15]][v][step];
    return buildPlace(n, { prompt: `Build ${n}: one ten and how many loose ones?`, hint: 'Keep one full ten, then build the extra ones.', explanation: `${n} is one ten and ${n - 10} ones.`, why: 'A teen number contains a full group of ten and extra ones.' });
  }
  if (id === 'g1y-bundles-ten') {
    const bundles = [[2, 5, 8], [3, 6, 9], [4, 7, 1]][v][step];
    if (step === 1) return pick(bundles * 10, [bundles * 10, bundles, bundles * 10 + 1], { prompt: `${bundles} full ten-bundles hold how many ones?`, visual: base(bundles, 0), hint: 'Count ten for every full bundle.', explanation: `${bundles} tens = ${bundles * 10} ones.`, why: 'Each bundle stands for ten ones.' });
    return out({ prompt: `Build ${bundles * 10} with full tens.`, visual: base(0, 0), inputs: [control('tens', 'Ten-bundles', 0, 9)], answer: { kind: 'number', key: 'tens', label: 'Ten-bundles' }, expected: bundles, hint: 'Count ten, twenty, thirty as you add each bundle.', explanation: `${bundles} bundles of ten make ${bundles * 10}.`, why: 'The tens digit counts complete bundles.' });
  }
  if (id === 'g1y-read-build120') {
    const n = [[104, 112, 120], [106, 115, 110], [109, 118, 111]][v][step];
    return buildPlace(n, { prompt: `Build ${n} with hundreds, tens, and ones.`, hint: 'A hundred is ten tens. Read the extra tens and ones after it.', explanation: `${n} = 100 + ${digits(n).tens * 10} + ${digits(n).ones}.`, why: 'Place-value groups help us read quantities beyond one hundred.' });
  }
  if (id === 'g1y-count-on') {
    const a = [[6, 8, 11], [7, 9, 12], [8, 10, 13]][v][step], b = [2, 3, 2][step];
    return build(a + b, { prompt: `${a} fireflies are here. ${b} more arrive. Build the total.`, hint: `Keep ${a}; count on ${b} more numbers.`, explanation: `${a} + ${b} = ${a + b}. The new group adds ${b}.`, why: 'Counting on keeps the first amount instead of starting over.' });
  }
  if (id === 'g1y-make-ten') {
    const a = [8, 9, 7][v], b = [5, 4, 6][v];
    if (step === 0) return build(10 - a, { prompt: `We have ${a}. Add counters in this tray to show how many more fill ten.`, hint: `Count from ${a} up to ten.`, explanation: `${a} + ${10 - a} = 10.`, why: 'A ten-frame makes a helpful full group visible.' }, 10);
    if (step === 1) return build(b - (10 - a), { prompt: `Use ${10 - a} from a group of ${b} to fill ten. Build the part left from that group.`, hint: `${b} take away ${10 - a}.`, explanation: `${b} − ${10 - a} = ${b - (10 - a)} left to add after ten.`, why: 'Splitting an addend keeps all its counters.' }, 10);
    return build(a + b, { prompt: `Now build the total: ${a} + ${b}.`, hint: `Use ten and ${b - (10 - a)} more.`, explanation: `${a} + ${b} = 10 + ${b - (10 - a)} = ${a + b}.`, why: 'Making ten changes the grouping without changing the total.' });
  }
  if (id === 'g1y-doubles') {
    const a = [3, 5, 6][v], b = step === 0 ? a : a + 1;
    if (step === 2) return pick('one-more', [option('one-more', 'One more'), option('same', 'The same'), option('two-more', 'Two more')], { prompt: `How does ${a} + ${a + 1} compare with ${a} + ${a}?`, visual: ten(2 * a + 1), hint: 'Only one group gained one counter.', explanation: `${a} + ${a + 1} is one more than ${a} + ${a}.`, why: 'A nearby double can help find a new sum.' });
    return build(a + b, { prompt: step === 0 ? `Build the double: ${a} + ${a}.` : `Use that double to build ${a} + ${a + 1}.`, hint: step === 0 ? 'Join two matching groups.' : 'Use the double, then add one more.', explanation: `${a} + ${b} = ${a + b}.`, why: 'Known equal groups help us find nearby sums.' });
  }
  if (id === 'g1y-three-addends') {
    const a = [4, 3, 2][v], b = [3, 4, 5][v], c = 10 - a;
    if (step === 0) return pick('outside', [option('outside', `${a} and ${c}`), option('first', `${a} and ${b}`), option('last', `${b} and ${c}`)], { prompt: `For ${a} + ${b} + ${c}, which pair makes ten?`, visual: ten(10), hint: 'Look for two groups that fill a ten.', explanation: `${a} + ${c} = 10.`, why: 'We may regroup addends while keeping every item.' });
    if (step === 1) return build(10 + b, { prompt: `The friendly pair makes ten. Add the other ${b}. Build the total.`, hint: `Ten and ${b} more.`, explanation: `${a} + ${b} + ${c} = 10 + ${b} = ${10 + b}.`, why: 'Regrouping three addends can make a sum easier to see.' });
    return build(10 + b + 1, { prompt: `One more snack joins the ${10 + b}. Build the new total.`, hint: 'The total grows by exactly one.', explanation: `${10 + b} + 1 = ${11 + b}.`, why: 'A new item changes the whole by one.' });
  }
  if (id === 'g1y-take-away') {
    const a = [[10, 12, 15], [11, 13, 16], [12, 14, 17]][v][step], b = [3, 5, 6][step];
    return out({ prompt: `${a} berries start here. Take away ${b}, then count the rest.`, visual: { type: 'count', mode: 'subtract', count: a, compareCount: 0 }, inputs: [control('compareCount', 'Berries taken away', 0, a)], answer: { kind: 'number', key: 'compareCount', label: 'Berries taken away' }, expected: b, hint: `Remove exactly ${b}; then count what remains.`, explanation: `You removed ${b}. ${a} − ${b} = ${a - b} berries remain.`, why: 'Removing changes the collection; the remaining objects are the difference.', instruction: `Use + to remove berries, then check after ${b} have left.` });
  }
  if (id === 'g1y-back-through-ten') {
    const a = [13, 14, 15][v], b = [5, 6, 7][v], first = a - 10;
    return build([first, b - first, a - b][step], { prompt: [`From ${a}, how many must leave to reach ten? Build that amount.`, `You removed ${first} of the ${b}. How many more must leave?`, `Finish ${a} − ${b}. Build how many remain.`][step], hint: ['Find the extra ones beyond ten.', `Find ${b} − ${first}.`, `From ten, remove ${b - first} more.`][step], explanation: `${a} − ${b} = ${a} − ${first} − ${b - first} = ${a - b}.`, why: 'A helpful stop at ten breaks the removal into two clear parts.' });
  }
  if (id === 'g1y-related-facts') {
    const a = [6, 7, 8][v], b = [5, 4, 6][v], whole = a + b, answer = [b, a, b][step];
    return build(answer, { prompt: [`${a} + ? = ${whole}. Build the missing part.`, `${whole} − ${b} = ?. Build what remains.`, `${whole} − ? = ${a}. Build the part that left.`][step], hint: 'The whole has the same two parts in each fact.', explanation: `${a} + ${b} = ${whole}; ${whole} − ${a} = ${b}; ${whole} − ${b} = ${a}.`, why: 'Addition and subtraction describe the same whole and parts.' });
  }
  if (id === 'g1y-mystery-start') {
    const a = [5, 6, 7][v], b = [4, 3, 5][v];
    if (step === 0) return build(a + b, { prompt: `? − ${b} = ${a}. Build how many were here at the start.`, hint: `Put the ${b} that left back with the ${a}.`, explanation: `${a + b} − ${b} = ${a}. The start was ${a + b}.`, why: 'An unknown starting quantity includes both the removed and remaining parts.' });
    if (step === 1) return build(a, { prompt: `? + ${b} = ${a + b}. Build the missing starting group.`, hint: `Remove ${b} from the whole ${a + b}.`, explanation: `${a} + ${b} = ${a + b}.`, why: 'A missing addend can be found by taking the known part from the whole.' });
    return pick('equal', [option('equal', 'Yes, both sides match'), option('different', 'No, they are different')], { prompt: `Does ${a} + ${b} = ${a + 1} + ${b - 1}?`, visual: { type: 'primary', kind: 'comparison', left: a + b, right: a + 1 + b - 1 }, hint: 'Find the value of each side, not just the next symbol.', explanation: `Both sides equal ${a + b}. The equal sign means the values match.`, why: 'Equality is a relationship between two equal values.' });
  }
  if (id === 'g1y-compare-tens') {
    const pairs = [[[42, 35], [46, 49], [53, 53]], [[64, 58], [72, 75], [81, 81]], [[87, 79], [33, 38], [26, 26]]][v], [a, b] = pairs[step], result = a > b ? 'greater' : a < b ? 'less' : 'equal';
    return pick(result, [option('greater', 'Greater than >'), option('less', 'Less than <'), option('equal', 'Equal to =')], { prompt: `Compare ${a} with ${b}.`, visual: { type: 'primary', kind: 'comparison', left: a, right: b }, hint: 'Compare tens first. If they match, compare ones.', explanation: `${a} ${result === 'greater' ? '>' : result === 'less' ? '<' : '='} ${b}. Compare the value of each place.`, why: 'A complete extra ten outweighs differences among the loose ones.' });
  }
  if (id === 'g1y-ten-more-less') {
    const n = [36, 54, 67][v], answer = step === 1 ? n - 10 : n + (step === 0 ? 10 : 20);
    return buildPlace(answer, { prompt: step === 1 ? `Build ten less than ${n}.` : `Build ${step === 0 ? 'ten' : 'twenty'} more than ${n}.`, hint: 'Change whole ten-bundles; keep the loose ones.', explanation: `${n} ${step === 1 ? '− 10' : step === 0 ? '+ 10' : '+ 20'} = ${answer}. The ones stay ${n % 10}.`, why: 'Adding or removing a full ten changes the tens count.' });
  }
  if (id === 'g1y-add-tens-ones') {
    const a = [27, 36, 48][v], b = [20, 3, 6][step];
    return buildPlace(a + b, { prompt: `Build the total: ${a} + ${b}.`, hint: step === 0 ? 'Add two full bundles of ten.' : 'Join the loose ones; trade ten ones for one ten if needed.', explanation: `${a} + ${b} = ${a + b}: ${Math.floor((a + b) / 10)} tens and ${(a + b) % 10} ones.`, why: 'Tens join tens, ones join ones, and a full group of ten ones becomes one ten.' });
  }
  if (id === 'g1y-subtract-tens') {
    const a = [[6, 8, 4], [7, 9, 5], [8, 6, 3]][v][step], b = [2, 5, 4][step];
    const removed = Math.min(a, b), remain = a - removed;
    return buildPlace(remain * 10, { prompt: `Build what remains: ${a * 10} − ${removed * 10}.`, hint: `Think ${a} bundles take away ${removed} bundles.`, explanation: `${a} tens − ${removed} tens = ${remain} tens, so ${a * 10} − ${removed * 10} = ${remain * 10}.`, why: 'We subtract equal-size place-value units and then name their value.' });
  }
  if (id === 'g1y-cube-length') {
    const n = [6, 7, 8][v];
    if (step === 0) return pick(n, [n, n - 1, n + 1], { prompt: 'How many cube units long is this bridge?', visual: lengths([n]), hint: 'Count every equal unit from one end to the other.', explanation: `The bridge spans ${n} equal cubes, so its length is ${n} cube units.`, why: 'Length counts equal units spanning the object without gaps or overlaps.' });
    if (step === 1) return pick('touch', [option('touch', 'Touching end to end'), option('gaps', 'With gaps'), option('overlap', 'Overlapping')], { prompt: 'How should equal cubes line up to measure a length?', visual: lengths([n]), hint: 'Every part of the length needs to be counted exactly once.', explanation: 'Place equal units touching end to end, without gaps or overlaps.', why: 'A fair measurement covers the whole length exactly once.' });
    return pick(n + 2, [n + 2, n + 1, n - 2], { prompt: `A ${n}-cube bridge gets two more equal cubes at its end. How long now?`, visual: lengths([n + 2]), hint: `Count on two from ${n}.`, explanation: `${n} + 2 = ${n + 2} cube units.`, why: 'Adding equal units at the end extends a length by that many units.' });
  }
  if (id === 'g1y-order-lengths') {
    const n = [3, 4, 5][v], values = [n, n + 4, n + 2], correct = ['Leaf', 'Ribbon', 'Twig'][step];
    return pick(correct, ['Leaf', 'Twig', 'Ribbon'], { prompt: ['Which object is shortest?', 'Which object has the middle length?', 'Which object is longest?'][step], visual: lengths(values), hint: 'All objects start together and use the same cube size.', explanation: `Leaf: ${n}; Ribbon: ${n + 2}; Twig: ${n + 4} cube units. ${correct} answers this question.`, why: 'Shared units and a shared start make lengths comparable.' });
  }
  if (id === 'g1y-forest-votes') {
    const values = [[3, 5, 2], [4, 6, 3], [5, 7, 4]][v], expected = [values[1], values[1] - values[0], values.reduce((a, b) => a + b, 0)][step];
    return pick(expected, [expected, expected + 1, expected === 0 ? 2 : expected - 1], { prompt: ['How many votes did ball get?', 'How many more votes did ball get than tag?', 'How many votes were cast altogether?'][step], visual: { type: 'data', kind: step === 1 ? 'bar' : 'picture', labels: ['Tag', 'Ball', 'Hoops'], values, key: 1, max: 8, title: 'Forest game votes' }, hint: ['Each picture represents one vote.', 'Find the difference between ball and tag.', 'Combine all three category counts.'][step], explanation: step === 0 ? `Ball has ${values[1]} votes.` : step === 1 ? `${values[1]} − ${values[0]} = ${expected} more votes.` : `${values.join(' + ')} = ${expected} votes in all.`, why: 'The graph records quantities in three named categories.' });
  }
  if (id === 'g1y-clock-hours-halves') {
    const hour = [4, 7, 10][v];
    if (step === 0) return out({ prompt: `Set the clock to ${hour} o’clock.`, visual: { type: 'clock', hour: 1, minute: 0 }, inputs: [control('hour', 'Hour hand', 1, 12, 1)], answer: { kind: 'number', key: 'hour', label: 'Hour' }, expected: hour, hint: 'At o’clock, the long hand stays at twelve.', explanation: `${hour}:00 has the short hand at ${hour} and the long hand at twelve.`, why: 'The short hand names the hour; the long hand names the minutes.' });
    if (step === 1) return pick(`${hour}:30`, [`${hour}:30`, `${hour}:00`, `${hour + 1}:30`], { prompt: 'What time do these hands show?', visual: { type: 'clock', hour, minute: 30 }, hint: 'Long hand at six means thirty minutes. Read the hour already passed.', explanation: `The clock shows ${hour}:30, half past ${hour}.`, why: 'Half an hour moves the minute hand halfway around and the hour hand halfway onward.' });
    return out({ prompt: `Set the clock to half past ${hour + 1}.`, visual: { type: 'clock', hour: 1, minute: 0, targetHour: hour + 1, targetMinute: 30 }, inputs: [control('hour', 'Hour', 1, 12, 1), control('minute', 'Minutes', 0, 30, 0, 30)], answer: { kind: 'pair', keys: ['hour', 'minute'], labels: ['Hour', 'Minutes'] }, expected: { hour: hour + 1, minute: 30 }, hint: 'Choose the hour already passed, then thirty minutes.', explanation: `Half past ${hour + 1} is ${hour + 1}:30.`, why: 'Both hands move as time passes.' });
  }
  if (id === 'g1y-shape-rules') {
    if (step === 0) return pick('3', ['3', '4', '6'], { prompt: 'How many straight sides does this triangle have?', visual: shapes(['triangle']), hint: 'Trace the whole closed boundary once.', explanation: 'Three straight sides and a closed outline define a triangle.', why: 'Defining features tell us the shape family.' });
    if (step === 1) return pick('triangle', ['triangle', 'square', 'circle'], { prompt: 'We turned it. What shape is it now?', visual: shapes(['triangle'], { rotate: true }), hint: 'A turn does not change its sides.', explanation: 'It is still a triangle: three straight sides and a closed outline.', why: 'Direction and color do not define a triangle.' });
    return pick('sides', [option('sides', 'Four straight sides'), option('color', 'Its color'), option('direction', 'Which way it faces')], { prompt: 'Which feature helps define this square?', visual: shapes(['square'], { rotate: v !== 0 }), hint: 'Think about sides and corners, rather than the paint.', explanation: 'A square has four equal straight sides and four square corners. Color and direction can change.', why: 'Shape names depend on defining sides and corners.' });
  }
  if (id === 'g1y-shape-compose') {
    if (step === 0) return pick('square', ['square', 'triangle', 'circle'], { prompt: 'Two matching triangles join. What is the whole outline?', visual: shapes(['triangle', 'triangle'], { compose: 'square' }), hint: 'Follow the outside boundary; the join is inside.', explanation: 'These two matching right triangles join to make a square.', why: 'Smaller shapes can compose a different whole shape.' });
    if (step === 1) return pick('rectangle', ['rectangle', 'triangle', 'hexagon'], { prompt: 'Two squares join along a full side. What whole do they make?', visual: shapes(['square', 'square'], { compose: 'rectangle' }), hint: 'Trace the outside edges of both pieces together.', explanation: 'The two equal squares make a longer rectangle.', why: 'The outside boundary defines the new whole.' });
    return pick('2', ['1', '2', '4'], { prompt: 'How many square pieces make this rectangle?', visual: shapes(['square', 'square'], { compose: 'rectangle' }), hint: 'Use the visible join to find the original pieces.', explanation: 'Two square pieces compose the whole rectangle.', why: 'We can describe a composite shape as a whole and as its parts.' });
  }
  if (id === 'g1y-halves' || id === 'g1y-quarters') {
    const parts = id.endsWith('halves') ? 2 : 4, name = parts === 2 ? 'half' : 'quarter';
    if (step === 0) return out({ prompt: `Shade one ${name} of this whole.`, visual: partition(parts, 0), inputs: [control('selected', 'Equal shares shaded', 0, parts)], answer: { kind: 'number', key: 'selected', label: 'Equal shares shaded' }, expected: 1, hint: `One ${name} is one of ${parts} equal shares.`, explanation: `One shaded share out of ${parts} equal shares is one ${name}.`, why: 'Equal shares must have the same size within a fixed whole.' });
    if (step === 1) return out({ prompt: `Shade all the ${parts === 2 ? 'halves' : 'quarters'} to make one whole.`, visual: partition(parts, 0), inputs: [control('selected', 'Equal shares shaded', 0, parts)], answer: { kind: 'number', key: 'selected', label: 'Equal shares shaded' }, expected: parts, hint: 'The whole includes every equal share.', explanation: `${parts} ${parts === 2 ? 'halves' : 'quarters'} make one whole.`, why: 'The number of equal parts describes how the whole was partitioned.' });
    return pick(parts === 2 ? 'equal' : 'smaller', parts === 2 ? [option('equal', 'The shares must be equal'), option('any', 'Any two pieces work')] : [option('smaller', 'A quarter is smaller'), option('larger', 'A quarter is larger'), option('same', 'They are the same size')], { prompt: parts === 2 ? 'What makes two shares halves of a whole?' : 'For the same-sized whole, compare one quarter with one half.', visual: partition(parts, 1), hint: parts === 2 ? 'Fair halves share the whole equally.' : 'More equal shares in the same whole make each share smaller.', explanation: parts === 2 ? 'Halves are two equal shares of one whole.' : 'One quarter is smaller than one half of the same-sized whole.', why: 'The whole stays fixed when comparing its equal shares.' });
  }
  throw new Error(`Missing original Grade 1 lesson: ${id}`);
}
