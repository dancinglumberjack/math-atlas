import test from 'node:test';
import assert from 'node:assert/strict';
import { yearConcepts } from '../src/year-concepts.mjs';

const get = id => yearConcepts.find(concept => concept.id === id);
const visuals = id => get(id).steps.map(step => step.visual);
const value = v => 100*v.hundreds + 10*v.tens + v.ones;

test('each new Grade 3 idea has its own short, ungraded teaching sequence',()=>{
  const required=['g3-place-value','g3-rounding','g3-regroup-add','g3-regroup-subtract','g3-fraction-line','g3-fraction-whole','g3-fraction-compare','g3-capacity','g3-mass','g3-scaled-data','g3-line-plot','g3-shape-families','g3-grouped-products','g3-minute-clock','g3-elapsed-minutes'];
  assert.deepEqual(yearConcepts.map(c=>c.id),required);
  assert.equal(new Set(required).size,15);
  for(const c of yearConcepts){
    assert.deepEqual(c.bandIds,['elementary']);
    assert.ok(c.steps.length>=3&&c.steps.length<=4);
    assert.ok(c.title.length>8&&c.parentTip.length>30);
    for(const s of c.steps){
      for(const key of ['title','body','caption','actionLabel'])assert.ok(typeof s[key]==='string'&&s[key].trim().length>0&&!/undefined|NaN/.test(s[key]),c.id+' '+key);
      assert.equal(Object.hasOwn(s,'expected'),false,'A worked example is not a practice score');
      assert.equal(typeof s.visual.type,'string');
      assert.doesNotThrow(()=>JSON.stringify(s.visual));
    }
  }
});

test('place-value renaming conserves the complete collection',()=>{
  const v=visuals('g3-place-value');
  assert.equal(value(v[0]),100);
  for(const x of v.slice(1))assert.equal(value(x),243);
  assert.equal(v[2].hundreds,v[1].hundreds-1);
  assert.equal(v[2].tens,v[1].tens+10);
  assert.equal(v[3].tens,v[1].tens-1);
  assert.equal(v[3].ones,v[1].ones+10);
});

test('regrouping addition trades both ones and tens without losing value',()=>{
  const [start,combined,onesTraded,tensTraded]=visuals('g3-regroup-add');
  assert.equal(value(start),276);
  for(const x of [combined,onesTraded,tensTraded])assert.equal(value(x),276+158);
  assert.equal(onesTraded.ones,combined.ones-10);
  assert.equal(onesTraded.tens,combined.tens+1);
  assert.equal(tensTraded.tens,onesTraded.tens-10);
  assert.equal(tensTraded.hundreds,onesTraded.hundreds+1);
});

test('subtraction across a zero trades before removing the stated amount',()=>{
  const [start,hundredOpened,tenOpened,result]=visuals('g3-regroup-subtract');
  for(const x of [start,hundredOpened,tenOpened])assert.equal(value(x),302);
  assert.equal(hundredOpened.hundreds,start.hundreds-1);
  assert.equal(hundredOpened.tens,start.tens+10);
  assert.equal(tenOpened.tens,hundredOpened.tens-1);
  assert.equal(tenOpened.ones,hundredOpened.ones+10);
  assert.equal(value(result),156);
  assert.equal(value(tenOpened)-value(result),146);
  assert.deepEqual([tenOpened.hundreds-result.hundreds,tenOpened.tens-result.tens,tenOpened.ones-result.ones],[1,4,6]);
});

test('temporary trade counts are explicit and fit their teaching-only range',()=>{
  for(const c of yearConcepts)for(const s of c.steps){
    const v=s.visual;if(v.type!=='base-ten')continue;
    for(const key of ['hundreds','tens','ones'])assert.ok(Number.isInteger(v[key])&&v[key]>=0);
    assert.ok(v.hundreds<=9);
    assert.ok(v.tens<=(v.teachingTrade?19:9));
    assert.ok(v.ones<=(v.teachingTrade?19:9));
    if(v.tens>9||v.ones>9)assert.equal(v.teachingTrade,true,'Nonstandard bundle names must not be silently clamped');
  }
});

test('rounding examples compare both distances and state the halfway convention',()=>{
  const expected=[150,150,100,150];
  visuals('g3-rounding').forEach((v,i)=>{
    const lower=Math.abs(v.end-v.min),upper=Math.abs(v.max-v.end);
    assert.equal(lower<upper?v.min:v.max,expected[i]);
    assert.equal(v.min%v.roundTo,0);
    assert.equal(v.max-v.min,v.roundTo);
  });
  assert.match(get('g3-rounding').steps[1].body,/equally|halfway/);
  assert.match(get('g3-rounding').steps[1].body,/greater benchmark/);
});

