import { primaryMissions, primaryConcepts } from './primary-content.mjs';
import { upperMissions, upperConcepts } from './upper-content.mjs';
/* Short teaching sequences shown before practice. Examples are separate from the
   challenge targets. Seeing these cards is participation, not evidence of mastery. */
import { extraMissions } from './content-expansion.mjs';
import { yearMissions } from './grade3-year-content.mjs';
import { yearConcepts } from './year-concepts.mjs';
const card = (title, body, visual, caption, actionLabel = 'See the next step') => ({ title, body, visual, caption, actionLabel });
const make = (id, title, bandIds, missionIds, steps, parentTip) => ({ id, title, bandIds, missionIds, steps, parentTip });
const count = n => ({ type: 'count', mode: 'count', count: n });
const compare = (left, right) => ({ type: 'count', mode: 'compare', count: left, compareCount: right });
const array = (rows, columns) => ({ type: 'array', rows, columns });
const fraction = (parts, selected, rest = {}) => ({ type: 'fraction', parts, selected, ...rest });
const room = (length, width, height = 1, mode = 'area') => ({ type: 'room', length, width, height, mode });
const garden = (blue, yellow, ratioBlue = 2, ratioYellow = 3) => ({ type: 'garden', mode: 'ratio', blue, yellow, ratioBlue, ratioYellow });
const rate = (items, unitRate) => ({ type: 'garden', mode: 'rate', items, rate: unitRate, cost: items * unitRate, blue: 0, yellow: 0 });
const clock = (hour, minute = 0) => ({ type: 'clock', hour, minute, showDigital: true });
const balance = (a, b, c, x) => ({ type: 'equality', a, b, c, x });
const line = (a, b, markerX = 0) => ({ type: 'function', family: 'linear', a, b, xmin: -2, xmax: 6, markerX });
const numberLine = (start, end, moves) => ({ type: 'number-line', min: -6, max: 6, start, end, moves });
const pattern = (items, mode = 'sequence') => ({ type: 'pattern', items, missingIndex: -1, mode });
const little = ['pre-k', 'early'];

