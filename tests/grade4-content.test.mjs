import test from 'node:test';
import assert from 'node:assert/strict';
import {g4Missions,g4TaskFor,g4Concepts,g4Units} from '../src/grade4-content.mjs';
import {checkTask} from '../src/adventure-model.mjs';

// Independently hand-worked canonical values, not calculated from task formulas.
const answers={
  'place-shift':['10',4000,420],
  'read-million':['expanded','305','less'],
  'round-big':['350000','350000','1000000'],
  'add-sub-bundles':[5045,1577,4368],
  'times-tens':[240,300,'groups'],
  'four-digit-times':[3000,612,3612],
  'area-products':[200,122,322],
  'multiplication-story':[144,48,192],
  'share-hundreds':[100,8,108],
  'quotient-chunks':[20,6,26],
  'remainder-meaning':[4,'5','5'],
  'divide-check':[35,'check','too-many'],
  'factor-pairs':[8,'pair','4'],
  'prime-composite':['prime','composite','neither'],
  'times-as-many':[28,21,4],
  'pattern-rule':[11,14,'alternate'],
  'equivalent-parts':['4','equal',2/3],
  'compare-fractions':['less','greater','equal'],
  'join-fractions':[5/8,1/4,3/4],
  'mixed-parts':[5/4,7/4,5/4],
  'fraction-times':[3/4,3/2,2],
  'fraction-story':[3/4,1,'0to1'],
  'tenths-hundredths':['30',.3,.37],
  'decimal-order':['greater','equal','less'],
  'unit-conversions':['300','2000','120'],
  'measurement-story':[2000,1000,3000],
  'fraction-plot':['4','0.5','3'],
  'area-perimeter':[40,26,5],
  'angle-tool':[40,'acute',50],
  'line-properties':['parallel','perpendicular','2'],
  'symmetry-folds':['4','2','yes'],
  'shape-families':['right-triangle','yes','two-pairs']
};

test('32 original Grade 4 activities form eight connected units with authored teaching notes',()=>{
  assert.equal(g4Missions.length,32);
  assert.equal(new Set(g4Missions.map(m=>m.id)).size,32);
  assert.deepEqual(g4Missions.map(m=>m.id).sort(),Object.keys(answers).map(s=>'g4y-'+s).sort());
  assert.equal(g4Units.length,8);
  assert.deepEqual(g4Units.map(u=>u.weeks),[4,5,5,5,5,4,4,4]);
  assert.equal(g4Units.reduce((s,u)=>s+u.weeks,0),36);
  assert.deepEqual(g4Units.flatMap(u=>u.missionIds),g4Missions.map(m=>m.id));
  for(const [index,u] of g4Units.entries()){
    assert.equal(u.id,`g4-unit-${index+1}`);assert.equal(u.sequence,index+1);assert.equal(u.missionIds.length,4);
    assert.deepEqual(u.prerequisiteMissionIds,[]);assert.deepEqual(u.reviewMissionIds,[]);
    for(const key of ['methods','prerequisiteSkills','everydayPractice','sourceUrls'])assert.ok(u[key].length>0);
    assert.ok(u.sourceUrls.every(url=>url.startsWith('https://www.thecorestandards.org/Math/Content/4/')));
  }
  for(const m of g4Missions){
    assert.deepEqual(m.gradeIds,['4']);assert.equal(m.bandId,'elementary');assert.match(m.unitId,/^g4-unit-[1-8]$/);
    assert.ok(g4Concepts.some(c=>c.id===m.conceptKey&&c.id===m.conceptId));
    assert.deepEqual(m.sourceIds,[]);
    assert.ok(m.standards.length>0&&m.standards.every(s=>/^4\.(NBT|OA|NF|MD|G)\.[A-C]\.[1-7][a-d]?$/.test(s)),m.id);
    for(const key of ['goal','prerequisite','workedExample','explainPrompt','reviewPrompt'])assert.ok(m.lessonPlan[key].length>=20,m.id+' '+key);
    assert.ok(!/certified|mastery achieved|CA.aligned/i.test(m.goal));
  }
});

test('all 96 canonical Grade 4 challenges match independent literal answer keys',()=>{
  for(const [suffix,expected]of Object.entries(answers))for(let step=0;step<3;step++){
    const task=g4TaskFor('g4y-'+suffix,step,1);
    assert.deepEqual(task.expected,expected[step],suffix+':'+step);
    assert.equal(checkTask(task,expected[step]).correct,true,suffix+':'+step);
  }
});

