import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {build} from '../scripts/build.mjs';
import {createPreviewServer} from '../scripts/serve.mjs';
import {missions,taskFor,checkTask} from '../src/adventure-model.mjs';
import {conceptFor} from '../src/concepts-model.mjs';
import {schoolYearForGrade,orderedMissions} from '../src/school-year.mjs';
import {filterMissions} from '../src/curriculum-map.mjs';

// Arithmetic has independent literal answer keys in the content suites. These
// checks use isolated browser storage to exercise the actual lesson controls,
// diagrams, feedback, rewards, grade paths, and reading settings.
build({check:true});
const upperMissions=missions.filter(m=>/^g[45]y-/.test(m.id));
assert.equal(upperMissions.length,64,'32 new lessons each for Grades 4 and 5');
const require=createRequire(import.meta.url);
const {chromium}=process.env.PLAYWRIGHT_MODULE_PATH?require(process.env.PLAYWRIGHT_MODULE_PATH):await import('playwright');
const server=createPreviewServer({basePath:'/math-atlas/'});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port+'/math-atlas/';
const errors=[],failed=[],families=new Set();
let browser;
const missionById=id=>missions.find(m=>m.id===id);
const closeTo=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-7,label+`: ${a} versus ${b}`);
function observe(page){
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>failed.push(r.url()));
  page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});
}
async function ready(page){await page.waitForFunction(()=>window.AtlasAdventure&&window.AtlasJourney&&window.AtlasUpperVisuals&&document.querySelector('[data-mission]'));}
async function freshPage(viewport={width:1440,height:1050}){
  const page=await browser.newPage({viewport});observe(page);await page.goto(base+'adventure.html');await ready(page);return page;
}
async function home(page){
  if(await page.locator('#adventure-intro').isVisible())await page.locator('#concept-exit').click();
  if(await page.locator('#adventure-mission').isVisible())await page.locator('#adventure-pause').click();
  if(await page.locator('#adventure-finish').isVisible())await page.locator('#finish-map').click();
  assert.equal(await page.locator('#adventure-home').isVisible(),true);
}
async function yearMap(page,grade){
  await home(page);await page.locator('#journey-grade').selectOption(grade);await page.locator('#journey-topic').selectOption('all');
}
async function currentTask(page){
  const saved=await page.evaluate(()=>AtlasJourney.load().inProgress);assert.ok(saved);
  return taskFor(saved.missionId,saved.step,saved.seed);
}
async function currentVisual(page,t){
  const changes=await page.evaluate(step=>AtlasJourney.load().inProgress.manipulated[step]||{},t.step);
  return {...t.visual,...changes};
}
async function diagrams(host,v,label){
  assert.equal(await host.locator('svg').count(),1,label+': a real diagram exists');
  assert.equal(await host.evaluate(n=>/NaN|Infinity/.test(n.innerHTML)),false,label+': finite geometry');
  if(v.type!=='upper')return;
  families.add(v.kind);
  if(v.kind==='place-value'){
    const places=await host.locator('[data-place-exponent]').evaluateAll(nodes=>nodes.map(n=>({exponent:Number(n.dataset.placeExponent),digit:Number(n.dataset.placeDigit),weight:Number(n.dataset.placeWeight)})));
    assert.ok(places.length>=3,label+': place chart retains empty places');
    for(const place of places)closeTo(place.weight,10**place.exponent,label+': place weight');
    closeTo(places.reduce((sum,p)=>sum+p.digit*p.weight,0),v.value,label+': digits and place weights reconstruct the given number');
  }
  if(v.kind==='product-area'){
    const pieces=await host.locator('[data-area-product]').evaluateAll(nodes=>nodes.map(n=>({rows:Number(n.dataset.areaRow),columns:Number(n.dataset.areaColumn),product:Number(n.dataset.areaProduct),width:Number(n.querySelector('rect').getAttribute('width')),height:Number(n.querySelector('rect').getAttribute('height'))})));
    const rows=v.rows.filter(x=>x>0),cols=v.columns.filter(x=>x>0);
    assert.equal(pieces.length,rows.length*cols.length,label+': every partial product is present');
    const schematic=await host.locator('[data-area-schematic="true"]').count()>0,scale=pieces[0]?.width/pieces[0]?.columns;
    for(const piece of pieces){
      closeTo(piece.product,piece.rows*piece.columns,label+': partial product arithmetic');
      if(!schematic){closeTo(piece.width/piece.columns,scale,label+': column length has a shared scale');closeTo(piece.height/piece.rows,scale,label+': row length has the same scale');}
    }
    if(schematic)assert.match(await host.locator('svg title').textContent(),/not.*(?:scale|area)|table|schematic/i,label+': a readable decomposition table explains its non-geometric sizes');
    closeTo(pieces.reduce((sum,p)=>sum+p.product,0),rows.reduce((sum,x)=>sum+x,0)*cols.reduce((sum,x)=>sum+x,0),label+': partial products cover the whole product');
  }
  if(v.kind==='quotient'){
    assert.equal(Number(await host.locator('[data-quotient-given]').getAttribute('data-quotient-given')),v.total);
    const chunks=await host.locator('[data-quotient-chunk]').evaluateAll(nodes=>nodes.map(n=>({quotient:Number(n.dataset.quotientChunk),items:Number(n.dataset.chunkItems)})));
    for(const chunk of chunks)closeTo(chunk.items,chunk.quotient*v.divisor,label+': each quotient chunk counts divisor-sized groups');
    assert.ok(chunks.reduce((sum,c)=>sum+c.items,0)<=v.total+1e-8,label+': chunks never remove more than the whole');
  }
  if(v.kind==='unit-conversion'){
    const groups=await host.locator('[data-conversion-group]').evaluateAll(nodes=>nodes.map(n=>({factor:Number(n.dataset.conversionFactor),from:n.dataset.conversionFrom,to:n.dataset.conversionTo})));
    assert.equal(groups.length,v.amount,label+': every larger unit has its own conversion group');
    assert.ok(groups.every(g=>g.factor===v.factor&&g.from===v.fromUnit&&g.to===v.toUnit));
    closeTo(groups.reduce((sum,g)=>sum+g.factor,0),v.amount*v.factor,label+': conversion preserves quantity in smaller units');
  }
  if(v.kind==='fraction-bars'){
    const bars=await host.locator('[data-fraction-bar="given"]').evaluateAll(nodes=>nodes.map(n=>({value:Number(n.dataset.fractionValue),unit:Number(n.dataset.unitWidth),denominator:Number(n.dataset.denominator)})));
    assert.equal(bars.length,v.bars.length);
    for(let i=0;i<bars.length;i++){
      closeTo(bars[i].value,v.bars[i].num/v.bars[i].den,label+': numerator counts denominator-sized parts');
      closeTo(bars[i].unit,bars[0].unit,label+': all fraction bars use identical wholes');
      assert.equal(bars[i].denominator,v.partitionDen||v.bars[i].den);
    }
    const fractionResponse=Boolean(v.responseDenominator)||v.answerKeys?.value==='fraction';
    if(typeof v.response==='number'&&!fractionResponse)assert.equal(await host.locator('[data-fraction-bar="trial"]').count(),0,label+': a count of pieces is not a proposed number of wholes');
    if(label.endsWith(': accepted')&&typeof v.response==='number'&&fractionResponse)assert.ok(v.response>=0&&v.response<=Math.max(1,Math.min(3,v.maxWholes||1)),label+': a correct built fraction fits the displayed wholes');
  }
  if(v.kind==='decimal-grid'){
    const values=v.values||[v.value],parts=v.places===1?10:100;
    const givens=await host.locator('[data-decimal-grid="given"]').evaluateAll(nodes=>nodes.map(n=>({value:Number(n.dataset.decimalValue),parts:Number(n.dataset.gridParts),cells:[...n.querySelectorAll('[data-grid-cell]')].map(c=>({filled:c.dataset.filled==='true',width:Number(c.getAttribute('width')),height:Number(c.getAttribute('height'))}))})));
    assert.equal(givens.length,values.length*3,label+': each given gets three fixed whole positions');
    for(let row=0;row<values.length;row++){
      const grids=givens.slice(row*3,row*3+3);
      assert.ok(grids.every(g=>g.value===values[row]&&g.parts===parts&&g.cells.length===parts));
      assert.equal(grids.flatMap(g=>g.cells).filter(c=>c.filled).length,Math.round(values[row]*parts),label+': exact tenth/hundredth fill count');
      for(const grid of grids)for(const cell of grid.cells)closeTo(cell.width*cell.height,125*125/parts,label+': one whole keeps the same area');
    }
  }
  if(v.kind==='fraction-product'){
    const cells=await host.locator('[data-fraction-product-cell]').evaluateAll(nodes=>nodes.map(n=>({overlap:n.dataset.overlap==='true',width:Number(n.getAttribute('width')),height:Number(n.getAttribute('height'))})));
    const [a,b]=v.left,[c,d]=v.right;
    assert.equal(cells.length,b*d,label+': two denominator directions create equal-area cells');
    assert.equal(cells.filter(c=>c.overlap).length,a*c,label+': overlap counts both selected numerators');
    closeTo(cells.filter(c=>c.overlap).length/cells.length,(a/b)*(c/d),label+': overlap represents the fraction product');
    assert.ok(cells.every(c=>Math.abs(c.width*c.height-cells[0].width*cells[0].height)<1e-7),label+': all small product regions have equal area');
  }
  if(v.kind==='angle'){
    const angle=host.locator('[data-given-angle]');assert.equal(Number(await angle.getAttribute('data-given-angle')),v.degrees);
    const points=await angle.locator('path').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d').match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi).map(Number)));
    assert.equal(points.length,2);
    const vectors=points.map(p=>[p[2]-p[0],p[3]-p[1]]),dot=vectors[0][0]*vectors[1][0]+vectors[0][1]*vectors[1][1],norm=Math.hypot(...vectors[0])*Math.hypot(...vectors[1]);
    closeTo(Math.acos(Math.max(-1,Math.min(1,dot/norm)))*180/Math.PI,v.degrees,label+': ray geometry measures the stated angle');
    if(v.splitAt!==undefined)assert.equal(Number(await host.locator('[data-angle-split]').getAttribute('data-angle-split')),v.splitAt);
  }
  if(v.kind==='line-pairs'){
    const lines=await host.locator('[data-line-pair] path').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d').match(/[-+]?(?:\d*\.)?\d+/g).map(Number)));
    assert.equal(lines.length,2);
    const [a,b]=lines.map(p=>[p[2]-p[0],p[3]-p[1]]),cross=a[0]*b[1]-a[1]*b[0],dot=a[0]*b[0]+a[1]*b[1];
    if(v.mode==='parallel')closeTo(cross,0,label+': parallel directions');
    else if(v.mode==='perpendicular')closeTo(dot,0,label+': perpendicular directions make a right angle');
    else assert.ok(Math.abs(cross)>1&&Math.abs(dot)>1,label+': ordinary intersections are neither parallel nor perpendicular');
  }
  if(v.kind==='symmetry')assert.equal(await host.locator('[data-symmetry-axis]').count(),v.shape==='square'?4:2,label+': all and only the rectangle symmetry lines are present');
  if(v.kind==='polygons'){
    assert.deepEqual(await host.locator('[data-polygon-family]').evaluateAll(nodes=>nodes.map(n=>n.dataset.polygonFamily)),v.shapes);
    const triangles=await host.locator('[data-polygon-family$="triangle"]').evaluateAll(nodes=>nodes.map(n=>({name:n.dataset.polygonFamily,points:n.querySelector('polygon').getAttribute('points').split(/\s+/).map(p=>p.split(',').map(Number))})));
    for(const triangle of triangles){
      const dots=triangle.points.map((p,i)=>{const a=triangle.points[(i+1)%3],b=triangle.points[(i+2)%3];return (a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1]);});
      assert.equal(triangle.points.length,3);
      if(triangle.name==='right-triangle')assert.ok(dots.some(x=>Math.abs(x)<1e-7),label+': a real square corner');
      if(triangle.name==='acute-triangle')assert.ok(dots.every(x=>x>0),label+': all three angles are acute');
      if(triangle.name==='obtuse-triangle')assert.equal(dots.filter(x=>x<0).length,1,label+': exactly one obtuse angle');
    }
  }
  if(v.kind==='coordinates'){
    const points=await host.locator('[data-coordinate-given]').evaluateAll(nodes=>nodes.map(n=>({pair:n.dataset.coordinateGiven.split(',').map(Number),cx:Number(n.querySelector('circle').getAttribute('cx')),cy:Number(n.querySelector('circle').getAttribute('cy'))})));
    assert.deepEqual(points.map(p=>p.pair),v.points.map(p=>[p.x,p.y]),label+': exact ordered pairs');
    for(const p of points){closeTo(p.cx,85+p.pair[0]/(v.maxX||10)*390,label+': x coordinate maps across');closeTo(p.cy,280-p.pair[1]/(v.maxY||10)*230,label+': y coordinate maps up');}
  }
  if(v.kind==='volume-parts'){
    const parts=await host.locator('[data-volume-component]').evaluateAll(nodes=>nodes.map(n=>({dimensions:n.dataset.volumeDimensions.split(',').map(Number),volume:Number(n.dataset.volumeCubes),cubes:n.querySelectorAll('[data-unit-cube]').length})));
    assert.equal(parts.length,v.prisms.length);
    for(let i=0;i<parts.length;i++){
      const p=v.prisms[i];assert.deepEqual(parts[i].dimensions,[p.length,p.width,p.height]);
      assert.equal(parts[i].volume,p.length*p.width*p.height);assert.equal(parts[i].cubes,parts[i].volume,label+': one visible-model cube per cubic unit');
    }
  }
}
async function teaching(page,mission){
  if(!await page.locator('#adventure-intro').isVisible())return;
  const concept=conceptFor(mission);assert.ok(concept,mission.id);
  const before=await page.evaluate(()=>AtlasJourney.load().pet.coins);
  for(let i=0;i<concept.steps.length;i++){
    assert.equal(await page.locator('#concept-position').textContent(),`Part ${i+1} of ${concept.steps.length}`);
    assert.equal(await page.locator('#adventure-mission').isVisible(),false);
    await diagrams(page.locator('#concept-visual'),concept.steps[i].visual,concept.id+':'+i);
    if(i<concept.steps.length-1)await page.locator('#concept-next').click();
  }
  await page.locator('#concept-start').click();
  assert.equal(await page.evaluate(()=>AtlasJourney.load().pet.coins),before,'worked examples neither award nor cost coins');
}
async function enter(page,mission){
  await yearMap(page,mission.gradeIds[0]);await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();
  await teaching(page,mission);assert.equal(await page.locator('#mission-title').textContent(),mission.title);
}
async function setControl(page,key,value){
  const control=page.locator(`[data-control="${key}"]`);assert.equal(await control.count(),1,key);
  const min=Number(await control.getAttribute('min')),step=Number(await control.getAttribute('step'));
  if(step>0&&step<1&&Math.abs(step*1e6-Math.round(step*1e6))>1e-8){
    const count=Math.round((value-min)/step);assert.ok(Math.abs(min+count*step-value)<1e-7,'fraction target is an actual slider step');
    await control.focus();await control.press('Home');for(let i=0;i<count;i++)await control.press('ArrowRight');return;
  }
  await control.fill(String(value));await control.dispatchEvent('input');
}
function answerText(value){
  if(Number.isInteger(value))return String(value);
  // A small exact fraction also exercises the learner's familiar fraction
  // notation, without requiring repeating-decimal transcription.
  for(let d=2;d<=100;d++)if(Math.abs(value*d-Math.round(value*d))<1e-10)return `${Math.round(value*d)}/${d}`;
  return String(value);
}
async function answer(page,t){
  if(t.answer.kind==='choice'){
    const choices=await page.locator('[name="adventure-choice"]').all(),values=await page.locator('[name="adventure-choice"]').evaluateAll(nodes=>nodes.map(n=>n.value));
    const index=values.indexOf(String(t.expected));assert.ok(index>=0,t.id);await choices[index].check();
  }else if(t.answer.kind==='pair'){
    for(const key of t.answer.keys){
      const field=page.locator(`[data-answer-key="${key}"]`);
      if(await field.count())await field.fill(answerText(t.expected[key]));else await setControl(page,key,t.expected[key]);
    }
  }else if(t.answer.key&&t.inputs.some(i=>i.key===t.answer.key))await setControl(page,t.answer.key,t.expected);
  else await page.locator('#adventure-answer-number').fill(answerText(t.expected));
  await page.locator('#adventure-check').click();
  assert.equal(await page.locator('#adventure-next').isVisible(),true,t.id+': the real answer can be submitted');
  assert.match(await page.locator('#adventure-feedback').getAttribute('class'),/correct/);
}
async function initialIsUnanswered(page,t){
  assert.equal(await page.locator('#adventure-next').isVisible(),false,t.id+': no answer is accepted automatically');
  if(t.answer.kind==='choice')assert.equal(await page.locator('[name="adventure-choice"]:checked').count(),0);
  else if(t.answer.kind==='pair'){
    const controls=t.answer.keys.every(key=>t.inputs.some(i=>i.key===key));
    if(controls){const visual=await currentVisual(page,t);assert.equal(checkTask(t,Object.fromEntries(t.answer.keys.map(key=>[key,visual[key]]))).correct,false,t.id+': build begins unfinished');}
    else for(const field of await page.locator('[data-answer-key]').all())assert.equal(await field.inputValue(),'');
  }else if(t.answer.key&&t.inputs.some(i=>i.key===t.answer.key))assert.equal(checkTask(t,(await currentVisual(page,t))[t.answer.key]).correct,false,t.id+': unknown is not filled with its answer');
  else assert.equal(await page.locator('#adventure-answer-number').inputValue(),'');
}
const fixedSelectors='[data-place-exponent],[data-area-product],[data-conversion-group],[data-quotient-given],[data-quotient-chunk],[data-fraction-bar="given"],[data-decimal-grid="given"],[data-fraction-product-cell],[data-given-angle],[data-angle-split],[data-line-pair],[data-symmetry-shape],[data-symmetry-axis],[data-polygon-family],[data-coordinate-given],[data-volume-component]';
async function givenSnapshot(page){return page.locator('#mission-visual').locator(fixedSelectors).evaluateAll(nodes=>nodes.map(n=>n.outerHTML));}
async function wrongTrialStaysSeparate(page,t){
  if(t.visual.type!=='upper')return;
  const field=page.locator('#adventure-answer-number');
  const controlled=t.answer.kind==='number'&&t.inputs.find(i=>i.key===t.answer.key&&i.key==='response'&&i.min<i.max);
  if(t.answer.kind==='number'&&(await field.count()||controlled)){
    const before=await givenSnapshot(page);assert.ok(before.length>0,t.id+': authored givens can be inspected');
    let wrong=t.expected===0?.5:t.expected/2;
    if(controlled){
      wrong=controlled.min+(controlled.step||1);
      if(checkTask(t,wrong).correct)wrong=controlled.min+2*(controlled.step||1);
      if(wrong>controlled.max||checkTask(t,wrong).correct)wrong=controlled.min;
      await setControl(page,controlled.key,wrong);
    }else await field.fill(answerText(wrong));
    assert.equal(checkTask(t,wrong).correct,false);
    assert.deepEqual(await givenSnapshot(page),before,t.id+': a typed trial does not replace or rescale the given math');
    const indicators=page.locator('#mission-visual [data-upper-trial],#mission-visual [data-quotient-trial],#mission-visual [data-fraction-bar="trial"],#mission-visual [data-decimal-grid="trial"],#mission-visual [data-angle-trial]');
    assert.ok(await indicators.count()>0,t.id+': the trial is shown separately');
    await page.locator('#adventure-check').click();assert.equal(await page.locator('#adventure-next').isVisible(),false,t.id+': incorrect trial does not complete the challenge');
  }else if(t.answer.kind==='pair'&&t.visual.answerPoint){
    const x=page.locator('[data-answer-key="x"]'),y=page.locator('[data-answer-key="y"]');
    const controls=t.inputs.some(i=>i.key==='x')&&t.inputs.some(i=>i.key==='y');
    if((!await x.count()||!await y.count())&&!controls)return;
    const before=await givenSnapshot(page),wrongX=(t.expected.x+1)%((t.visual.maxX||10)+1);
    if(controls){await setControl(page,'x',wrongX);await setControl(page,'y',t.expected.y);}
    else{await x.fill(String(wrongX));await y.fill(String(t.expected.y));}
    assert.deepEqual(await givenSnapshot(page),before,t.id+': a proposed point keeps given points fixed');
    assert.equal(await page.locator('#mission-visual [data-coordinate-trial]').getAttribute('data-coordinate-trial'),wrongX+','+t.expected.y);
  }
}
async function notes(page,mission){
  assert.equal(await page.locator('#mission-lesson-notes').isVisible(),true);
  if(!await page.locator('#mission-worked-example').isVisible())await page.locator('#mission-lesson-notes summary').click();
  for(const [selector,key] of [['#mission-lesson-goal','goal'],['#mission-prerequisite','prerequisite'],['#mission-worked-example','workedExample'],['#mission-explain-prompt','explainPrompt'],['#mission-review-prompt','reviewPrompt']]){
    const value=await page.locator(selector).textContent();assert.ok(value.trim().length>15,mission.id+' '+key);
    if(mission.lessonPlan)assert.equal(value,mission.lessonPlan[key]);
  }
}
async function savedVariant(page,id,seed,step=0){
  await enter(page,missionById(id));
  await page.evaluate(({id,seed,step})=>AtlasJourney.update({inProgress:{missionId:id,seed,step,answers:{},manipulated:{}}}),{id,seed,step});
  await page.reload();await page.waitForFunction(()=>window.AtlasJourney&&document.body.dataset.adventureView==='mission');
  return currentTask(page);
}
async function paths(){
  const page=await freshPage();
  try{
    for(const grade of ['4','5']){
      await yearMap(page,grade);const year=schoolYearForGrade(grade);assert.ok(year);
      assert.equal(year.units.length,8);assert.equal(await page.locator('.world-card').count(),8);
      const order=orderedMissions(missions,grade),actual=await page.locator('.mission-card[data-mission]').evaluateAll(nodes=>nodes.map(n=>n.dataset.mission));
      assert.deepEqual(actual,order.map(m=>m.id),'the eight-unit map keeps its authored sequence');
      assert.deepEqual([...actual].sort(),filterMissions({gradeId:grade,topicId:'all'}).map(m=>m.id).sort(),'all grade activities occur once in the primary year path');
      assert.equal(new Set(actual).size,actual.length);
      for(const unit of year.units){
        const card=page.locator(`.world-card[data-world="${unit.id}"]`);
        assert.deepEqual(await card.locator('.mission-card[data-mission]').evaluateAll(nodes=>nodes.map(n=>n.dataset.mission)),unit.missionIds);
        assert.equal(await card.locator('[data-year-review]').count(),unit.reviewMissionIds.length);
        await card.locator('.unit-learning-notes summary').click();assert.ok((await card.locator('.unit-learning-notes').textContent()).includes(unit.methods[0]));
      }
      const later=missionById(year.units[5].missionIds[0]);await enter(page,later);await notes(page,later);
      for(let step=0;step<3;step++){await answer(page,await currentTask(page));await page.locator('#adventure-next').click();}
      const index=order.findIndex(m=>m.id===later.id),next=order[index+1];
      await page.locator('#finish-next').click();await teaching(page,next);
      assert.equal(await page.evaluate(()=>AtlasJourney.load().inProgress.missionId),next.id,'next discovery continues from the chosen later unit');
      await yearMap(page,grade);const unit=year.units[3],card=page.locator(`.world-card[data-world="${unit.id}"]`);
      await card.locator('.unit-review summary').click();await card.locator('[data-year-review]').first().click();
      assert.equal(await page.evaluate(()=>AtlasJourney.load().inProgress.missionId),unit.reviewMissionIds[0]);
      await teaching(page,missionById(unit.reviewMissionIds[0]));
    }
  }finally{await page.close();}
}
async function keyboardAndResume(){
  const page=await freshPage();
  try{
    const mission=upperMissions.find(m=>taskFor(m.id,0,1).inputs.some(i=>i.min!==i.max));assert.ok(mission);
    const t=await savedVariant(page,mission.id,1),def=t.inputs.find(i=>i.min!==i.max),slider=page.locator(`[data-control="${def.key}"]`);
    await slider.focus();await slider.press('Home');await slider.press('ArrowRight');
    closeTo(Number(await slider.inputValue()),def.min+(def.step||1),'native keyboard changes one model step');
    assert.equal(await slider.evaluate(n=>n===document.activeElement),true,'model rerender preserves slider focus');
    const before=await page.evaluate(()=>AtlasJourney.load().inProgress);await page.reload();await page.waitForFunction(()=>document.body.dataset.adventureView==='mission');
    const after=await page.evaluate(()=>AtlasJourney.load().inProgress);
    assert.equal(after.missionId,before.missionId);assert.equal(after.seed,before.seed);assert.equal(after.step,before.step);
    assert.deepEqual(after.manipulated,before.manipulated,'the actual model build is remembered');
    await page.locator('#adventure-pause').click();await page.reload();await ready(page);
    assert.equal(await page.locator('#adventure-start').getAttribute('data-mission'),mission.id);
    await page.locator('#adventure-start').click();await teaching(page,mission);
    assert.equal((await currentTask(page)).id,t.id);
  }finally{await page.close();}
}
async function mobile(){
  const page=await freshPage({width:390,height:844});
  try{
    await page.locator('#reading-open').click();await page.locator('#reading-size').selectOption('1.4');await page.locator('#reading-line').selectOption('2.1');await page.locator('#reading-done').click();
    for(const grade of ['4','5']){
      await yearMap(page,grade);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,grade+': the enlarged year path fits on a phone');
      const year=schoolYearForGrade(grade);
      for(const unit of year.units){
        const mission=missionById(unit.missionIds[0]);await enter(page,mission);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,mission.id+': enlarged phone lesson fits');
        assert.equal(await page.locator('#mission-visual').evaluate(n=>n.scrollWidth>n.clientWidth),false,mission.id+': figure fits');
      }
    }
  }finally{await page.close();}
}
async function screenshots(){
  if(!process.env.ATLAS_SCREENSHOT_DIR)return;
  const dir=resolve(process.env.ATLAS_SCREENSHOT_DIR);await mkdir(dir,{recursive:true});
  const page=await freshPage({width:1440,height:1100});
  try{
    await yearMap(page,'4');await page.evaluate(()=>scrollTo(0,document.querySelector('#map-heading').getBoundingClientRect().top+scrollY-60));
    await page.screenshot({path:resolve(dir,'grade-four-year-overview.png'),animations:'disabled'});
    for(const [id,step,name] of [['g5y-fraction-overlap',2,'grade-five-fraction-product.png'],['g5y-volume-two-parts',2,'grade-five-volume.png'],['g5y-decimal-join',0,'grade-five-decimal-model.png']]){
      const t=await savedVariant(page,id,1,step);await setControl(page,t.answer.key,t.expected);
      await page.screenshot({path:resolve(dir,name),fullPage:true,animations:'disabled'});
    }
  }finally{await page.close();}
}