export const concepts = [
  make('counting', 'What does a number tell us?', ['pre-k'], ['meadow-count'], [
    card('One thing, one count', 'Touch this one acorn. Count it once: one.', count(1), 'One acorn. One count.'),
    card('Give each thing a turn', 'Now there are two. Touch one, then the other: one, two.', count(2), 'Every acorn gets exactly one count.'),
    card('The last count tells how many', 'Count these three: one, two, three. Three tells how many acorns are in the whole little group.', count(3), 'Three acorns altogether.', 'Try counting together')
  ], 'Point with your child. Go slowly enough that each object gets one touch and one count. The last count names the total.'),
  make('zero', 'Zero means none here', little, [], [
    card('A small collection', 'Here are two acorns.', count(2), 'There are two.'),
    card('One is left', 'Imagine taking one away. One acorn remains.', count(1), 'There is one.'),
    card('An empty collection', 'Take the last one away. No acorns remain. We use the number zero for an empty collection.', count(0), 'Zero acorns: none in this collection.', 'Try an empty collection')
  ], 'Use an actual empty plate beside a plate with one object. Zero describes the empty collection; it is a number too.'),
  make('compare', 'More, fewer, or the same?', ['pre-k'], ['meadow-compare'], [
    card('Match one with one', 'Give every block on the left a partner on the right.', compare(2, 2), 'Two pairs. Neither basket has an extra block.'),
    card('An extra tells us more', 'This time the right basket has one block without a partner. The right basket has more.', compare(2, 3), 'Three is more than two. Two is fewer than three.'),
    card('Look at the objects, not the space', 'The left basket now has two extra blocks after matching. It has more, even if we spread the other blocks out.', compare(4, 2), 'Four is more than two.', 'Try matching pairs')
  ], 'Match real objects side by side. A longer spread-out row need not contain more objects.'),
  make('sorting', 'Put things with a shared feature together', ['pre-k', 'early'], [], [
    card('Notice a feature', 'Some of these shapes are round. Some have corners.', pattern(['circle', 'square', 'circle', 'triangle'], 'sort'), 'Look at shape, rather than color or size.'),
    card('Choose one sorting rule', 'Our rule is “circles together.” Both circles belong in the same group.', pattern(['circle', 'circle', 'square', 'triangle'], 'sort'), 'The rule stays the same while we sort.'),
    card('A different rule can work too', 'We could instead group shapes with straight sides. Say or point to the rule before sorting.', pattern(['square', 'triangle', 'circle', 'circle'], 'sort'), 'A square and a triangle both have straight sides.', 'Try one sorting rule')
  ], 'Ask your child to show a feature, then keep that same rule. There can be several sensible ways to sort the same collection.'),
  make('shapes', 'Meet the shapes', ['pre-k'], ['meadow-shapes'], [
    card('Round all the way around', 'A circle has a curved edge and no corners.', { type: 'shapes', target: 'circle', shapes: ['circle'] }, 'Circle: no straight sides or corners.'),
    card('Three straight sides', 'A triangle has three straight sides and three corners. Turning it does not change that.', { type: 'shapes', target: 'triangle', shapes: ['triangle'] }, 'Triangle: three sides and three corners.'),
    card('Four equal straight sides', 'A square has four equal straight sides and four square corners.', { type: 'shapes', target: 'square', shapes: ['square'] }, 'Square: four equal sides and four right angles.', 'Try matching a shape')
  ], 'Trace edges together. Show the same shape turned around or at another size so matching is about its features.'),
  make('patterns', 'A pattern has a rule', ['pre-k', 'early'], [], [
    card('Notice what repeats', 'Circle, square. Circle, square. These two shapes repeat in the same order.', pattern(['circle', 'square', 'circle', 'square']), 'The repeating unit is circle, square.'),
    card('Keep the whole little unit', 'After another circle, the next shape is a square. We keep the same order.', pattern(['circle', 'square', 'circle', 'square', 'circle', 'square']), 'Copy the repeating unit, rather than guessing one shape.'),
    card('Patterns can have a longer unit', 'Here the repeated unit is circle, circle, triangle.', pattern(['circle', 'circle', 'triangle', 'circle', 'circle', 'triangle']), 'Notice the full unit before continuing.', 'Try a repeating rule')
  ], 'Use claps or actual objects if useful. Let your child copy one complete repeating unit before predicting a missing object.'),
  make('addition', 'Adding means combining', ['early'], ['meadow-add'], [
    card('Start with a group', 'There are two objects in this group.', count(2), 'We start with two.'),
    card('One more joins', 'One new object joins the two. Nothing leaves. The combined group has three objects.', { type: 'count', mode: 'add', count: 2, compareCount: 1, answerCount: 3 }, 'Two and one more make three.'),
    card('Connect the picture to the marks', 'We write 2 + 1 = 3. The plus sign means combine. The equals sign says both sides name the same amount.', count(3), '2 + 1 = 3.', 'Try building a combined group')
  ], 'Physically bring two groups together. Count every object once, or start at the first total and count on.'),
  make('subtraction', 'Taking away leaves a smaller group', ['early'], ['meadow-subtract'], [
    card('Start with the whole group', 'There are five objects before anyone takes a share.', count(5), 'Start with five.'),
    card('Two leave this group', 'Take two of those five away. Count only the objects that remain.', { type: 'count', mode: 'subtract', count: 5, compareCount: 2, answerCount: 3 }, 'Five take away two leaves three.'),
    card('Name what remains', 'We write 5 − 2 = 3. The minus sign shows the amount taken away in this example.', count(3), 'Three remain from the original five.', 'Try building the remaining group')
  ], 'Remove objects from the original collection, rather than making a second collection of crossed-out objects. Count the ones still there.'),
  make('missing-parts', 'A whole can have a hidden part', ['early'], [], [
    card('Make the whole', 'Here are five objects altogether.', count(5), 'The whole collection is five.'),
    card('Know one part', 'Two are in one group. Three are in the other. Both parts together still make five.', { type: 'count', mode: 'add', count: 2, compareCount: 3, answerCount: 5 }, '2 + 3 = 5.'),
    card('Find the hidden part', 'If we know the whole is five and one part is two, the hidden part is three. We can count on from two to five.', { type: 'count', mode: 'subtract', count: 5, compareCount: 2, answerCount: 3 }, '5 − 2 = 3 finds the missing part.', 'Try a missing part')
  ], 'Cover part of a small collection. Keep the total visible as a number card and help your child connect the visible and hidden parts.'),
  make('make-ten', 'Ten can be built from two parts', ['early'], [], [
    card('See ten places', 'This frame has ten places: two rows of five.', array(2, 5), 'There are ten places altogether.'),
    card('Start with six', 'Six objects fill six of the ten places. Four places remain empty.', fraction(10, 6, { emphasize: 'equal-parts' }), 'Six filled places and four empty places make ten.'),
    card('Use ten as a helpful whole', 'We can write 6 + 4 = 10. Knowing the missing part helps us combine numbers.', fraction(10, 10), '6 + 4 = 10, and 10 − 6 = 4.', 'Try making ten')
  ], 'Use a ten-frame or two rows of five objects. Let empty places be visible; avoid introducing a timer.'),
  make('place-value', 'A ten is a bundle of ten ones', ['early', 'elementary'], ['meadow-tens'], [
    card('Bundle ten ones', 'One blue rod contains ten little blocks. We can count it as one ten.', { type: 'base-ten', tens: 1, ones: 0 }, 'One ten has the same value as ten ones.'),
    card('Add loose ones', 'One ten and three extra ones make thirteen: 10 + 3 = 13.', { type: 'base-ten', tens: 1, ones: 3 }, 'The 1 in 13 means one ten. The 3 means three ones.'),
    card('Each position has a value', 'Two tens and three ones make twenty-three: 20 + 3 = 23.', { type: 'base-ten', tens: 2, ones: 3 }, '23 = 2 tens + 3 ones.', 'Try building tens and ones')
  ], 'Point to one rod and count its ten parts before treating a rod as a bundle. Read 23 as two tens and three ones.'),
  make('clock-hours', 'Two hands tell different parts of the time', ['early'], ['clock-hours'], [
    card('Meet the hands', 'The short hand shows the hour. The long hand shows minutes. At 12:00, both point to 12.', clock(12), 'A full turn of the minute hand takes sixty minutes.'),
    card('On the hour', 'At 3:00, the short hand points to 3. The long hand points to 12 because zero minutes have passed in this hour.', clock(3), '3:00 means three o’clock.'),
    card('Follow the short hand', 'At 7:00, the short hand points to 7. The long hand is still at 12.', clock(7), 'First read the hour, then the minutes.', 'Try a whole-hour clock')
  ], 'Distinguish the hands by length as well as color. These clocks do not specify morning or afternoon.'),
  make('clock-halves', 'Half an hour is thirty minutes', ['early'], ['clock-halves'], [
    card('Start at an hour', 'At 3:00, the long hand starts at 12 and the short hand points to 3.', clock(3, 0), 'An hour contains sixty minutes.'),
    card('Halfway around', 'Thirty minutes is half of sixty. At 3:30, the long hand points to 6 and the short hand is halfway from 3 to 4.', clock(3, 30), '3:30 is half past three.'),
    card('Finish the full turn', 'After sixty minutes, a new hour starts. The long hand returns to 12 and the short hand reaches 4.', clock(4, 0), '3:00 to 4:00 is one hour.', 'Try a half-hour clock')
  ], 'Notice that the hour hand moves gradually. At half past three it should be between 3 and 4, not fixed exactly on 3.'),
  make('clock-quarters', 'A quarter of an hour is fifteen minutes', ['early'], ['clock-quarters'], [
    card('An hour has four quarters', 'Sixty minutes split into four equal parts gives fifteen minutes in each part.', clock(3, 0), '60 ÷ 4 = 15.'),
    card('One quarter past', 'At 3:15, fifteen minutes have passed since three. The long hand points to 3.', clock(3, 15), '3:15 is a quarter past three.'),
    card('Three quarters past', 'At 3:45, forty-five minutes have passed. Fifteen minutes remain until four.', clock(3, 45), '3:45 is a quarter to four.'),
    card('The hour hand moves too', 'At 4:00 the hour is complete. Both hands moved during the hour, at different speeds.', clock(4, 0), 'One full minute-hand turn advances the hour hand by one hour.', 'Try quarter-hour times')
  ], 'Point to each quarter of the clock face. Count 15, 30, 45, 60 while noticing where the short hand moves.'),
  make('multiplication', 'Multiplication describes equal groups', ['elementary'], ['meadow-groups', 'meadow-arrays'], [
    card('One equal group', 'One row holds three objects. Every row in this example will have the same number.', array(1, 3), 'One group of three.'),
    card('Two groups of three', 'Two equal rows hold three objects each. Count 3 + 3 to find six.', array(2, 3), 'Two groups of three make six.'),
    card('Connect groups and multiplication', 'We write 2 × 3 = 6. Two is the number of rows; three is the number in each row.', array(2, 3), 'An array makes both group counts visible.', 'Try an equal-group model')
  ], 'Keep “how many groups?” separate from “how many in each group?” Let the learner point to one complete group.'),
  make('division', 'Division shares a total into equal groups', ['elementary'], [], [
    card('Start with twelve', 'There are twelve objects to share.', array(1, 12), 'The whole collection contains twelve.'),
    card('Choose three equal groups', 'Share the objects among three rows so every row gets the same number.', array(3, 4), 'Three equal groups must use all twelve objects.'),
    card('Count each group', 'Each row contains four. We write 12 ÷ 3 = 4 because 3 × 4 = 12.', array(3, 4), 'Division and multiplication describe the same equal groups.', 'Try sharing equally')
  ], 'Use counters when helpful. Show that equal groups contain the same number and that no objects were lost.'),
  make('fractions', 'What is a fraction?', ['elementary'], ['meadow-fractions'], [
    card('Start with one whole', 'This entire bar is one whole. Keep that same whole in mind as we split it.', fraction(1, 0, { emphasize: 'whole' }), 'One whole bar. We have not selected any part yet.'),
    card('Split the whole into equal parts', 'We split the same bar into eight equal-sized parts. Each part is one eighth of the whole.', fraction(8, 0, { emphasize: 'equal-parts', animate: 'split' }), 'Eight equal parts still make exactly one whole.'),
    card('Select three of those parts', 'Now select three of the eight equal parts. We have three eighths of the whole.', fraction(8, 3, { emphasize: 'selected', animate: 'select' }), 'Three selected parts. Eight equal parts in the whole.'),
    card('Write what the picture shows', 'We write 3/8. The top number, 3, counts selected parts. The bottom number, 8, counts all equal parts in this whole.', fraction(8, 3, { showNotation: true, numeratorLabel: 'parts selected', denominatorLabel: 'equal parts in the whole', emphasize: 'notation' }), 'Read 3/8 as “three eighths.” The top counts selected parts; the bottom counts all equal parts.'),
    card('Why equal-sized parts matter', 'These four pieces have different sizes. Three selected pieces do not mean three quarters. Counting pieces works for fractions only when the parts are equal-sized.', fraction(4, 3, { partWidths: [1, 1, 2, 4], equalParts: false, emphasize: 'unequal-parts', showNotation: false }), 'Three of these unequal pieces cover half the bar, not three quarters.'),
    card('Return to our three eighths', 'Here is the same whole split equally again. Three of eight equal parts are selected: 3/8. You can count the parts before trying a challenge.', fraction(8, 3, { showNotation: true, numeratorLabel: 'parts selected', denominatorLabel: 'equal parts in the whole', emphasize: 'notation' }), 'The whole, the equal parts, and the selected parts each have a job.', 'Try fractions with help available')
  ], 'Before asking for a fraction answer, point to the whole, count all equal parts, then count selected parts. Write the selected count above the total count. Revisit this picture whenever needed.'),
  make('fraction-equivalence', 'Different fractions can name the same amount', ['elementary'], [], [
    card('Begin with one half', 'One of two equal parts is selected. That is 1/2 of this whole.', fraction(2, 1, { showNotation: true }), 'Keep the size of the whole fixed.'),
    card('Split every part in two', 'The same whole now has four equal parts. Two are selected. The selected amount did not change.', fraction(4, 2, { showNotation: true, animate: 'split' }), '1/2 = 2/4.'),
    card('Split once more', 'There are now eight equal parts and four are selected. The selected amount is still half the same whole.', fraction(8, 4, { showNotation: true, animate: 'split' }), '1/2 = 2/4 = 4/8. Both counts scale together.', 'Try naming the same amount')
  ], 'Use equal-sized wholes for comparisons. If the whole changes size, matching fraction names need not represent the same physical amount.'),
  make('area', 'Area counts the squares inside', ['elementary'], ['room-floor'], [
    card('One row covers three squares', 'These three equal unit squares cover one row. There are no gaps or overlaps.', room(3, 1), 'One square unit is a one-unit-by-one-unit square.'),
    card('Add another equal row', 'Two rows of three cover six square units.', room(3, 2), '3 + 3 = 6 square units.'),
    card('Connect the sides to the inside', 'Length three times width two gives area six: A = 3 × 2.', room(3, 2), 'Area measures the inside in square units.', 'Try covering a rectangle')
  ], 'Trace the inside, rather than the boundary. Count one row, then the number of equal rows.'),
  make('perimeter', 'Perimeter measures the way around', ['elementary'], ['room-border'], [
    card('Follow every outside edge', 'Perimeter is the distance around a shape. For a two-by-one rectangle, walk 2, then 1, then 2, then 1.', room(2, 1, 1, 'perimeter'), 'The perimeter is 2 + 1 + 2 + 1 = 6 units.'),
    card('Count all four sides', 'A three-by-two rectangle has perimeter 3 + 2 + 3 + 2 = 10 units.', room(3, 2, 1, 'perimeter'), 'Two lengths and two widths: P = 2(length + width).'),
    card('Boundary and inside are different', 'A four-by-one rectangle also has perimeter ten, but its area is only four square units. Equal perimeter does not mean equal area.', room(4, 1, 1, 'perimeter'), 'Perimeter uses length units. Area uses square units.', 'Try measuring a boundary')
  ], 'Run a finger around the outside. Contrast fencing around a garden with tiles covering its interior.'),
  make('volume', 'Volume counts equal cubes in layers', ['elementary'], ['room-stack'], [
    card('Count the base layer', 'A base that is two units by three units holds six unit cubes in one layer.', room(2, 3, 1, 'volume'), 'One unit cube measures one by one by one unit.'),
    card('Stack a matching layer', 'Two equal layers hold 6 + 6 = 12 unit cubes.', room(2, 3, 2, 'volume'), 'The base area stays six square units.'),
    card('Multiply by the layer count', 'Three equal layers hold 6 × 3 = 18 unit cubes. Volume = length × width × height.', room(2, 3, 3, 'volume'), 'Volume is measured in cubic units.', 'Try building equal layers')
  ], 'Connect a layer with a base area before multiplying by height. Volume counts space inside a solid, not the area of its outside faces.'),
  make('ratio', 'A ratio compares two quantities', ['middle'], ['garden-color'], [
    card('Name both parts in order', 'A blue-to-yellow ratio of 2:3 means two blue plants for every three yellow plants.', garden(2, 3), 'The order matters: blue first, yellow second.'),
    card('Use two complete groups', 'Twice as many of each color gives four blue and six yellow. The ratio stays the same.', garden(4, 6), '2:3 = 4:6 because both counts are multiplied by two.'),
    card('Separate each part from the whole', 'Three groups have six blue and nine yellow plants: fifteen altogether. Blue is two of every five plants, not two thirds of all plants.', garden(6, 9), 'Part-to-part: 2:3. Blue-to-whole: 2:5.', 'Try keeping a ratio')
  ], 'Keep the color order stable. Ask which two quantities a ratio compares before using its numbers.'),
  make('unit-rate', 'A unit rate tells us about one', ['middle'], ['garden-market'], [
    card('Start with a paired quantity', 'Three equal-priced packets cost six dollars altogether.', rate(3, 2), 'Both the item count and the money amount describe this purchase.'),
    card('Scale to one packet', 'Share six dollars equally among three packets. Each packet costs two dollars.', rate(1, 2), '$6 ÷ 3 packets = $2 per packet.'),
    card('Use that rate for a new quantity', 'Four packets cost four times two dollars: eight dollars.', rate(4, 2), '4 packets × $2 per packet = $8.', 'Try finding a rate for one')
  ], 'Read the units with the number. Dollars per packet is different from packets per dollar.'),
  make('proportion', 'Equivalent ratios scale together', ['middle'], ['garden-repair'], [
    card('Keep a recipe fixed', 'This recipe uses three blue plants for every two yellow plants.', garden(3, 2, 3, 2), 'One complete ratio group has five plants.'),
    card('Apply one common multiplier', 'Two recipe groups use six blue and four yellow. Both original counts were multiplied by two.', garden(6, 4, 3, 2), '3:2 = 6:4.'),
    card('Adding is a different change', 'Three recipe groups need nine blue and six yellow. Adding the same number to both parts would usually change the recipe.', garden(9, 6, 3, 2), 'Use the same scale factor for both quantities.', 'Try scaling both parts')
  ], 'Ask for the multiplier from one known quantity, then use that exact multiplier on its partner.'),
  make('negatives', 'Negative numbers locate positions below zero', ['middle'], [], [
    card('Zero is a reference point', 'Numbers to the right of zero are positive. Numbers to the left are negative.', numberLine(0, 3, [3]), 'Each equal step changes the number by one.'),
    card('Direction matters', 'Starting at zero and moving three units left reaches −3.', numberLine(0, -3, [-3]), 'A negative position is left of zero on this line.'),
    card('Combine directed moves', 'Start at −3, then move five units right. You cross zero and finish at 2: −3 + 5 = 2.', numberLine(-3, 2, [5]), 'The sign of a change tells its direction.', 'Try a directed move')
  ], 'Use a labeled number line. Keep a starting position separate from the direction and size of the change.'),
  make('percent', 'Percent means out of one hundred', ['middle'], [], [
    card('Start with a whole', 'One whole is 100%. Splitting it into four equal parts makes each part 25%.', fraction(4, 1, { showNotation: true }), '1/4 = 25/100 = 25%.'),
    card('Connect familiar amounts', 'Two of four equal parts make half the whole. Half is 50%.', fraction(4, 2, { showNotation: true }), '1/2 = 50/100 = 50%.'),
    card('Apply the fraction to a quantity', 'Twenty-five percent of twelve is one quarter of twelve: three.', array(4, 3), '25% × 12 = 0.25 × 12 = 3.', 'Try a percent of a quantity')
  ], 'Identify which quantity is the whole. A percent always needs a reference whole.'),
  make('equality', 'Equals means the same value', ['middle'], ['cargo-equality'], [
    card('Two expressions can name one amount', 'Two identical crates plus three unit loads balance eleven units. The left and right totals are equal.', balance(2, 3, 11, 4), '2x + 3 = 11 describes the balance.'),
    card('Make the same change on both sides', 'Remove three units from each side. Two crates now balance eight units.', balance(2, 0, 8, 4), 'Subtracting three from both equal totals preserves equality.'),
    card('Share both totals equally', 'Divide each side into two equal groups. One crate balances four units.', balance(1, 0, 4, 4), 'Dividing both sides by two gives x = 4.', 'Try a fair move')
  ], 'Ask what changed on each whole side. Avoid the unexplained rule “move it across and change its sign.”'),
  make('equations', 'Find an unknown while preserving equality', ['middle'], ['cargo-lift', 'cargo-check'], [
    card('Read what the equation says', 'In 2x + 3 = 11, x names one unknown amount. Two equal copies of x plus three have value eleven.', balance(2, 3, 11, 4), 'Identical x symbols stand for the same value.'),
    card('Undo the fixed addition', 'Subtract three from both sides: 2x = 8.', balance(2, 0, 8, 4), 'Both whole sides receive the same operation.'),
    card('Undo the multiplication', 'Divide both sides by two: x = 4.', balance(1, 0, 4, 4), 'One equal group has value four.'),
    card('Check in the original equation', 'Substitute four back into the original expression. 2 × 4 + 3 = 11, so the value works.', balance(2, 3, 11, 4), 'Solving and checking support each other.', 'Try solving with a visual model')
  ], 'Treat an answer as a value to test, not a number guessed from a picture. Check it by substitution.'),
  make('lines', 'A line connects a constant rate and a starting value', ['middle', 'high'], [], [
    card('Start where x is zero', 'For y = 2x + 1, setting x to zero gives y = 1. The line crosses the vertical axis at (0, 1).', line(2, 1, 0), 'The starting value is the y-intercept, 1.'),
    card('Follow a constant rate', 'Increase x by one. The output increases by two, from 1 to 3.', line(2, 1, 1), 'Slope = change in y ÷ change in x = 2/1 = 2.'),
    card('Use both pieces', 'At x = 3, y = 2 × 3 + 1 = 7. The rate and starting value work together.', line(2, 1, 3), 'A line has the same slope wherever you make the comparison.', 'Try a linear relationship')
  ], 'Connect a rate table, a point on the graph, and the equation. A slope is a rate of change, not a graph’s height.'),
  make('quadratics', 'A quadratic arch connects position and height', ['high'], ['fountain-peak', 'fountain-land', 'fountain-height'], [
    card('Locate the peak', 'For y = −(x − 2)² + 4, the squared term is zero at x = 2. The highest point is (2, 4).', { type: 'fountain', mode: 'vertex', a: -1, h: 2, k: 4, x: 2 }, 'The negative squared term makes this vertex a maximum.'),
    card('Find height at a position', 'At x = 1, the height is −(1 − 2)² + 4 = 3.', { type: 'fountain', mode: 'height', a: -1, h: 2, k: 4, x: 1 }, 'Square the difference before applying the outside negative sign.'),
    card('Ground-level positions are roots', 'Set y = 0. Then (x − 2)² = 4, so x = 0 or x = 4.', { type: 'fountain', mode: 'roots', a: -1, h: 2, k: 4, x: 0 }, 'Both roots sit two units from the peak. The span is four units.', 'Try relating an equation and its graph')
  ], 'This is an idealized mathematical arch. Ask which feature is being sought: a coordinate, a height, a root, or a span.'),
  make('powers', 'An exponent counts repeated factors', ['middle', 'high'], [], [
    card('Two factors of three', '3² means 3 × 3, which is 9. The exponent two counts the factors; it does not mean multiply three by two.', array(3, 3), '3² = 9.'),
    card('Three factors of two', '2³ means 2 × 2 × 2, which is 8. A two-by-two-by-two cube makes the three factors visible.', room(2, 2, 2, 'volume'), '2³ = 8.'),
    card('Connect powers with a graph', 'For y = x², x = 3 gives y = 9. Different inputs can have the same square: (−3)² is also 9.', { type: 'function', family: 'power', a: 1, c: 0, exponent: 2, xmin: -4, xmax: 4, markerX: 3 }, 'An even number of negative factors gives a positive product.'),
    card('An odd power keeps the sign', 'For y = x³, (−2)³ = −8 while 2³ = 8. An odd number of negative factors leaves a negative product.', { type: 'function', family: 'power', a: 1, c: 0, exponent: 3, xmin: -3, xmax: 3, markerX: -2 }, 'Parentheses identify the base. Even and odd integer powers have different symmetries.', 'Try repeated multiplication')
  ], 'Expand the power into factors before calculating. Keep the base separate from the exponent.'),
  make('exponentials', 'Exponential change repeats a multiplier', ['high'], [], [
    card('Name a starting value', 'In y = 2 × 2ˣ, the starting value at x = 0 is two, because 2⁰ = 1.', { type: 'function', family: 'exponential', a: 2, b: 2, c: 0, xmin: 0, xmax: 4, markerX: 0 }, 'At x = 0, y = 2.'),
    card('Use one common factor', 'Each step of one in x multiplies the output by two: 2, 4, 8, 16.', { type: 'function', family: 'exponential', a: 2, b: 2, c: 0, xmin: 0, xmax: 4, markerX: 2 }, 'The differences grow, while the multiplier stays constant.'),
    card('Compare rate types', 'At x = 3, y = 2 × 2³ = 16. A linear rule adds a fixed amount each step; this exponential rule multiplies by a fixed factor.', { type: 'function', family: 'exponential', a: 2, b: 2, c: 0, xmin: 0, xmax: 4, markerX: 3 }, 'The exponent is the input, rather than a fixed power on the input.', 'Try a repeated multiplier')
  ], 'Ask whether equal input steps add a constant amount or multiply by a constant factor. Check the starting value too.'),
  make('derivative', 'A derivative describes an instantaneous rate', ['college'], ['campus-slope'], [
    card('A curve can change its slope', 'For f(x) = x², the function height at x = 1 is one. A tangent line shows the local direction of the curve.', { type: 'calculus', mode: 'derivative', coefficient: 1, x: 1 }, 'Function value and tangent slope are different quantities.'),
    card('Find the local rate', 'The difference quotient is [(x + h)² − x²]/h = 2x + h for h ≠ 0. As h approaches zero, the slopes approach 2x.', { type: 'calculus', mode: 'derivative', coefficient: 1, x: 2 }, 'Thus f′(x) = 2x. At x = 2, the slope is 4.'),
    card('Interpret a negative input', 'At x = −1, the function height is 1 but the tangent slope is −2. The curve decreases as x increases near that point.', { type: 'calculus', mode: 'derivative', coefficient: 1, x: -1 }, 'Height f(−1) = 1; slope f′(−1) = −2.', 'Try interpreting a tangent slope')
  ], 'For position measured in meters against seconds, a derivative has units meters per second. This exploration illustrates the definition for one differentiable function.'),
  make('integral', 'An integral accumulates values over an interval', ['college'], ['campus-area'], [
    card('Begin with a rate graph', 'On the interval from zero to two, the line y = x lies on or above the horizontal axis.', { type: 'calculus', mode: 'integral', coefficient: 1, upper: 2, x: 0 }, 'The region below this line and above the axis is a right triangle.'),
    card('Calculate the accumulated area', 'The triangle has base two and height two. Its area is ½ × 2 × 2 = 2, matching ∫₀² x dx.', { type: 'calculus', mode: 'integral', coefficient: 1, upper: 2, x: 0 }, 'An antiderivative is x²/2; evaluate it at the upper and lower bounds.'),
    card('Track the units', 'If q(t) = t liters per minute, accumulating that rate from zero to three minutes gives ½ × 3 × 3 = 4.5 liters.', { type: 'calculus', mode: 'integral', coefficient: 1, upper: 3, x: 0 }, 'An integral is signed accumulation. Here the rate is nonnegative, so it also equals ordinary area.', 'Try an accumulation model')
  ], 'Identify what the vertical quantity measures before interpreting the integral. An amount and a rate have different units.'),
  make('vectors', 'A vector combines size and direction', ['college'], ['campus-vectors'], [
    card('Read two components in order', 'The vector (2, 1) moves two units horizontally and one vertically, starting at the origin.', { type: 'vector', x: 2, y: 1, dx: 0, dy: 0 }, 'The horizontal component comes first.'),
    card('Place the next move at the first endpoint', 'Add (−1, 2) by moving one unit left and two up from (2, 1).', { type: 'vector', x: 2, y: 1, dx: -1, dy: 2 }, 'Head-to-tail addition finishes at (1, 3).'),
    card('Add matching components', '(2, 1) + (−1, 2) = (1, 3). The sum runs directly from the starting point to the final endpoint.', { type: 'vector', x: 2, y: 1, dx: -1, dy: 2, sumX: 1, sumY: 3 }, 'Displacement is not the same quantity as total path length.', 'Try combining displacement vectors')
  ], 'Preserve component order and signs. A negative component reverses the direction along that axis; it does not make the vector’s length negative.')
];

