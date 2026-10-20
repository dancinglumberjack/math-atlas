import test from 'node:test';
import assert from 'node:assert/strict';
import {upperYears} from '../src/upper-year.mjs';
import {upperMissions,upperConcepts,upperTaskFor} from '../src/upper-content.mjs';
import {schoolYearForGrade,unitForMission,orderedMissions,nextInYear} from '../src/school-year.mjs';
import {missions,taskFor} from '../src/adventure-model.mjs';
import {filterMissions,missionPlacement,topicById} from '../src/curriculum-map.mjs';
import {conceptFor} from '../src/concepts-model.mjs';

test('Grades4 and5 each preserve the available inventory once in eight flexible units',()=>{
 for(const year of upperYears){
  const grade=year.gradeId,ids=year.units.flatMap(u=>u.missionIds);
  assert.equal(schoolYearForGrade(grade),year);assert.equal(schoolYearForGrade(Number(grade)),year);
  assert.equal(year.units.length,8);assert.equal(year.units.reduce((n,u)=>n+u.weeks,0),36);
  assert.equal(ids.length,grade==='4'?46:35);assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(ids.slice().sort(),filterMissions({gradeId:grade}).map(m=>m.id).sort());
  assert.deepEqual(orderedMissions(missions,grade).map(m=>m.id),ids);
  for(const unit of year.units){
   assert.equal(unit.reviewMissionIds.length,3);
   for(const id of unit.missionIds)assert.equal(unitForMission(id,grade),unit);
   for(const id of unit.reviewMissionIds)assert.ok(unitForMission(id,grade).sequence<=unit.sequence);
   for(const id of unit.prerequisiteMissionIds)assert.ok(unitForMission(id,grade).sequence<unit.sequence);
   for(const field of ['methods','everydayPractice','sourceUrls'])assert.ok(unit[field].length>0,unit.id+': '+field);
  }
  const first=ids[0],later=year.units[6].missionIds[0];assert.equal(nextInYear({},grade).missionId,first);assert.equal(nextInYear({inProgress:{missionId:later}},grade).missionId,later);
  assert.equal(nextInYear({completed:Object.fromEntries(ids.map(id=>[id,true]))},grade),null);
 }
});
test('all upper lessons connect a valid grade, topic, unit, visual introduction, and original lesson plan',()=>{
 assert.equal(upperMissions.length,64);assert.equal(new Set(upperMissions.map(m=>m.id)).size,64);
 for(const m of upperMissions){
  const grade=m.gradeIds[0];assert.ok(['4','5'].includes(grade));assert.ok(topicById(m.topicId));assert.equal(missionPlacement(m).topicId,m.topicId);
  assert.equal(unitForMission(m.id,grade).id,m.unitId);assert.equal(conceptFor(m).id,m.conceptKey||m.conceptId);
  assert.deepEqual(m.sourceIds,[]);assert.ok(m.standards.every(s=>s.startsWith(grade+'.')));
  for(const key of ['goal','prerequisite','workedExample','explainPrompt','reviewPrompt'])assert.ok(m.lessonPlan[key].length>10,m.id+': '+key);
  for(const seed of [1,2,3])for(let step=0;step<3;step++)assert.deepEqual(taskFor(m.id,step,seed),upperTaskFor(m.id,step,seed));
 }
 assert.ok(upperConcepts.length>=20);assert.equal(new Set(upperConcepts.map(c=>c.id)).size,upperConcepts.length);
});
