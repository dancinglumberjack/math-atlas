import test from 'node:test';
import assert from 'node:assert/strict';
import {primaryYears} from '../src/primary-year.mjs';
import {schoolYearForGrade,unitForMission,orderedMissions,nextInYear} from '../src/school-year.mjs';
import {missions,taskFor} from '../src/adventure-model.mjs';
import {filterMissions,missionPlacement} from '../src/curriculum-map.mjs';

test('K, Grade1, and Grade2 each have six flexible units and preserve every correctly placed activity once',()=>{
 const totals={k:39,'1':36,'2':37};
 for(const year of primaryYears){
  const grade=year.gradeId,ids=year.units.flatMap(u=>u.missionIds);
  assert.equal(schoolYearForGrade(grade),year);assert.equal(year.units.length,6);assert.equal(year.units.reduce((n,u)=>n+u.weeks,0),36);
  assert.equal(ids.length,totals[grade]);assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(ids.slice().sort(),filterMissions({gradeId:grade}).map(m=>m.id).sort());
  assert.deepEqual(orderedMissions(missions,grade).map(m=>m.id),ids);
  for(const unit of year.units){
   assert.equal(unit.reviewMissionIds.length,3);
   for(const id of unit.missionIds)assert.equal(unitForMission(id,grade),unit);
   for(const id of unit.reviewMissionIds)assert.ok(unitForMission(id,grade).sequence<=unit.sequence);
   for(const id of unit.prerequisiteMissionIds)assert.ok(unitForMission(id,grade).sequence<unit.sequence);
  }
  const first=year.units[0].missionIds[0],later=year.units[4].missionIds[0];assert.equal(nextInYear({},grade).missionId,first);assert.equal(nextInYear({inProgress:{missionId:later}},grade).missionId,later);
 }
});
test('K operation practice keeps all three replay variants within ten while larger subtraction stays in Grade1',()=>{
 assert.ok(!missionPlacement('meadow-subtract').gradeIds.includes('k'));
 assert.ok(!missionPlacement('pond-doubles').gradeIds.includes('k'));
 for(const mission of filterMissions({gradeId:'k'}).filter(m=>['addition','subtraction'].includes(missionPlacement(m).topicId)))for(const seed of[1,2,3])for(let step=0;step<3;step++){
  const task=taskFor(mission.id,step,seed);if(typeof task.expected==='number')assert.ok(task.expected>=0&&task.expected<=10,mission.id);
  if(task.visual.type==='blocks')assert.ok(task.visual.start<=10);
  if(task.visual.type==='count')assert.ok(task.visual.count<=10);
 }
});