// These introductions distinguish new mathematical ideas from an already-seen
// foundation. Learning about adding vectors does not silently teach subtraction,
// for example, and an introduction to a square derivative is not the power rule.
concepts.push(
  make('clock-minutes', 'Each numbered step is five minutes', ['early'], [], [
    card('Count the small minute marks', 'The minute hand takes sixty minutes to travel around the clock. Each small mark is one minute.', clock(2, 0), 'The long hand starts at 12 when a new hour begins.'),
    card('Five small marks reach the next number', 'At 2:05, the long hand points to 1. One numbered step around the face is five minutes.', clock(2, 5), 'The number 1 on the face means five minutes when read with the minute hand.'),
    card('Count numbered steps in fives', 'At 2:20, the long hand points to 4. Count five, ten, fifteen, twenty.', clock(2, 20), 'Read the short hand for the hour. Count minutes with the long hand.', 'Try counting minutes in fives')
  ], 'Use the small tick marks to show why one numbered step stands for five minutes. The same printed numbers serve two different hands.'),
  make('clock-elapsed', 'Elapsed time is how much time passes', ['early'], [], [
    card('Keep the starting time', 'Our walk starts at 2:30. Keep that time in mind before moving either hand.', clock(2, 30), 'Starting time: half past two.'),
    card('Move forward thirty minutes', 'Thirty minutes after 2:30 is 3:00. The long hand moves halfway around the clock.', clock(3, 0), 'We moved forward through time, past the end of the old hour.'),
    card('Make another equal move', 'Another thirty minutes takes us to 3:30. Sixty minutes passed between 2:30 and 3:30.', clock(3, 30), 'Two half-hours make one hour.', 'Try moving forward in time')
  ], 'Name the start before counting a duration. Move in short known intervals across the hour instead of changing the minute digits alone.'),
  make('systems', 'An intersection satisfies two rules', ['high'], [], [
    card('Two plans have different rules', 'Plan A follows y = 2x + 1. Plan B follows y = x + 4. The lines have different starting values and rates.', { ...line(2, 1, 0), comparison: { a: 1, b: 4 } }, 'A shared point must satisfy both equations.'),
    card('Ask when the outputs match', 'Set the outputs equal: 2x + 1 = x + 4. Subtract x and then subtract one to get x = 3.', { ...line(2, 1, 3), comparison: { a: 1, b: 4 } }, 'We solve for the same input in both rules.'),
    card('Check both coordinates', 'At x = 3, both rules give y = 7. Their intersection is (3, 7); the rates do not have to match.', { ...line(2, 1, 3), comparison: { a: 1, b: 4 } }, '2 × 3 + 1 = 7 and 3 + 4 = 7.', 'Try finding where two rules agree')
  ], 'An intersection is a shared input-output pair, rather than a point where both outputs must be zero.'),
  make('quadratics-up', 'A squared term makes a curved graph', ['high'], [], [
    card('A positive square opens upward', 'For y = x² − 4, the squared part is smallest at x = 0. The minimum point is (0, −4).', { type: 'function', family: 'quadratic', a: 1, b: 0, c: -4, xmin: -4, xmax: 4, markerX: 0 }, 'Changing the sign of the squared coefficient changes the opening direction.'),
    card('Roots give zero output', 'Set x² − 4 = 0. Both x = 2 and x = −2 work because both square to four.', { type: 'function', family: 'quadratic', a: 1, b: 0, c: -4, xmin: -4, xmax: 4, markerX: 2 }, 'x² − 4 = (x − 2)(x + 2). Each factor gives a root.'),
    card('Inspect the region between roots', 'Between −2 and 2, x² is less than four. The output x² − 4 is negative there.', { type: 'function', family: 'quadratic', a: 1, b: 0, c: -4, xmin: -4, xmax: 4, markerX: 1 }, 'At x = 1, y = 1 − 4 = −3.', 'Try a quadratic shape and its zeros')
  ], 'Separate the sign of an input, the sign of its square, and the sign of the final output.'),
  make('exponential-decay', 'Repeated halving is exponential change too', ['high'], [], [
    card('Begin before any intervals pass', 'This idealized quantity starts at sixteen. Its rule is y = 16(1/2)ˣ.', { type: 'function', family: 'exponential', a: 16, b: .5, c: 0, xmin: 0, xmax: 4, markerX: 0 }, 'At x = 0, the output is 16.'),
    card('Apply the factor once per interval', 'After one interval, half remains: eight. After two intervals, half of eight remains: four.', { type: 'function', family: 'exponential', a: 16, b: .5, c: 0, xmin: 0, xmax: 4, markerX: 2 }, 'The factor is always 1/2. The amount subtracted is not constant.'),
    card('Count factors, not subtractions', 'After three intervals, 16 × 1/2 × 1/2 × 1/2 = 2. The exponent counts how many factors to apply.', { type: 'function', family: 'exponential', a: 16, b: .5, c: 0, xmin: 0, xmax: 4, markerX: 3 }, 'A factor between zero and one gives decay for a positive starting value.', 'Try a repeated reduction')
  ], 'Compare successive output ratios. Halving each interval differs from subtracting one half of the original amount each time.'),
  make('derivative-power', 'The power rule finds polynomial rates', ['college'], [], [
    card('A constant shift has no rate of change', 'For f(x) = 3x² + 5, f′(x) = 6x. Multiplying the square by three multiplies its slope by three. The added five has derivative zero.', { type: 'function', family: 'power', a: 3, exponent: 2, c: 5, xmin: -3, xmax: 3, markerX: 1, comparison: { a: 6, b: 2 } }, 'At x = 1, the height is 8 and the tangent slope is 6.'),
    card('Use the power rule', 'For positive integer n, d(axⁿ)/dx = anxⁿ⁻¹. Thus f(x) = 2x³ has derivative 6x².', { type: 'function', family: 'power', a: 2, exponent: 3, c: 0, xmin: -2, xmax: 2, markerX: -1, comparison: { a: 6, b: 4 } }, 'At x = −1, the height is −2 but the slope is positive 6.'),
    card('Differentiate, then substitute', 'At x = 2, the derivative of 2x³ is 6 × 2² = 24. Substitute into the derivative when asked for slope or instantaneous rate.', { type: 'function', family: 'power', a: 2, exponent: 3, c: 0, xmin: -2, xmax: 3, markerX: 2, comparison: { a: 24, b: -32 } }, 'f(2) = 16 and f′(2) = 24 describe different quantities.', 'Try a scaled polynomial rate')
  ], 'Identify whether the question asks for f or f′. The stated power rule applies to these differentiable polynomial models.'),
  make('tangent-line', 'A tangent matches a curve at one point', ['college'], [], [
    card('Find the point and local slope', 'For f(x) = x² at a = 2, f(2) = 4 and f′(2) = 4. A tangent must pass through (2, 4) with slope four.', { type: 'function', family: 'quadratic', a: 1, b: 0, c: 0, xmin: 0, xmax: 4, markerX: 2, comparison: { a: 4, b: -4 } }, 'Matching the curve height alone does not specify a tangent.'),
    card('Build the line from that point', 'Use y = f(a) + f′(a)(x − a). Here y = 4 + 4(x − 2) = 4x − 4.', { type: 'function', family: 'quadratic', a: 1, b: 0, c: 0, xmin: 0, xmax: 4, markerX: 2, comparison: { a: 4, b: -4 } }, 'The tangent’s vertical intercept is −4, not the contact height 4.'),
    card('Use the line for a nearby estimate', 'At x = 2.1, the tangent predicts 4 + 4(0.1) = 4.4. The exact square is 4.41. The linear estimate is close here, but not exact.', { type: 'function', family: 'quadratic', a: 1, b: 0, c: 0, xmin: 1, xmax: 3, markerX: 2.1, comparison: { a: 4, b: -4 } }, 'A local approximation generally becomes less accurate farther from the contact point.', 'Try a tangent and a nearby estimate')
  ], 'Keep the contact input, contact height, tangent slope, and line intercept distinct.'),
  make('integral-constant', 'A constant rate accumulates as a rectangle', ['college'], [], [
    card('Identify rate and duration', 'A flow of three liters per minute lasts from minute one to minute three. The duration is two minutes.', { ...line(0, 3, 1), xmin: 0, xmax: 5, integralStart: 1, integralEnd: 3 }, 'Duration = upper endpoint − lower endpoint.'),
    card('Multiply the rate by the duration', 'Three liters per minute for two minutes accumulates six liters. The region has width two and height three.', { ...line(0, 3, 3), xmin: 0, xmax: 5, integralStart: 1, integralEnd: 3 }, '∫₁³ 3 dt = 3(3 − 1) = 6.'),
    card('Preserve the units', 'Integrating liters per minute over minutes gives liters. A rate and an accumulated amount answer different questions.', { ...line(0, 3, 3), xmin: 0, xmax: 5, integralStart: 1, integralEnd: 3 }, 'The interval need not begin at zero.', 'Try a steady accumulation')
  ], 'Read the interval before calculating. Multiplying by the upper endpoint alone is wrong when the starting time is not zero.'),
  make('integral-interval', 'The endpoints and the sign both matter', ['college'], [], [
    card('Evaluate only the chosen interval', 'For y = x from one to three, an antiderivative is x²/2. The integral is 3²/2 − 1²/2 = 4.', { ...line(1, 0, 3), xmin: -3, xmax: 4, integralStart: 1, integralEnd: 3 }, 'Upper antiderivative value minus lower antiderivative value.'),
    card('Values below the axis contribute negatively', 'From −2 to zero, y = x is nonpositive. The integral is 0²/2 − (−2)²/2 = −2.', { ...line(1, 0, -1), xmin: -3, xmax: 4, integralStart: -2, integralEnd: 0 }, 'The geometric triangle has area 2; its signed integral is −2.'),
    card('Opposite signed contributions can cancel', 'From −1 to 1, the negative contribution is −1/2 and the positive contribution is 1/2. The integral is zero, while total geometric area is one.', { ...line(1, 0, 0), xmin: -3, xmax: 3, integralStart: -1, integralEnd: 1 }, 'Zero signed accumulation does not mean no region exists.', 'Try a definite integral on an interval')
  ], 'Keep ordinary geometric area separate from signed integral. Preserve upper-minus-lower order even when endpoints are negative.'),
  make('vector-scale', 'A scalar multiplies every vector component', ['college'], [], [
    card('Scale both components', 'For v = (2, 1), twice the vector is 2v = (4, 2). The direction stays the same and the length doubles.', { type: 'vector', mode: 'scale', scalar: 2, x: 2, y: 1, dx: 0, dy: 0, sumX: 4, sumY: 2 }, 'Multiply horizontal and vertical components by the same scalar.'),
    card('A smaller positive scalar shortens', 'Half of (2, 1) is (1, 1/2). The length halves while direction stays the same.', { type: 'vector', mode: 'scale', scalar: .5, x: 2, y: 1, dx: 0, dy: 0, sumX: 1, sumY: .5 }, 'Fractions scale each component too.'),
    card('A negative scalar reverses direction', 'Multiplying (2, 1) by −1 gives (−2, −1). The direction reverses and the length stays the same.', { type: 'vector', mode: 'scale', scalar: -1, x: 2, y: 1, dx: 0, dy: 0, sumX: -2, sumY: -1 }, 'Length is multiplied by the absolute value of the scalar.', 'Try scaling a vector')
  ], 'A negative scalar reverses direction. It does not create a negative length.'),
  make('vector-difference', 'Displacement is end position minus start position', ['college'], [], [
    card('Name start and end', 'Start at A = (1, 1) and finish at B = (4, 3). We need the change from A to B.', { type: 'vector', x: 1, y: 1, dx: 3, dy: 2, mode: 'difference', startX: 1, startY: 1, endX: 4, endY: 3 }, 'Position and change in position are different vectors.'),
    card('Subtract corresponding coordinates', 'Horizontal change is 4 − 1 = 3. Vertical change is 3 − 1 = 2. The displacement is (3, 2).', { type: 'vector', x: 1, y: 1, dx: 3, dy: 2, sumX: 3, sumY: 2, mode: 'difference', startX: 1, startY: 1, endX: 4, endY: 3 }, 'Use end minus start in both components.'),
    card('Reversing the journey reverses the vector', 'From B back to A, subtract in the opposite order: (1 − 4, 1 − 3) = (−3, −2).', { type: 'vector', x: 4, y: 3, dx: -3, dy: -2, sumX: -3, sumY: -2, mode: 'difference', startX: 4, startY: 3, endX: 1, endY: 1 }, 'The magnitude is the same, but the direction is reversed.', 'Try finding a displacement')
  ], 'Mark the start with A and end with B before subtracting. The order determines the direction.')
);