test('32 additional hand-worked seed-two examples cover every Grade 4 activity',()=>{
  const variants=[
    ['place-shift',1,60000],['read-million',1,'640'],['round-big',0,'580000'],
    ['add-sub-bundles',0,7824],['times-tens',0,210],['four-digit-times',0,8000],
    ['area-products',0,300],['multiplication-story',0,128],['share-hundreds',1,42],
    ['quotient-chunks',1,4],['remainder-meaning',0,6],['divide-check',0,43],
    ['factor-pairs',0,12],['prime-composite',0,'prime'],['times-as-many',0,24],
    ['pattern-rule',0,13],['equivalent-parts',0,'6'],['compare-fractions',0,'less'],
    ['join-fractions',0,5/6],['mixed-parts',0,4/3],['fraction-times',0,2/3],
    ['fraction-story',0,4/3],['tenths-hundredths',2,.64],['decimal-order',0,'greater'],
    ['unit-conversions',0,'400'],['measurement-story',0,3000],['fraction-plot',2,'2.25'],
    ['area-perimeter',0,36],['angle-tool',2,25],['line-properties',0,'perpendicular'],
    ['symmetry-folds',0,'4'],['shape-families',0,'acute-triangle']
  ];
  assert.equal(variants.length,32);
  assert.equal(new Set(variants.map(v=>v[0])).size,32);
  for(const [suffix,step,expected]of variants)assert.deepEqual(g4TaskFor('g4y-'+suffix,step,2).expected,expected,suffix);
});

test('bounded Grade 4 variations are deterministic, finite, reachable, and initially unfinished',()=>{
  for(const m of g4Missions)for(const seed of [-8,-1,0,1,2,3,17,Number.MAX_SAFE_INTEGER])for(let step=0;step<3;step++){
    const t=g4TaskFor(m.id,step,seed);
    assert.deepEqual(t,g4TaskFor(m.id,step,seed));
    assert.equal(checkTask(t,t.expected).correct,true);
    for(const key of ['prompt','instruction','hint','explanation','why'])assert.ok(t[key].length>0&&!/undefined|NaN/.test(t[key]),m.id+':'+step+' '+key);
    assert.ok(t.prompt.length<230,m.id+' short prompt');
    if(t.answer.kind==='choice'){
      assert.ok(t.choices.length>=2);assert.equal(new Set(t.choices.map(c=>c.value)).size,t.choices.length,m.id);
      assert.ok(t.choices.some(c=>c.value===t.expected));continue;
    }
    assert.equal(t.answer.kind,'number');assert.equal(t.answer.key,'response');assert.ok(Number.isFinite(t.expected)&&t.expected>=0&&t.expected<=1000000);
    assert.equal(t.inputs.length,1);const c=t.inputs[0];
    assert.equal(c.key,'response');assert.ok([c.min,c.max,c.initial,c.step].every(Number.isFinite));
    assert.ok(c.min<=c.initial&&c.initial<=c.max&&c.step>0);
    assert.ok(t.expected>=c.min&&t.expected<=c.max,m.id+':'+step+' reachable');
    assert.ok(Math.abs((t.expected-c.min)/c.step-Math.round((t.expected-c.min)/c.step))<1e-7,m.id+':'+step+' valid step');
    assert.equal(checkTask(t,c.initial).correct,false,m.id+':'+step+' starts unfinished');
    assert.ok(['response','fraction'].includes(t.visual.answerKeys.value));
    if(t.visual.answerKeys.value==='fraction'){
      assert.ok([2,3,4,5,6,8,10,12,100].includes(t.visual.responseDenominator));
      assert.ok(t.visual.maxWholes>=c.max,'The entire fractional trial range has matching whole units');
    }
  }
});

test('division chunks conserve the whole and remainders fit their divisor',()=>{
  for(const suffix of ['share-hundreds','quotient-chunks','remainder-meaning','divide-check'])for(const seed of [1,2,3])for(let step=0;step<3;step++){
    const t=g4TaskFor('g4y-'+suffix,step,seed),v=t.visual;
    assert.equal(v.kind,'quotient');assert.ok(v.total>=0&&v.total<=9999);assert.ok(v.divisor>=1&&v.divisor<=9);
    const used=v.chunks.reduce((sum,q)=>sum+q*v.divisor,0);
    assert.ok(used<=v.total,'Authored chunks cannot use more than the available whole');
    const q=Math.floor(v.total/v.divisor),r=v.total%v.divisor;
    assert.equal(q*v.divisor+r,v.total);assert.ok(r>=0&&r<v.divisor);
    if(suffix==='remainder-meaning'&&step===0)assert.equal(t.expected,q);
    if(suffix==='remainder-meaning'&&step===1)assert.equal(Number(t.expected),r);
    if(suffix==='remainder-meaning'&&step===2)assert.equal(Number(t.expected),q+1,'Every rider needs a seat');
  }
});

