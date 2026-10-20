import { createPetState, normalizePetState } from './pets-model.mjs';

export const JOURNEY_KEY = 'math-atlas-journey-v1';
const bands = ['pre-k', 'early', 'elementary', 'middle', 'high', 'college'];
const themes = ['garden', 'workshop', 'studio', 'observatory'];
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const clone = value => JSON.parse(JSON.stringify(value));
const bounded = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
const validId = value => typeof value === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(value);

export function initialJourney() {
  return { version: 1, completed: {}, lessonPractice: {}, inProgress: null, preferences: { calm: false, rewards: true, theme: 'garden', bandId: 'middle' }, weeklyGoal: 3, pet: createPetState() };
}

export function normalizeJourney(input) {
  const base = initialJourney();
  if (!plain(input)) return base;
  const completed = {};
  if (plain(input.completed)) for (const [id, entry] of Object.entries(input.completed).slice(0, 500)) {
    if (!validId(id) || !plain(entry) || !Number.isFinite(Date.parse(entry.completedAt))) continue;
    completed[id] = { completedAt: new Date(entry.completedAt).toISOString(), supported: Boolean(entry.supported), steps: Math.floor(bounded(entry.steps, 0, 100, 3)) };
  }
  const lessonPractice = {};
  if (plain(input.lessonPractice)) for (const [id, date] of Object.entries(input.lessonPractice).slice(0, 500)) {
    if (validId(id) && Number.isFinite(Date.parse(date))) lessonPractice[id] = new Date(date).toISOString();
  }
  const p = plain(input.preferences) ? input.preferences : {};
  let inProgress = null;
  if (plain(input.inProgress) && validId(input.inProgress.missionId)) {
    const answers = input.inProgress.answers;
    const manipulated = input.inProgress.manipulated;
    // Answers are private practice data, bounded to a single short mission.
    const safeAnswers = (plain(answers) || Array.isArray(answers)) && JSON.stringify(answers).length < 24000 ? clone(answers) : {};
    const safeManipulated = plain(manipulated) && JSON.stringify(manipulated).length < 12000 ? clone(manipulated) : {};
    inProgress = { missionId: input.inProgress.missionId, step: Math.floor(bounded(input.inProgress.step, 0, 100, 0)), seed: Math.floor(bounded(input.inProgress.seed, 1, 2147483646, 1)), answers: safeAnswers, manipulated: safeManipulated };
  }
  return { version: 1, completed, lessonPractice, inProgress, preferences: { calm: Boolean(p.calm), rewards: p.rewards !== false, theme: themes.includes(p.theme) ? p.theme : 'garden', bandId: bands.includes(p.bandId) ? p.bandId : 'middle' }, weeklyGoal: [1, 3, 5, 7].includes(Number(input.weeklyGoal)) ? Number(input.weeklyGoal) : 3, pet: normalizePetState(input.pet) };
}

export function createJourney(storage, now = () => new Date()) {
  let available = Boolean(storage), state = initialJourney();
  const listeners = new Set();
  try { const stored = storage?.getItem(JOURNEY_KEY); if (stored) state = normalizeJourney(JSON.parse(stored)); } catch { available = false; }
  function refresh(notify = true) {
    if (available) try {
      const stored = storage.getItem(JOURNEY_KEY);
      const next = stored ? normalizeJourney(JSON.parse(stored)) : initialJourney();
      if (JSON.stringify(next) !== JSON.stringify(state)) {
        state = next;
        if (notify) for (const listener of listeners) try { listener(clone(state)); } catch {}
      }
    } catch { available = false; }
    return clone(state);
  }
  function save(next) {
    state = normalizeJourney(next);
    if (available) try { storage.setItem(JOURNEY_KEY, JSON.stringify(state)); } catch { available = false; }
    for (const listener of listeners) try { listener(clone(state)); } catch { /* A display subscriber cannot stop saving. */ }
    return clone(state);
  }
  function update(partial) {
    if (!plain(partial)) return clone(state);
    refresh(false);
    return save({ ...state, ...partial, preferences: { ...state.preferences, ...(plain(partial.preferences) ? partial.preferences : {}) } });
  }
  function completeMission(id, detail = {}) {
    if (!validId(id)) throw new TypeError('Invalid mission');
    refresh(false);
    // Replays are welcome; first completion earns one stamp and one coin award.
    if (Object.hasOwn(state.completed, id)) return update({ inProgress: null });
    const entry = { completedAt: now().toISOString(), supported: Boolean(detail.supported), steps: detail.steps ?? 3 };
    return update({ completed: { ...state.completed, [id]: entry }, inProgress: null, pet: { ...state.pet, coins: state.pet.coins + 15 } });
  }
  function completePractice(id) {
    if (!validId(id)) throw new TypeError('Invalid lesson');
    refresh(false);
    if (Object.hasOwn(state.lessonPractice, id)) return clone(state);
    return update({ lessonPractice: { ...state.lessonPractice, [id]: now().toISOString() }, pet: { ...state.pet, coins: state.pet.coins + 5 } });
  }
  return Object.freeze({ load: () => refresh(false), save, update, refresh, completeMission, completePractice, storageAvailable: () => available, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }, reset: () => save(initialJourney()) });
}
