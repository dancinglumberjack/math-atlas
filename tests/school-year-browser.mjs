import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createPreviewServer} from '../scripts/serve.mjs';
import {build} from '../scripts/build.mjs';
import {missions,taskFor} from '../src/adventure-model.mjs';
import {yearMissions} from '../src/grade3-year-content.mjs';
import {grade3Year,orderedMissions,unitForMission} from '../src/school-year.mjs';
import {conceptFor} from '../src/concepts-model.mjs';

// Answer arithmetic is independently checked in the model tests. This suite
// checks that the shipped year path actually teaches and accepts those builds.
build({check:true});
const require=createRequire(import.meta.url);
const {chromium}=process.env.PLAYWRIGHT_MODULE_PATH?require(process.env.PLAYWRIGHT_MODULE_PATH):await import('playwright');
const server=createPreviewServer({basePath:'/math-atlas/'});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port+'/math-atlas/';
const errors=[],failed=[];
let browser;
function observe(page){
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>failed.push(r.url()));
  page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});
}
async function ready(page){await page.waitForFunction(()=>window.AtlasJourney&&window.AtlasAdventure&&document.querySelector('[data-mission]'));}
async function task(page){const p=await page.evaluate(()=>AtlasJourney.load().inProgress);assert.ok(p);return taskFor(p.missionId,p.step,p.seed);}
async function home(page){
  if(await page.locator('#adventure-intro').isVisible())await page.locator('#concept-exit').click();
  if(await page.locator('#adventure-mission').isVisible())await page.locator('#adventure-pause').click();
  if(await page.locator('#adventure-finish').isVisible())await page.locator('#finish-map').click();
  assert.equal(await page.locator('#adventure-home').isVisible(),true);
}
async function yearMap(page){
  await home(page);
  await page.locator('#journey-grade').selectOption('3');
  await page.locator('#journey-topic').selectOption('all');
}
async function teaching(page,mission){
  if(!await page.locator('#adventure-intro').isVisible())return;
  const concept=conceptFor(mission);assert.ok(concept,mission.id);
  const coins=await page.evaluate(()=>AtlasJourney.load().pet.coins);
  for(let i=0;i<concept.steps.length;i++){
    assert.equal(await page.locator('#adventure-mission').isVisible(),false);
    assert.equal(await page.locator('#concept-position').textContent(),`Part ${i+1} of ${concept.steps.length}`);
    assert.equal(await page.locator('#concept-visual svg').count(),1);
    assert.equal(await page.locator('#concept-visual').evaluate(n=>/NaN|Infinity/.test(n.innerHTML)),false,concept.id);
    const v=concept.steps[i].visual;
    if(v.type==='base-ten'&&v.hundreds!==undefined){
      for(const [field,name] of [['hundreds','hundred'],['tens','ten'],['ones','one']])assert.equal(await page.locator(`#concept-visual [data-place-unit="${name}"]`).count(),v[field],concept.id+': worked bundles are not clamped');
    }
    if(v.type==='shapes'&&v.showAttributes)assert.equal(await page.locator(`#concept-visual [data-shape-family="${v.target}"]`).count(),1,'Worked shape has the stated actual outline');
    if(i<concept.steps.length-1)await page.locator('#concept-next').click();
  }
  await page.locator('#concept-start').click();
  assert.equal(await page.evaluate(()=>AtlasJourney.load().pet.coins),coins,'Teaching does not award or cost coins');
}
async function enter(page,mission){
  await yearMap(page);
  await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();
  await teaching(page,mission);
  assert.equal(await page.locator('#mission-title').textContent(),mission.title);
}
async function control(page,key,value){
  const field=page.locator(`[data-control="${key}"]`);assert.equal(await field.count(),1,key);
  const step=Number(await field.getAttribute('step'));
  if(step>0&&!Number.isInteger(step)){
    const min=Number(await field.getAttribute('min'));await field.focus();await field.press('Home');
    for(let i=0;i<Math.round((value-min)/step);i++)await field.press('ArrowRight');
  }else{await field.fill(String(value));await field.dispatchEvent('input');}
}
async function buttons(page,t,key,target){
  const def=t.inputs.find(i=>i.key===key);assert.ok(def);
  const current=await page.evaluate(({step,key})=>AtlasJourney.load().inProgress.manipulated[step][key],{step:t.step,key});
  const delta=Math.sign(target-current),count=Math.round(Math.abs(target-current)/(def.step||1));
  for(let i=0;i<count;i++)await page.locator(`#mission-visual [data-control-bump="${key}"][data-delta="${delta}"]`).click();
}
function answerText(t,value){
  const d=t.visual.fractionDenominator||(t.visual.kind==='length'?Math.round(1/t.visual.tickStep):null);
  return d&&!Number.isInteger(value)?Math.round(value*d)+'/'+d:String(value);
}
async function answer(page,t){
  if(t.answer.kind==='choice'){
    const choices=await page.locator('[name="adventure-choice"]').all();
    const values=await page.locator('[name="adventure-choice"]').evaluateAll(nodes=>nodes.map(n=>n.value));
    const i=values.indexOf(String(t.expected));assert.ok(i>=0,t.id);await choices[i].check();
  }else if(t.handsOn?.type==='division'){
    if(t.answer.derived?.kind==='product'){
      const variable=t.inputs.find(i=>i.min!==i.max);const other=t.answer.derived.keys.find(k=>k!==variable.key);
      const fixed=await page.evaluate(({step,key})=>AtlasJourney.load().inProgress.manipulated[step][key],{step:t.step,key:other});
      await buttons(page,t,variable.key,t.expected/fixed);
    }else await buttons(page,t,t.answer.key,t.expected);
    assert.equal(await page.locator('#adventure-answer-fields input').count(),0,'New division practice uses the picture');
  }else if(t.answer.kind==='pair'){
    for(const key of t.answer.keys){const field=page.locator(`[data-answer-key="${key}"]`);if(await field.count())await field.fill(String(t.expected[key]));else await control(page,key,t.expected[key]);}
  }else if(t.answer.key&&t.inputs.some(i=>i.key===t.answer.key))await control(page,t.answer.key,t.expected);
  else await page.locator('#adventure-answer-number').fill(answerText(t,t.expected));
  await page.locator('#adventure-check').click();
  assert.equal(await page.locator('#adventure-next').isVisible(),true,t.id+': the actual answer can be submitted');
  assert.match(await page.locator('#adventure-feedback').getAttribute('class'),/correct/,t.id);
}
async function diagrams(page,t){
  const host=page.locator('#mission-visual'),v=t.visual;
  assert.equal(await host.locator('svg').count(),1,t.id);
  assert.equal(await host.evaluate(n=>/NaN|Infinity/.test(n.innerHTML)),false,t.id);
  if(v.type==='data'&&v.kind==='picture')for(let i=0;i<v.values.length;i++)assert.equal(await host.locator(`[data-data-symbol="${i}"]`).count()*v.key,v.values[i],t.id+': a picture key counts objects rather than symbols');
  if(v.type==='data'&&v.kind==='bar'){
    const bars=await host.locator('[data-data-bar]').evaluateAll(nodes=>nodes.map(n=>({value:Number(n.dataset.dataValue),height:Number(n.getAttribute('height'))})));
    assert.deepEqual(bars.map(b=>b.value),v.values);
    for(let i=1;i<bars.length;i++)assert.ok(Math.abs(bars[i].height/bars[0].height-v.values[i]/v.values[0])<1e-8,'Bar geometry follows actual quantities');
  }
  if(v.type==='data'&&v.kind==='line-plot'){
    const marks=await host.locator('[data-data-point]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.dataPoint)));
    assert.deepEqual(marks.sort((a,b)=>a-b),[...v.values].sort((a,b)=>a-b),'Each measured item produces one cross at its true length');
  }
  if(v.type==='fraction'&&v.compareParts!==undefined){
    const wholes=await host.locator('[data-fraction-whole]').evaluateAll(nodes=>nodes.map(n=>({width:Number(n.dataset.wholeWidth),parts:Number(n.dataset.parts),selected:Number(n.dataset.selected)})));
    assert.equal(wholes.length,2);assert.equal(wholes[0].width,wholes[1].width,'Fraction comparisons use identical wholes');
    assert.deepEqual(wholes.map(x=>[x.parts,x.selected]),[[v.parts,v.selected],[v.compareParts,v.compareSelected]]);
  }
  if(v.type==='composite-area'){
    assert.equal(await host.locator('[data-area-rectangle]').count(),v.rectangles.length);
    const areas=await host.locator('[data-area-rectangle]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.areaUnits)));
    assert.deepEqual(areas,v.rectangles.map(r=>r.length*r.width));
  }
}
async function savedVariant(page,id,seed,step=0){
  const mission=missions.find(m=>m.id===id);assert.ok(mission);
  await enter(page,mission);
  await page.evaluate(({id,seed,step})=>AtlasJourney.update({inProgress:{missionId:id,seed,step,answers:{},manipulated:{}}}),{id,seed,step});
  await page.reload();await page.waitForFunction(()=>window.AtlasJourney&&document.body.dataset.adventureView==='mission');
  return task(page);
}
async function saveScreenshots(browser){
  if(!process.env.ATLAS_SCREENSHOT_DIR)return;
  const directory=resolve(process.env.ATLAS_SCREENSHOT_DIR);await mkdir(directory,{recursive:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}});observe(page);
  try{
    await page.goto(base+'adventure.html');await ready(page);await yearMap(page);
    await page.evaluate(()=>scrollTo(0,document.querySelector('#map-heading').getBoundingClientRect().top+scrollY-80));
    await page.screenshot({path:resolve(directory,'math-atlas-grade-three-year-overview.png'),animations:'disabled'});
    await page.goto(base+'adventure.html#mission/g3y-line-plot');await ready(page);
    await teaching(page,missions.find(m=>m.id==='g3y-line-plot'));
    await page.locator('#mission-lesson-notes summary').click();
    await page.screenshot({path:resolve(directory,'math-atlas-measure-and-plot.png'),fullPage:true,animations:'disabled'});
    await page.goto(base+'adventure.html#mission/g3y-unit-line');await ready(page);
    const concept=conceptFor(missions.find(m=>m.id==='g3y-unit-line'));
    for(let i=1;i<concept.steps.length;i++)await page.locator('#concept-next').click();
    await page.screenshot({path:resolve(directory,'math-atlas-fractions-beyond-one.png'),fullPage:true,animations:'disabled'});
  }finally{await page.close();}
}

try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:1050}});observe(page);
  await page.goto(base+'adventure.html');await ready(page);await yearMap(page);
  assert.equal(await page.locator('.world-card[data-world^="g3-unit-"]').count(),8);
  assert.equal(await page.locator('.mission-card[data-mission]').count(),76);
  assert.equal(await page.locator('[data-year-review]').count(),24);
  for(const unit of grade3Year.units){
    const card=page.locator(`.world-card[data-world="${unit.id}"]`);
    assert.equal(await card.locator('.mission-card[data-mission]').count(),unit.missionIds.length);
  }
  if(process.env.ATLAS_SCREENSHOT_DIR){await mkdir(resolve(process.env.ATLAS_SCREENSHOT_DIR),{recursive:true});await page.screenshot({path:resolve(process.env.ATLAS_SCREENSHOT_DIR,'math-atlas-grade-three-year.png'),fullPage:true,animations:'disabled'});}

  for(const mission of yearMissions){
    await enter(page,mission);
    assert.equal(await page.locator('#mission-lesson-notes').isVisible(),true,mission.id+': its lesson plan is available');
    if(!await page.locator('#mission-worked-example').isVisible())await page.locator('#mission-lesson-notes summary').click();
    for(const [selector,key] of [['#mission-lesson-goal','goal'],['#mission-prerequisite','prerequisite'],['#mission-worked-example','workedExample'],['#mission-explain-prompt','explainPrompt'],['#mission-review-prompt','reviewPrompt']])assert.ok((await page.locator(selector).textContent()).includes(mission.lessonPlan[key]),mission.id+' '+key);
    const before=await page.evaluate(()=>AtlasJourney.load().pet.coins);
    for(let step=0;step<3;step++){
      const t=await task(page);assert.equal(t.step,step);await diagrams(page,t);await answer(page,t);await diagrams(page,t);
      if(t.visual.answerKeys?.value==='count'&&t.visual.type==='number-line')assert.equal(await page.locator('#mission-visual [data-fraction-position]').count(),0,'A count of parts is not an absolute position');
      await page.locator('#adventure-next').click();
    }
    assert.equal(await page.evaluate(id=>AtlasJourney.load().completed[id]?.steps,mission.id),3);
    assert.equal(await page.evaluate(()=>AtlasJourney.load().pet.coins),before+15);
  }
  console.log('All 36 new year lessons / 108 real UI challenges passed, with prerequisites, worked examples, explanations, review prompts and mathematical diagram checks.');

  // Exact third/sixth increments must remain valid after native slider events.
  for(const seed of [2,3]){
    const t=await savedVariant(page,'g3y-unit-line',seed);
    assert.ok([3,6].includes(t.visual.fractionDenominator));
    const field=page.locator('[data-control="position"]');await field.focus();await field.press('ArrowRight');
    const position=await page.evaluate(()=>AtlasJourney.load().inProgress.manipulated[0].position);
    assert.ok(Math.abs(position-1/t.visual.fractionDenominator)<1e-10,'Native third/sixth steps retain sufficient precision');
    await page.locator('#adventure-check').click();
    assert.equal(await page.locator('#adventure-next').isVisible(),true,'A correct native fraction build passes');
  }
  const above=await savedVariant(page,'g3y-above-one',1);await answer(page,above);
  assert.ok(Number(await page.locator('#mission-visual [data-fraction-position]').getAttribute('data-fraction-position'))>1,'An actual fraction marker moves beyond one');
  await savedVariant(page,'g3y-locate-share',1,1);
  const trialNote=async()=> (await page.locator('#mission-visual svg text').allTextContents()).find(text=>text.startsWith('Your trial:')&&!text.includes('value ='))||'';
  await page.locator('#adventure-answer-number').fill('0.49');
  assert.match(await trialNote(),/0\.49/,'An off-grid decimal is not mislabeled as one half');
  await page.locator('#adventure-check').click();assert.equal(await page.locator('#adventure-next').isVisible(),false);
  await page.locator('#adventure-answer-number').fill('-1/4');
  assert.match(await trialNote(),/-1\/4/,'A negative fraction keeps its actual sign and magnitude');
  await page.locator('#adventure-answer-number').fill('10/4');
  assert.equal(await page.locator('#mission-visual [data-fraction-position]').count(),0,'An out-of-range answer is not shown at a false endpoint');
  assert.match(await page.locator('#mission-visual-caption').textContent(),/outside|beyond/i,'An out-of-range proposal explains why no trial mark is drawn');
  for(const id of ['g3y-round-ten','g3y-round-hundred']){
    const t=await savedVariant(page,id,1);const labels=await page.locator('#mission-visual svg text').allTextContents();
    assert.ok(labels.includes(String(t.visual.min))&&labels.includes(String(t.visual.max)),'Both rounding benchmarks are actually labeled');
  }

  // Completing a deliberately chosen later lesson continues from that lesson.
  const later=missions.find(m=>m.id==='g3y-minute-clock');await enter(page,later);
  for(let step=0;step<3;step++){await answer(page,await task(page));await page.locator('#adventure-next').click();}
  const order=orderedMissions(missions),index=order.findIndex(m=>m.id===later.id),expectedNext=order[index+1];
  await page.locator('#finish-next').click();await teaching(page,expectedNext);
  assert.equal(await page.evaluate(()=>AtlasJourney.load().inProgress.missionId),expectedNext.id,'Next lesson continues the selected later unit');
  await yearMap(page);
  const reviewUnit=page.locator(`.world-card[data-world="${grade3Year.units[2].id}"]`);
  await reviewUnit.locator('.unit-review summary').click();
  const review=reviewUnit.locator(`[data-year-review="${grade3Year.units[2].reviewMissionIds[0]}"]`);
  await review.click();
  assert.equal(await page.evaluate(()=>AtlasJourney.load().inProgress.missionId),grade3Year.units[2].reviewMissionIds[0],'A planned review opens the actual earlier lesson');

  await yearMap(page);await page.setViewportSize({width:390,height:844});
  await page.locator('#reading-open').click();await page.locator('#reading-size').selectOption('1.4');await page.locator('#reading-line').selectOption('2.1');await page.locator('#reading-done').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'The year path fits on a phone with larger text');
  for(const id of ['g3y-add-regroup','g3y-above-one','g3y-bar-chart','g3y-attributes']){
    await enter(page,missions.find(m=>m.id===id));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,id+' enlarged mobile layout');
    assert.equal(await page.locator('#mission-visual').evaluate(n=>n.scrollWidth>n.clientWidth),false,id+' figure fit');
  }
  console.log('Eight-unit order, planned reviews, native third/sixth precision, fractions above one, rounding benchmarks, later-unit navigation and enlarged mobile reading passed.');
  await saveScreenshots(browser);
  assert.deepEqual(errors,[],'No uncaught year-path errors');assert.deepEqual(failed,[],'All year-path assets load');
}finally{
  if(browser)await browser.close();await new Promise(done=>server.close(done));
}
