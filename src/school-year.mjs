/* An independent Math Atlas Grade 3 study sequence. Weeks describe a flexible
   planning budget, never dates, locks, placement decisions, or mastery claims.
   Mission completion records participation, including supported practice. */
const CC = 'https://www.thecorestandards.org/Math/Content/3/';
const IM = 'https://im.kendallhunt.com/k5/teachers/grade-3/';
const scope = IM + 'course-guide/scope-and-sequence.html';

export const grade3Year = {
  id: 'math-atlas-grade-3-year', title: 'A year of Grade 3 discoveries', gradeId: '3',
  description: 'Eight connected units with visual teaching, worked examples, practice, and planned revisits.',
  paceNote: 'About 36 flexible study weeks. Repeat, pause, or choose another unit whenever useful.',
  coverageNote: 'A growing study companion for the Grade 3 standards. Its short lessons support schoolwork and adult guidance; completion is a record of practice.',
  units: [
    {
      id: 'g3-unit-1', title: 'Data, equal groups, and multiplication', sequence: 1, weeks: 5,
      goal: 'Read a graph key, build equal groups, and connect rows and columns with a multiplication expression.',
      standards: ['3.MD.B.3', '3.OA.A.1', '3.OA.A.3', '3.OA.D.9'],
      prerequisiteSkills: ['Count a collection once per object.', 'Combine small groups and explain what each number counts.'],
      prerequisiteMissionIds: [],
      missionIds: ['g3y-picture-key', 'g3y-bar-chart', 'meadow-groups', 'g3-mul-equal-bags', 'g3-mul-array-stories', 'meadow-arrays', 'g3-mul-array-expressions', 'g3-mul-repeated-add', 'g3-mul-skip-hops', 'g3-mul-turn-array', 'g3-mul-one', 'g3-mul-zero', 'picnic-skip-groups'],
      reviewMissionIds: ['meadow-groups', 'g3-mul-array-stories', 'g3y-picture-key'],
      methods: ['Use the key before counting pictures or reading a bar.', 'Build groups with counters; keep every group the same size.', 'Match group count × group size with an array and repeated addition.', 'Turn an array and explain which factor now counts rows.'],
      everydayPractice: ['Arrange a small collection of pencils in equal rows.', 'Collect a few family choices and make a labeled picture graph with a stated key.'],
      sourceUrls: [CC + 'OA/A/1/', CC + 'MD/B/3/', scope, IM + 'unit-1/lesson-18/lesson.html']
    },
    {
      id: 'g3-unit-2', title: 'Covering space with equal squares', sequence: 2, weeks: 4,
      goal: 'Measure area with equal unit squares, connect area with multiplication, and add non-overlapping rectangular parts.',
      standards: ['3.MD.C.5', '3.MD.C.6', '3.MD.C.7', '3.OA.B.5'],
      prerequisiteSkills: ['Find the rows and columns in an array.', 'Keep length units and counts of objects distinct.'],
      prerequisiteMissionIds: ['g3-mul-array-expressions', 'g3-mul-turn-array'],
      missionIds: ['g3y-tile-area', 'room-floor', 'studio-factor-room', 'g3y-area-compose', 'g3y-equal-area-split', 'studio-same-area'],
      reviewMissionIds: ['g3-mul-array-expressions', 'g3y-tile-area', 'room-floor'],
      methods: ['Cover a region without gaps or overlaps using one size of square.', 'Count squares by rows before using length × width.', 'Split a region along complete edges and add the areas once.', 'Compare two shapes with the same area while noticing different boundaries.'],
      everydayPractice: ['Cover a paper rectangle with equal paper squares.', 'Draw two different rectangles that each cover twelve square units.'],
      sourceUrls: [CC + 'MD/C/5/', CC + 'MD/C/7/', scope]
    },
    {
      id: 'g3-unit-3', title: 'Place value and calculation within one thousand', sequence: 3, weeks: 4,
      goal: 'Build hundreds, tens, and ones; round to a stated place; and explain addition and subtraction by regrouping.',
      standards: ['3.NBT.A.1', '3.NBT.A.2', '3.NBT.A.3'],
      prerequisiteSkills: ['Understand one ten as ten ones.', 'Add and subtract within one hundred with a model when useful.'],
      prerequisiteMissionIds: ['meadow-tens'],
      missionIds: ['g3y-number-compose', 'g3y-hundreds-trade', 'g3y-round-ten', 'g3y-round-hundred', 'g3y-add-regroup', 'g3y-subtract-regroup', 'g3-mul-ten-packs'],
      reviewMissionIds: ['meadow-arrays', 'g3y-number-compose', 'g3y-round-ten'],
      methods: ['Record a number as hundreds + tens + ones.', 'Trade ten ones for one ten, or ten tens for one hundred, without changing the value.', 'Locate a number between neighboring tens or hundreds before rounding.', 'Connect place-value trades to a written calculation, then estimate or use the inverse operation to check.'],
      everydayPractice: ['Build a three-digit number with paper bundles and loose marks.', 'Estimate a pair of whole-number quantities, then calculate and compare the estimate.'],
      sourceUrls: [CC + 'NBT/A/1/', CC + 'NBT/A/2/', CC + 'NBT/A/3/', scope]
    },
    {
      id: 'g3-unit-4', title: 'Multiplication and division explain each other', sequence: 4, weeks: 6,
      goal: 'Find an unknown group count, share, or total; use known facts to derive others; and keep units clear in two-step stories.',
      standards: ['3.OA.A.2', '3.OA.A.4', '3.OA.B.5', '3.OA.B.6', '3.OA.C.7', '3.OA.D.8', '3.OA.D.9'],
      prerequisiteSkills: ['Represent a product as equal groups.', 'Add areas or groups without counting a part twice.'],
      prerequisiteMissionIds: ['g3-mul-equal-bags', 'g3y-equal-area-split', 'g3y-number-compose'],
      missionIds: ['g3-mul-split-five', 'g3-mul-double-double', 'g3y-near-ten-fact', 'g3y-three-factor-pack', 'g3-mul-missing-factor', 'g3-div-share-plates', 'g3-div-box-groups', 'g3-div-compare-methods', 'picnic-share-bags', 'g3-div-inverse', 'g3-div-fact-family', 'g3-div-unpack-rows', 'g3-div-missing-divisor', 'g3-div-missing-total', 'g3y-unknown-position', 'g3-div-skip-back', 'g3-div-one-zero', 'g3-div-check-repair', 'g3y-divide-split', 'g3-div-two-step', 'g3y-two-step-inventory'],
      reviewMissionIds: ['g3y-add-regroup', 'g3-mul-array-stories', 'g3-div-share-plates'],
      methods: ['Name the whole, the number of groups, and the number in each group before choosing an operation.', 'Build the unknown with picture buttons; use the visible product to check the total.', 'Split a product into known facts and add the partial products.', 'Use a related multiplication fact to check division; keep division by zero separate from a zero total.', 'Draw or record each step of a story and name its units.'],
      everydayPractice: ['Share eighteen counters among three plates, then pack eighteen counters three per bag; explain how the questions differ.', 'Build a six-by-eight array as a five-by-eight block plus one more row.'],
      sourceUrls: [CC + 'OA/A/2/', CC + 'OA/B/5/', CC + 'OA/B/6/', CC + 'OA/C/7/', CC + 'OA/D/8/', scope, IM + 'unit-4/lesson-1/lesson.html']
    },
    {
      id: 'g3-unit-5', title: 'Fractions are numbers made from equal parts', sequence: 5, weeks: 6,
      goal: 'Keep the whole fixed, build unit fractions, locate fractions on a line, and explain equivalence and comparisons.',
      standards: ['3.NF.A.1', '3.NF.A.2', '3.NF.A.3', '3.G.A.2'],
      prerequisiteSkills: ['Share a whole into equal parts.', 'Distinguish a length from a count of objects.'],
      prerequisiteMissionIds: ['g3-div-share-plates', 'g3y-tile-area'],
      missionIds: ['ribbon-equal-share', 'ribbon-unit-parts', 'meadow-fractions', 'g3y-unit-line', 'g3y-locate-share', 'g3y-whole-number', 'g3y-above-one', 'ribbon-equivalence', 'g3y-equivalent-line', 'g3y-compare-same-bottom', 'g3y-compare-same-top', 'g3y-compare-half'],
      reviewMissionIds: ['g3-div-inverse', 'g3y-round-hundred', 'ribbon-unit-parts'],
      methods: ['Point to one whole before naming any fraction.', 'Count all equal parts and then the selected parts; connect those counts with the bottom and top numbers.', 'Keep the interval from zero to one fixed while partitioning a number line.', 'Locate more than one whole by continuing with the same unit fraction.', 'Explain equivalence or a comparison with equal-sized wholes, not denominator size alone.'],
      everydayPractice: ['Fold equal-sized strips into halves, fourths, and eighths and compare the selected lengths.', 'Make a floor number line from zero to two and step in quarters.'],
      sourceUrls: [CC + 'NF/A/1/', CC + 'NF/A/2/', CC + 'NF/A/3/', CC + 'G/A/2/', scope]
    },
    {
      id: 'g3-unit-6', title: 'Time, measurement, and information', sequence: 6, weeks: 5,
      goal: 'Read time and measurement scales, find elapsed intervals, and organize measured lengths in line plots.',
      standards: ['3.MD.A.1', '3.MD.A.2', '3.MD.B.4'],
      prerequisiteSkills: ['Read hours and half-hours.', 'Use equal intervals on a number line.', 'Recognize halves and quarters of the same unit.'],
      prerequisiteMissionIds: ['clock-hours', 'clock-halves', 'g3y-locate-share'],
      missionIds: ['clock-quarters', 'clock-five-minutes', 'g3y-minute-clock', 'clock-elapsed', 'g3y-elapsed-cross-hour', 'g3y-liters-scale', 'g3y-mass-balance', 'g3y-line-plot', 'g3y-length-plot'],
      reviewMissionIds: ['g3y-equivalent-line', 'g3-div-box-groups', 'g3y-minute-clock'],
      methods: ['Read the short hour hand and count the long hand’s minute marks.', 'Break an elapsed interval at a convenient hour, then combine the parts.', 'Read the unit and the value of each scale interval before interpreting a measurement.', 'Use grams or kilograms for mass and liters for liquid volume; preserve units in a one-step calculation.', 'Use one mark per measured object in a line plot, including repeated lengths.'],
      everydayPractice: ['Describe a start time and move a paper clock forward by a chosen interval.', 'Measure several strips to the nearest half or quarter inch, then plot every measured length.'],
      sourceUrls: [CC + 'MD/A/1/', CC + 'MD/A/2/', CC + 'MD/B/4/', scope]
    },
    {
      id: 'g3-unit-7', title: 'Shape families and the distance around', sequence: 7, weeks: 4,
      goal: 'Sort shapes by defining attributes and distinguish perimeter from area while solving for missing sides.',
      standards: ['3.G.A.1', '3.MD.D.8', '3.MD.C.7'],
      prerequisiteSkills: ['Count straight sides and describe corners.', 'Measure covering in square units.'],
      prerequisiteMissionIds: ['meadow-shapes', 'g3y-tile-area', 'g3y-area-compose'],
      missionIds: ['g3y-attributes', 'g3y-quadrilateral-sort', 'room-border', 'g3y-missing-side', 'studio-border-repair', 'g3y-same-perimeter'],
      reviewMissionIds: ['g3y-area-compose', 'g3y-compare-same-bottom', 'room-border'],
      methods: ['Sort by shared properties; allow a square to belong to more than one shape family.', 'Trace every outside edge once to measure perimeter.', 'Use equal opposite sides of a rectangle to find an unknown length.', 'Compare area and perimeter using their different units and meanings.'],
      everydayPractice: ['Sort paper quadrilaterals using a stated rule and explain overlapping groups.', 'Make two ten-unit loops on grid paper and compare the areas they enclose.'],
      sourceUrls: [CC + 'G/A/1/', CC + 'G/A/2/', CC + 'MD/D/8/', scope]
    },
    {
      id: 'g3-unit-8', title: 'Plan, explain, and revisit', sequence: 8, weeks: 2,
      goal: 'Choose useful models for mixed everyday problems and explain why an answer fits the situation.',
      standards: ['3.OA.D.8', '3.OA.D.9', '3.NBT.A.2', '3.NF.A.2', '3.MD.A.1', '3.MD.D.8'],
      prerequisiteSkills: ['Select a model for a quantity or operation.', 'Name the units in a result and check reasonableness.'],
      prerequisiteMissionIds: ['g3-div-two-step', 'g3y-compare-same-bottom', 'g3y-elapsed-cross-hour'],
      missionIds: ['g3y-plan-picnic', 'g3y-design-garden'],
      reviewMissionIds: ['g3y-subtract-regroup', 'g3y-locate-share', 'g3y-elapsed-cross-hour'],
      methods: ['Sketch or build the situation before calculating.', 'Choose an operation for each smaller question and keep a written record.', 'Check with estimation, an inverse operation, or a second representation.', 'Explain one correction and choose an older idea to practice again.'],
      everydayPractice: ['Plan equal shares for a small pretend picnic and explain the quantities.', 'Design a garden on grid paper and separately label its covering and boundary.'],
      sourceUrls: [CC + 'OA/D/8/', CC + 'OA/D/9/', scope]
    }
  ]
};