test('fraction lengths preserve the unit interval and continue beyond one',()=>{
  const line=visuals('g3-fraction-line');
  for(const v of line){
    assert.equal(v.min,0);assert.equal(v.max,2);
    assert.equal(v.fractionDenominator,4);assert.equal(v.tickStep,1/4);
    assert.ok(Number.isInteger(v.end/v.tickStep));
  }
  assert.equal(line[2].moves.reduce((a,b)=>a+b,0),3/4);
  assert.equal(line[3].moves.reduce((a,b)=>a+b,0),5/4);
  assert.ok(line[3].end>1);
  const whole=visuals('g3-fraction-whole');
  assert.deepEqual(whole.map(v=>v.end),[4/4,8/4,2/1]);
  assert.equal(whole[0].fractionDenominator,4);
  assert.equal(whole[2].fractionDenominator,1);
});

test('fraction comparisons keep identical wholes and distinguish count from piece size',()=>{
  const v=visuals('g3-fraction-compare');
  assert.ok(v.every(x=>x.wholeSize===1&&x.selected<=x.parts));
  assert.equal(v[0].parts,v[1].parts);
  assert.ok(v[1].selected/v[1].parts>v[0].selected/v[0].parts);
  assert.equal(v[0].selected/v[0].parts,v[2].selected/v[2].parts);
  assert.equal(v[2].selected,v[3].selected);
  assert.ok(v[2].selected/v[2].parts>v[3].selected/v[3].parts);
  assert.match(get('g3-fraction-compare').parentTip,/wholes match/);
});

test('liquid and mass examples preserve units and matching scale intervals',()=>{
  const capacity=visuals('g3-capacity');
  assert.deepEqual(capacity.map(v=>v.value),[0,2,3]);
  assert.ok(capacity.every(v=>v.unit==='L'&&v.tickStep===1&&v.value<=v.max));
  assert.equal(capacity[2].value-capacity[1].value,1);
  const mass=visuals('g3-mass');
  assert.ok(mass.slice(0,3).every(v=>v.unit==='g'&&v.tickStep===50));
  assert.equal(mass[0].value+mass[1].value,mass[2].value);
  assert.equal(mass[3].unit,'kg');
  assert.equal(mass[3].value,2);
});

test('picture and bar examples represent the same data using an explicit key',()=>{
  const [single,picture,bar,comparison]=visuals('g3-scaled-data');
  assert.equal(single.key,2);assert.deepEqual(single.values,[2,0,0]);
  assert.deepEqual(picture.values.map(n=>n/picture.key),[3,2,4]);
  assert.deepEqual(picture.values,bar.values);
  assert.deepEqual(bar.values,comparison.values);
  assert.equal(comparison.values[2]-comparison.values[1],4);
  for(const v of [single,picture,bar,comparison])assert.ok(v.values.every(n=>n>=0&&n<=v.max&&Number.isInteger(n/v.key)));
});

test('quarter-inch measurements become one mark per item, including repeated lengths',()=>{
  const [ruler,plot,total]=visuals('g3-line-plot');
  assert.equal(ruler.value,5/4);assert.equal(ruler.tickStep,1/4);
  assert.equal(plot.tickStep,1/4);assert.equal(plot.unit,ruler.unit);
  assert.equal(plot.values.length,5);
  assert.equal(plot.values.filter(x=>x===5/4).length,2);
  assert.deepEqual(plot.values,total.values);
  for(const x of plot.values)assert.ok(x>=plot.min&&x<=plot.max&&Number.isInteger(x*4));
});

test('shape examples include overlapping families and a nonspecial quadrilateral',()=>{
  assert.deepEqual(visuals('g3-shape-families').map(v=>v.target),['rectangle','square','rhombus','trapezoid']);
  assert.match(get('g3-shape-families').steps[1].body,/square.*rectangle/i);
  assert.match(get('g3-shape-families').steps[2].body,/square meets this rule/i);
  assert.match(get('g3-shape-families').steps[3].body,/not a rectangle or a rhombus/);
});

test('grouped products preserve all factors and bridge unit products to products of tens',()=>{
  const [boxes,bags,tens]=visuals('g3-grouped-products');
  assert.equal(boxes.rows*boxes.columns,(3*2)*4);
  assert.equal(bags.rows*bags.columns,3*(2*4));
  assert.equal(boxes.rows*boxes.columns,bags.rows*bags.columns);
  assert.equal(value(tens),6*40);
  assert.equal(value(tens),10*boxes.rows*boxes.columns);
});

test('single-minute clocks count ticks beyond five-minute landmarks',()=>{
  const clocks=visuals('g3-minute-clock');
  assert.deepEqual(clocks.map(v=>[v.hour,v.minute]),[[2,15],[2,18],[2,32]]);
  assert.ok(clocks.every(v=>v.showDigital===true));
  assert.equal(clocks[1].minute,15+3);
  assert.equal(clocks[2].minute,30+2);
});

test('elapsed minutes cross the hour without treating clock digits as decimal arithmetic',()=>{
  const [start,hour,end]=visuals('g3-elapsed-minutes');
  const toMinutes=v=>60*v.hour+v.minute;
  assert.equal(toMinutes(hour)-toMinutes(start),14);
  assert.equal(toMinutes(end)-toMinutes(hour),9);
  assert.equal(toMinutes(end)-toMinutes(start),23);
});