concepts.push(
  make('multiplication-order','Turn an array. Keep the total.',['elementary'],[],[
    card('Count equal rows','Three rows have four tiles in each row. Three groups of four make twelve.',array(3,4),'3 × 4 = 12. The first number counts groups.'),
    card('Look in the other direction','Turn your thinking: now count four rows with three tiles in each. No tile was added or taken away.',array(4,3),'4 × 3 = 12, too. Rows and columns have traded jobs.'),
    card('Change the order, keep the product','3 × 4 and 4 × 3 have the same total. The group stories can be different even when the totals match.',array(3,4),'For multiplication, swapping the two factors preserves the product.','Try turning an array')
  ],'Point to a whole row, then to a whole column. Connect each factor to a group in the picture. This order rule does not hold for subtraction or division.'),
  make('multiplication-zero-one','What do one and zero do?',['elementary'],[],[
    card('One group keeps everything','One row of five tiles is five tiles. One group of a number keeps that number.',array(1,5),'1 × 5 = 5.'),
    card('Groups of one keep the count','Five rows with one tile each also make five. Count the single tiles.',array(5,1),'5 × 1 = 5.'),
    card('No objects means zero','Three empty bags contain no snacks. Each bag has zero, so the total is zero. Adding zero is a different operation.',count(0),'3 × 0 = 0. A nonempty group plus zero would stay nonempty.','Try one or no objects')
  ],'Use empty containers to keep the number of groups separate from the number in each group. Zero groups of five and five groups of zero both have zero objects.'),
  make('multiplication-split','Split a big array into friendly parts',['elementary'],[],[
    card('Find the whole array','This tray has three rows and seven columns. We can count it in two pieces.',array(3,7),'We want 3 × 7.'),
    card('Keep every tile in one part','Split after five columns. The blue part is 3 × 5 = 15. The green part is 3 × 2 = 6.',{...array(3,7),splitColumn:5},'Every tile belongs to exactly one part. None overlap or disappear.'),
    card('Add the two products','Fifteen and six make twenty-one. Splitting the seven into five and two made the same total easier to find.',{...array(3,7),splitColumn:5},'3 × 7 = (3 × 5) + (3 × 2) = 21.','Try a helpful split')
  ],'Cover one part with paper, then uncover it. Ask which dimension stayed the same. The height is shared by both products.'),
  make('division-meaning','Two questions about equal groups',['elementary'],[],[
    card('Start with the whole','Twelve snacks will go into equal groups. Division can help us find something missing.',array(3,4),'The whole contains 12 snacks.'),
    card('Find the size of each share','Share twelve snacks equally among three plates. Each plate gets four. We knew the number of groups.',array(3,4),'12 ÷ 3 = 4 snacks per plate.'),
    card('Find the number of groups','Pack twelve snacks with four in each bag. We can fill three bags. We knew the size of each group.',array(3,4),'12 ÷ 4 = 3 bags. Read what the question asks you to find.','Try sharing and grouping')
  ],'Say the unit after the answer: snacks per plate or bags. The same array can answer two different division questions.'),
  make('division-inverse','Multiplication and division work together',['elementary'],[],[
    card('Start with a fact you can see','Three rows of four tiles make twelve tiles altogether.',array(3,4),'3 × 4 = 12, and 4 × 3 = 12.'),
    card('Find the missing factor','If twelve tiles go into three equal rows, each row needs four. Ask: three times what makes twelve?',array(3,4),'12 ÷ 3 = 4 because 3 × 4 = 12.'),
    card('Multiply back to check','If you think twelve divided by four is three, check four times three. It rebuilds the whole twelve.',array(4,3),'12 ÷ 4 = 3. Related facts use the same whole and equal groups.','Try a missing number')
  ],'Write a little box in the missing position. A division answer can be checked by multiplying the quotient by the divisor to recover the total.'),
  make('division-zero-one','Share with one, or share an empty total',['elementary'],[],[
    card('One group gets the whole','Six snacks shared with one person gives that person all six.',array(1,6),'6 ÷ 1 = 6.'),
    card('One for each','Six snacks shared among six people gives each person one.',array(6,1),'6 ÷ 6 = 1. Here the total is not zero.'),
    card('Share an empty total','Zero snacks shared equally among three people gives each person zero. We still have three people. Dividing by zero is not allowed.',count(0),'0 ÷ 3 = 0. The divisor in these questions is always positive.','Try one or an empty total')
  ],'Keep 0 ÷ 3 distinct from 3 ÷ 0. An empty total can be shared among a positive number of groups; division by zero has no defined answer here.')
);