export function schoolYearForGrade(id) { return id === '3' || id === 3 ? grade3Year : null; }

export function unitForMission(id) {
  if (typeof id !== 'string') return null;
  return grade3Year.units.find(unit => unit.missionIds.includes(id)) || null;
}

// Return only the supplied mission objects that belong to this year. References
// are preserved, missing inventory is not invented, and the input is untouched.
export function orderedMissions(missions) {
  if (!Array.isArray(missions)) return [];
  const byId = new Map();
  for (const mission of missions) if (mission && typeof mission.id === 'string' && !byId.has(mission.id)) byId.set(mission.id, mission);
  return grade3Year.units.flatMap(unit => unit.missionIds.map(id => byId.get(id)).filter(Boolean));
}

export function nextInYear(state) {
  const completed = state?.completed && typeof state.completed === 'object' && !Array.isArray(state.completed) ? state.completed : {};
  const done = id => Object.hasOwn(completed, id) && Boolean(completed[id]) && (completed[id] === true || typeof completed[id] === 'object' && !Array.isArray(completed[id]));
  const entry = (unit, missionId) => ({ missionId, unitId: unit.id, unitTitle: unit.title, sequence: unit.sequence });
  const paused = state?.inProgress?.missionId, pausedUnit = unitForMission(paused);
  if (pausedUnit && !done(paused)) return entry(pausedUnit, paused);
  for (const unit of grade3Year.units) for (const missionId of unit.missionIds) if (!done(missionId)) return entry(unit, missionId);
  return null;
}
