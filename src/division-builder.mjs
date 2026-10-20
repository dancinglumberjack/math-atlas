/* A representation adapter for the authored division sequence. It preserves
   each question and answer, while binding numeric responses to a visible build.
   No imported task model, browser storage, reward state, or evaluation is needed. */
export const divisionMissionIds = Object.freeze([
  'picnic-share-bags',
  'g3-div-share-plates', 'g3-div-box-groups', 'g3-div-compare-methods',
  'g3-div-inverse', 'g3-div-fact-family', 'g3-div-missing-divisor',
  'g3-div-missing-total', 'g3-div-skip-back', 'g3-div-one-zero',
  'g3-div-unpack-rows', 'g3-div-two-step', 'g3-div-check-repair'
]);

// Columns hold the number in one row-group. In the one deliberately transposed
// task, columns are the groups and rows hold the number in each column-group.
// Choice-only steps have no adapter: their existing visual and choices stay put.
const representations = {
  'picnic-share-bags': ['share', 'groups', 'share'],
  'g3-div-share-plates': ['share', 'share', 'share'],
  'g3-div-box-groups': ['groups', 'groups', 'groups'],
  'g3-div-compare-methods': [null, null, 'share'],
  'g3-div-inverse': ['share', null, 'groups'],
  'g3-div-fact-family': ['share', null, 'share'],
  'g3-div-missing-divisor': ['share', 'share', 'share'],
  'g3-div-missing-total': ['groups', 'total', 'total'],
  'g3-div-skip-back': [null, null, null],
  'g3-div-one-zero': [null, null, null],
  'g3-div-unpack-rows': ['share', 'column-share', null],
  'g3-div-two-step': ['share', null, 'total'],
  'g3-div-check-repair': [null, null, 'share']
};

const control = (key, label, initial, fixed = false) => ({ key, label, min: fixed ? initial : 0, max: fixed ? initial : 12, step: 1, initial });
const whole = value => Number.isInteger(value) && value >= 0 && value <= 144;

export function adaptTask(mission, task) {
  const id = typeof mission === 'string' ? mission : mission?.id;
  const explicitYearMode=typeof id==='string'&&id.startsWith('g3y-')?task?.visual?.divisionMode:null;
  if ((!divisionMissionIds.includes(id)&&!explicitYearMode) || !task || task.answer?.kind !== 'number') return task;
  const mode = explicitYearMode || representations[id]?.[task.step];
  if (!mode) throw new RangeError(`Division challenge ${id}:${task.step} needs an explicit representation.`);
  if (task.visual?.type !== 'array') throw new TypeError(`Division challenge ${id}:${task.step} must supply its authored array givens.`);
  const p = task.visual;
  const fixedKey = mode === 'groups' || mode === 'column-share' || mode === 'total' ? 'columns' : 'rows';
  const variableKey = fixedKey === 'columns' ? 'rows' : 'columns';
  const known = p[fixedKey];
  if (!whole(known) || known === 0 || known > 12) throw new RangeError(`Division challenge ${id}:${task.step} needs a positive, bounded known group count or size.`);

  const groupKey = mode === 'column-share' ? 'columns' : 'rows';
  const shareKey = mode === 'column-share' ? 'rows' : 'columns';
  let given;
  if (id === 'g3-div-missing-total' && task.step === 0) {
    // This scaffold asks the learner to construct the stated group count, not
    // yet to answer the missing whole. Its whole must remain unnamed.
    const stated = task.prompt.match(/^\?\s*÷\s*(\d+)\s*=\s*(\d+)/);
    if (!stated || Number(stated[2]) !== known) throw new RangeError('The missing-total scaffold must state a group count and equal share.');
    given = { givenGroups: Number(stated[1]), givenEach: known };
  } else given = mode === 'total'
    ? { givenGroups: p.rows, givenEach: p.columns }
    : { givenTotal: p.targetTotal ?? task.expected * known, ...(mode === 'groups' ? { givenEach: known } : { givenGroups: known }) };
  if (Object.values(given).some(value => !whole(value))) throw new RangeError(`Division challenge ${id}:${task.step} has invalid authored givens.`);

  // A supplied total belongs to the question. If an older authored task omitted
  // it, the inverse relationship recovers that known whole from its tested
  // answer and the independently given factor; it never pre-fills the unknown.
  const labels = {
    groups: { rows: 'Number of equal groups', columns: 'Objects in each group' },
    share: { rows: 'Number of equal groups', columns: 'Objects in every group' },
    'column-share': { rows: 'Objects in each column', columns: 'Number of equal columns' },
    total: { rows: 'Number of equal groups', columns: 'Objects in every group' }
  }[mode];
  const handsOn = {
    type: 'division', mode, groupKey, shareKey, ...given,
    targetLabel: mode === 'total' ? 'Build the stated groups and count the whole' : mode === 'groups' ? 'Build the number of equal groups' : 'Build the equal share in every group'
  };
  const visual = { ...p, rows: fixedKey === 'rows' ? known : 0, columns: fixedKey === 'columns' ? known : 0,
    unknownKey: variableKey, answerKeys: { value: mode === 'total' ? 'total' : variableKey }, divisionBuilder: { ...handsOn } };
  if (given.givenTotal !== undefined) visual.targetTotal = given.givenTotal;
  else delete visual.targetTotal;
  const inputs = [control('rows', labels.rows, visual.rows, fixedKey === 'rows'), control('columns', labels.columns, visual.columns, fixedKey === 'columns')];
  const answer = mode === 'total'
    ? { kind: 'number', label: task.answer.label || 'Objects in the whole', derived: { kind: 'product', keys: ['rows', 'columns'] } }
    : { ...task.answer, key: variableKey };
  return { ...task, visual, inputs, answer, handsOn };
}