concepts.push(...yearConcepts,...primaryConcepts,...upperConcepts);
const extraMissionIds = {
  counting: ['meadow-small-trail', 'meadow-ten-trail'],
  zero: ['meadow-zero'], compare: ['meadow-same-number', 'meadow-fewer'],
  shapes: ['meadow-shape-sides'], sorting: ['meadow-shape-sort'], patterns: ['meadow-patterns'],
  addition: ['pond-count-on', 'pond-doubles'], subtraction: ['pond-take-all'],
  'missing-parts': ['pond-missing-part'], 'make-ten': ['pond-make-ten'], 'place-value': ['pond-ten-trade'],
  'clock-minutes': ['clock-five-minutes'], 'clock-elapsed': ['clock-elapsed'],
  fractions: ['ribbon-unit-parts', 'ribbon-equal-share'], 'fraction-equivalence': ['ribbon-equivalence'],
  multiplication: ['picnic-skip-groups'], division: ['picnic-share-bags'],
  area: ['studio-same-area', 'studio-factor-room'], perimeter: ['studio-border-repair'],
  negatives: ['workshop-number-order', 'workshop-signed-moves'], ratio: ['garden-recipe'],
  proportion: ['garden-scale-map'], percent: ['garden-percent-parts', 'garden-percent-sale'],
  equations: ['workshop-negative-balance'], lines: ['workshop-linear-fare', 'observatory-line-slope', 'observatory-line-intercept'],
  systems: ['observatory-lines-meet'], 'quadratics-up': ['observatory-quadratic-shape', 'observatory-quadratic-zeros'],
  exponentials: ['observatory-growth'], 'exponential-decay': ['observatory-decay'], powers: ['observatory-power-pattern'],
  'derivative-power': ['campus-scaled-derivative', 'campus-cube-derivative'], 'tangent-line': ['campus-tangent-line'],
  'integral-constant': ['campus-constant-integral'], integral: ['campus-scaled-integral'], 'integral-interval': ['campus-interval-integral'],
  'vector-scale': ['campus-vector-scale'], 'vector-difference': ['campus-vector-difference']
};
for (const concept of concepts) concept.missionIds.push(...(extraMissionIds[concept.id] || []));
for(const mission of [...extraMissions,...yearMissions,...primaryMissions,...upperMissions]){
  const concept=concepts.find(c=>c.id===(mission.conceptKey||mission.conceptId));
  if(concept&&!concept.missionIds.includes(mission.id))concept.missionIds.push(mission.id);
}

export function conceptFor(missionOrId) {
  if (!missionOrId) return null;
  if (typeof missionOrId === 'object') {
    const explicit = missionOrId.conceptKey || missionOrId.conceptId;
    if (explicit) return concepts.find(concept => concept.id === explicit) || null;
    return concepts.find(concept => concept.missionIds.includes(missionOrId.id)) || null;
  }
  if (typeof missionOrId !== 'string') return null;
  return concepts.find(concept => concept.id === missionOrId || concept.missionIds.includes(missionOrId)) || null;
}