test('Grade 4 visual quantities use valid fractional units, exact parts, and meaningful measure ranges',()=>{
  const allowedDen=[2,3,4,5,6,8,10,12,100];
  for(const m of g4Missions)for(const seed of [1,2,3])for(let step=0;step<3;step++){
    const v=g4TaskFor(m.id,step,seed).visual;
    if(v.kind==='place-value')assert.ok(Number.isInteger(v.value)&&v.value>=0&&v.value<=1000000);
    if(v.kind==='product-area'){
      assert.ok(v.rows.length>0&&v.columns.length>0);
      assert.ok([...v.rows,...v.columns].every(n=>Number.isInteger(n)&&n>0));
      assert.ok(v.rows.reduce((a,b)=>a+b,0)*v.columns.reduce((a,b)=>a+b,0)<=10000);
    }
    if(v.kind==='fraction-bars'){
      assert.ok(v.maxWholes>=1&&v.maxWholes<=3);
      for(const b of v.bars){assert.ok(allowedDen.includes(b.den));assert.ok(Number.isInteger(b.num)&&b.num>=0&&b.num/b.den<=v.maxWholes);}
      if(v.partitionDen)assert.ok(allowedDen.includes(v.partitionDen));
    }
    if(v.kind==='decimal-grid')assert.ok(v.value>=0&&v.value<=3&&v.places===2);
    if(v.kind==='angle'){
      assert.ok(v.degrees>=0&&v.degrees<=180);
      if(v.splitAt!==undefined)assert.ok(v.splitAt>0&&v.splitAt<v.degrees);
    }
    if(v.kind==='unit-conversion'){
      assert.ok(v.amount>0&&Number.isInteger(v.amount)&&[60,100,1000].includes(v.factor));
      assert.ok(v.fromUnit&&v.toUnit);assert.equal(v.showResult,false,'A quiz model does not print the calculated total');
    }
    if(v.type==='data')assert.ok(v.values.length===4&&v.values.every(n=>n>=v.min&&n<=v.max));
  }
});

test('rounding includes halfway cases and a correct route to one million',()=>{
  assert.equal(g4TaskFor('g4y-round-big',1,1).expected,'350000');
  assert.equal(g4TaskFor('g4y-round-big',1,2).expected,'590000');
  assert.equal(g4TaskFor('g4y-round-big',1,3).expected,'730000');
  assert.equal(g4TaskFor('g4y-round-big',2,1).expected,'1000000');
  assert.equal(g4TaskFor('g4y-round-big',2,2).expected,'900000');
  assert.equal(g4TaskFor('g4y-round-big',2,3).expected,'800000');
});

test('15 coherent Grade 4 introductions have separate worked examples and compatible bands',()=>{
  assert.equal(g4Concepts.length,15);
  assert.equal(new Set(g4Concepts.map(c=>c.id)).size,15);
  assert.ok(g4Concepts.some(c=>c.id==='g4-prime-composite'));
  assert.ok(g4Concepts.some(c=>c.id==='g4-fraction-plots'));
  assert.ok(g4Concepts.some(c=>c.id==='g4-symmetry'));
  for(const c of g4Concepts){
    assert.deepEqual(c.bandIds,['elementary']);assert.ok(c.steps.length>=3&&c.steps.length<=4);assert.ok(c.parentTip.length>30);
    assert.deepEqual(c.missionIds,g4Missions.filter(m=>m.conceptKey===c.id).map(m=>m.id));
    for(const s of c.steps){
      for(const key of ['title','body','caption','actionLabel'])assert.ok(typeof s[key]==='string'&&s[key].length>0&&!/undefined|NaN/.test(s[key]));
      assert.equal(Object.hasOwn(s,'expected'),false);assert.ok(s.visual.type);
    }
  }
});

test('Grade 4 lookup and bounded challenge arguments reject unsupported inputs',()=>{
  assert.equal(g4TaskFor('not-a-grade-four-mission'),null);
  for(const step of [-1,3,.5,NaN])assert.throws(()=>g4TaskFor(g4Missions[0].id,step),RangeError);
  for(const seed of [Infinity,NaN,.5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>g4TaskFor(g4Missions[0].id,0,seed),TypeError);
});