try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  await paths();console.log('Grades 4 and 5: eight-unit maps, lesson notes, reviews, and later-unit continuation passed.');
  await keyboardAndResume();console.log('Upper-grade native keyboard model controls and saved progress passed.');
  const page=await freshPage();
  try{
    let challenges=0;
    for(const [index,mission] of upperMissions.entries()){
      await savedVariant(page,mission.id,1);await notes(page,mission);const before=await page.evaluate(()=>AtlasJourney.load().pet.coins);
      for(let step=0;step<3;step++){
        const t=await currentTask(page);assert.equal(t.step,step);await initialIsUnanswered(page,t);
        await diagrams(page.locator('#mission-visual'),await currentVisual(page,t),t.id);await wrongTrialStaysSeparate(page,t);await answer(page,t);
        await diagrams(page.locator('#mission-visual'),await currentVisual(page,t),t.id+': accepted');
        await page.locator('#adventure-next').click();challenges++;
      }
      assert.equal(await page.evaluate(id=>AtlasJourney.load().completed[id]?.steps,mission.id),3);
      assert.equal(await page.evaluate(()=>AtlasJourney.load().pet.coins),before+15,'a new lesson rewards participation once');
      if((index+1)%8===0)console.log(`${index+1}/64 upper lessons and ${challenges}/192 real UI challenges passed.`);
    }
    assert.equal(challenges,192);
  }finally{await page.close();}
  await mobile();await screenshots();
  assert.deepEqual(errors,[],'no uncaught upper-grade errors');assert.deepEqual(failed,[],'all upper-grade assets load');
  console.log('All 192 upper-grade challenges, saved models, eight-unit paths, and 140% mobile reading passed. Rendered families: '+[...families].sort().join(', '));
}finally{
  if(browser)await browser.close();await new Promise(done=>server.close(done));
}
