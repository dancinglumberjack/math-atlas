import test from 'node:test';
import assert from 'node:assert/strict';
import {missions} from '../src/adventure-model.mjs';
import {grades,topics,missionPlacement,filterMissions,missionSources,learningSources} from '../src/curriculum-map.mjs';

test('every activity has valid grade and subject navigation without changing its identity',()=>{
  for(const mission of missions){
    const value=missionPlacement(mission);
    assert.ok(value.gradeIds.length,mission.id);
    value.gradeIds.forEach(id=>assert.ok(grades.some(g=>g.id===id),mission.id+' grade '+id));
    assert.ok(topics.some(t=>t.id===value.topicId),mission.id);
    assert.deepEqual(missionPlacement(mission.id),value);
  }
  for(const grade of grades)assert.ok(filterMissions({gradeId:grade.id}).length,grade.label+' has available explorations');
});
test('adapted activities retain the exact first-edition source, license, and changes',()=>{
  const adapted=missions.filter(m=>m.sourceIds?.length);
  assert.equal(adapted.length,4);
  for(const m of adapted){
    assert.equal(missionSources(m).length,m.sourceIds.length);
    for(const source of missionSources(m)){
      assert.ok(source.url.startsWith('https://im.kendallhunt.com/k5/teachers/grade-3/'));
      assert.match(source.attribution,/2021 Illustrative Mathematics/);
      assert.equal(source.licenseUrl,'https://creativecommons.org/licenses/by/4.0/');
      assert.ok(source.changes.length>50);
    }
  }
  assert.equal(learningSources.length,2);
});
test('Grade 3 multiplication and division stay separate and all-filter restores the stage',()=>{
  for(const topicId of ['multiplication','division']){
    const found=filterMissions({gradeId:'3',topicId,bandId:'middle'});
    assert.ok(found.length>0,topicId);
    assert.ok(found.every(m=>missionPlacement(m).gradeIds.includes('3')&&missionPlacement(m).topicId===topicId));
  }
  assert.deepEqual(filterMissions({bandId:'early'}),missions.filter(m=>m.bandId==='early'));
  assert.deepEqual(filterMissions({gradeId:'unknown'}),[]);
  assert.deepEqual(filterMissions({gradeId:'3',topicId:'unknown'}),[]);
});
