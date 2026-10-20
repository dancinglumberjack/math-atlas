import test from 'node:test';
import assert from 'node:assert/strict';
import { createJourney, normalizeJourney, JOURNEY_KEY } from '../src/journey.mjs';

function memory() { const values = new Map(); return { getItem: k => values.get(k), setItem: (k,v) => values.set(k,v) }; }
test('a mission earns one stamp and one coin award even after reload and replay', () => {
  const storage = memory(), clock = () => new Date('2026-10-20T12:00:00Z');
  const journey = createJourney(storage, clock), before = journey.load().pet.coins;
  journey.update({ inProgress: { missionId: 'garden-start', step: 2, seed: 43, answers: {0:{answer:6,correct:true,supported:true}}, manipulated: {0:{blue:6}} } });
  const resumed = createJourney(storage, clock);
  assert.equal(resumed.load().inProgress.step, 2);
  assert.equal(resumed.load().inProgress.answers[0].supported, true);
  resumed.completeMission('garden-start', { supported: true, steps: 3 });
  assert.equal(resumed.load().pet.coins, before + 15);
  assert.equal(resumed.load().completed['garden-start'].supported, true);
  assert.equal(resumed.load().inProgress, null);
  const replay = createJourney(storage, clock);
  replay.completeMission('garden-start', {supported:false});
  assert.equal(replay.load().pet.coins, before + 15);
  assert.equal(Object.keys(replay.load().completed).length, 1);
  assert.equal(replay.load().completed['garden-start'].supported, true);
});
test('pet purchases and reading/story preferences do not erase each other or mission progress', () => {
  const journey = createJourney(memory());
  journey.completeMission('meadow-count');
  journey.update({preferences:{bandId:'pre-k',calm:true}});
  journey.update({pet:{...journey.load().pet,coins:5}});
  assert.equal(journey.load().preferences.bandId,'pre-k');
  assert.equal(journey.load().preferences.calm,true);
  assert.ok(journey.load().completed['meadow-count']);
  const detached=journey.load(); detached.pet.coins=999999; assert.equal(journey.load().pet.coins,5);
});
test('storage denial and malformed saves leave a usable in-memory journey', () => {
  const denied=createJourney({getItem(){throw Error('denied')},setItem(){throw Error('denied')}});
  denied.completeMission('meadow-count');
  assert.equal(denied.storageAvailable(),false);
  assert.ok(denied.load().completed['meadow-count']);
  const storage=memory(); storage.setItem(JOURNEY_KEY,'{');
  assert.equal(createJourney(storage).load().version,1);
  const repaired=normalizeJourney({preferences:{bandId:'unknown',theme:'unknown'},inProgress:{missionId:'<script>'},completed:{bad:{completedAt:'not-a-date'}},weeklyGoal:999});
  assert.equal(repaired.preferences.bandId,'middle');assert.equal(repaired.inProgress,null);assert.equal(repaired.weeklyGoal,3);assert.deepEqual(repaired.completed,{});
});
test('saving failures and broken display subscribers do not lose current-session progress', () => {
  const journey=createJourney({getItem(){return null},setItem(){throw Error('quota')}});
  let heard=0; journey.subscribe(()=>{throw Error('display')}); const unsubscribe=journey.subscribe(()=>heard++);
  journey.completeMission('test-mission'); unsubscribe(); journey.update({weeklyGoal:5});
  assert.equal(heard,1);assert.equal(journey.storageAvailable(),false);assert.equal(journey.load().weeklyGoal,5);
  assert.throws(()=>journey.completeMission('../escape'));
});
test('library practice has its own one-time award and is not recorded as a three-step mission', () => {
  const storage=memory(), journey=createJourney(storage), before=journey.load().pet.coins;
  journey.completePractice('slope');journey.completePractice('slope');
  const restored=createJourney(storage);restored.completePractice('slope');
  assert.equal(restored.load().pet.coins,before+5);
  assert.deepEqual(restored.load().completed,{});
  assert.ok(restored.load().lessonPractice.slope);
});
test('two open pages preserve a collection purchase and share one-time learning awards', () => {
  const storage=memory(), library=createJourney(storage), adventure=createJourney(storage);
  adventure.completeMission('meadow-count');
  const purchased=adventure.load().pet;
  adventure.update({pet:{...purchased,coins:purchased.coins-12,owned:[...purchased.owned,'leaf-charm']}});
  library.completePractice('slope');
  assert.ok(library.load().pet.owned.includes('leaf-charm'));
  assert.equal(library.load().pet.coins,20+15-12+5);
  assert.equal(adventure.load().pet.coins,20+15-12+5);
  library.completeMission('meadow-count');
  assert.equal(adventure.load().pet.coins,20+15-12+5);
});
test('concept introductions save as viewed without awarding coins or claiming practice', () => {
  const storage=memory(),journey=createJourney(storage),coins=journey.load().pet.coins;
  journey.markConceptSeen('fractions');journey.markConceptSeen('fractions');
  const restored=createJourney(storage);
  assert.ok(restored.load().conceptSeen.fractions);
  assert.equal(restored.load().pet.coins,coins);
  assert.deepEqual(restored.load().completed,{});
  restored.reset();assert.deepEqual(restored.load().conceptSeen,{});
});
test('grade and topic choices survive reload alongside a paused activity',()=>{
  const storage=memory(),journey=createJourney(storage);
  journey.update({preferences:{gradeId:'3',topicId:'division',bandId:'elementary'},inProgress:{missionId:'meadow-count',step:1,seed:2,answers:{},manipulated:{}}});
  const restored=createJourney(storage).load();
  assert.equal(restored.preferences.gradeId,'3');assert.equal(restored.preferences.topicId,'division');
  assert.equal(restored.inProgress.missionId,'meadow-count');
  assert.equal(normalizeJourney({preferences:{gradeId:'999',topicId:'<script>'}}).preferences.gradeId,'all');
});
