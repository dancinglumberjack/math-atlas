import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {build} from '../scripts/build.mjs';
import {createPreviewServer} from '../scripts/serve.mjs';
import {missions,taskFor} from '../src/adventure-model.mjs';
import {primaryMissions} from '../src/primary-content.mjs';
import {schoolYearForGrade,orderedMissions} from '../src/school-year.mjs';
import {conceptFor} from '../src/concepts-model.mjs';

// Model suites independently check arithmetic. This isolated browser checks
// that the shipped pictures preserve those quantities and learners can build
// and submit every new K–2 answer without typing.
build({check:true});
const require=createRequire(import.meta.url);
const {chromium}=process.env.PLAYWRIGHT_MODULE_PATH?require(process.env.PLAYWRIGHT_MODULE_PATH):await import('playwright');
const server=createPreviewServer({basePath:'/math-atlas/'});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port+'/math-atlas/';
const errors=[],failed=[];
let browser;
const missionById=id=>missions.find(m=>m.id===id);
function observe(page){
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>failed.push(r.url()));
  page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});
}
async function ready(page){await page.waitForFunction(()=>window.AtlasAdventure&&window.AtlasJourney&&window.AtlasPrimaryVisuals&&document.querySelector('[data-mission]'));}
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
async function noTypedAnswer(page,id){
  assert.equal(await page.locator('#adventure-answer-fields input[type="text"],#adventure-answer-fields input[type="number"],#mission-controls input[type="number"],#mission-controls input[type="text"]').count(),0,id+': every answer uses choices or a picture control');
}
function polygonArea(points){
  return Math.abs(points.reduce((sum,p,i)=>{const next=points[(i+1)%points.length];return sum+p[0]*next[1]-next[0]*p[1];},0))/2;
}
async function diagrams(host,v,label){
  assert.equal(await host.locator('svg').count(),1,label);
  assert.equal(await host.evaluate(n=>/NaN|Infinity/.test(n.innerHTML)),false,label+': finite geometry');
  if(v.type==='blocks'){
    assert.equal(await host.locator('[data-math-object="remaining"]').count(),v.start-v.remove,label+': remaining objects');
    assert.equal(await host.locator('[data-math-object="removed"]').count(),v.remove,label+': removed objects');
  }
  if(v.type==='count'&&v.mode==='count')assert.equal(await host.locator('[data-count-object]').count(),v.count,label+': one acorn per object');
  if(v.type==='data'&&v.kind==='bar'){
    const bars=await host.locator('[data-data-bar]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.dataValue)));
    assert.deepEqual(bars,v.values,label+': actual category counts');
  }
  if(v.type!=='primary')return;
  if(v.kind==='ten-frame'){
    assert.equal(await host.locator('[data-frame-space]').count(),v.capacity===20?20:10,label+': fixed frame capacity');
    assert.equal(await host.locator('[data-frame-counter]').count(),v.count,label+': counters track the actual build, including zero');
    if(v.pairBy===2){
      const members=await host.locator('[data-pair-member]').evaluateAll(nodes=>nodes.map(n=>({pair:Number(n.dataset.pairMember),x:Number(n.querySelector('circle').getAttribute('cx')),y:Number(n.querySelector('circle').getAttribute('cy'))})));
      const groups=Map.groupBy(members,m=>m.pair),sizes=[...groups.values()].map(group=>group.length);
      assert.equal(members.length,v.count,label+': every counter belongs to one buddy group');
      assert.equal(sizes.filter(size=>size===2).length,Math.floor(v.count/2),label+': every complete buddy group contains two');
      assert.equal(sizes.filter(size=>size===1).length,v.count%2,label+': only an odd count leaves one friend');
      assert.equal(sizes.filter(size=>size!==1&&size!==2).length,0,label+': groups never hide extra members');
      const outlines=await host.locator('[data-buddy-outline]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.buddyOutline)));
      assert.deepEqual(outlines.sort((a,b)=>a-b),[...groups.keys()].sort((a,b)=>a-b),label+': each occupied pair is visibly outlined');
      for(const group of groups.values())if(group.length===2){
        assert.equal(group[0].x,group[1].x,label+': buddy counters share a vertical column');
        assert.equal(Math.abs(group[0].y-group[1].y),48,label+': buddies occupy adjacent frame seats');
      }
    }
  }
  if(v.kind==='comparison')for(const side of ['left','right']){
    const group=host.locator(`[data-comparison-group="${side}"]`);
    assert.equal(await group.count(),1,label+': group exists');
    assert.equal(Number(await group.getAttribute('data-compare-value')),v[side],label+': exact value is not clamped');
    const represented=await group.locator(`[data-compare-side="${side}"]`).evaluateAll(nodes=>nodes.reduce((sum,n)=>sum+Number(n.dataset.unitValue||1),0));
    assert.equal(represented,v[side],label+': bundles and loose counters carry the right quantity');
  }
  if(v.kind==='length'){
    const step=v.unitStep||1;
    for(let i=0;i<v.lengths.length;i++){
      const units=await host.locator(`[data-length-unit="${i}"]`).evaluateAll(nodes=>nodes.map(n=>({x:Number(n.getAttribute('x')),y:Number(n.getAttribute('y')),width:Number(n.getAttribute('width')),height:Number(n.getAttribute('height')),step:Number(n.dataset.lengthUnitSize)})));
      assert.equal(units.length,v.lengths[i]/step,label+': larger units use fewer blocks');
      assert.ok(units.every(u=>u.step===step),label+': unit size is explicit');
      for(let j=1;j<units.length;j++){
        const a=units[j-1],b=units[j];assert.equal(a.width,b.width);assert.equal(a.height,b.height);
        assert.ok(Math.abs(v.orientation==='vertical'?b.y+b.height-a.y:a.x+a.width-b.x)<1e-8,label+': units touch without gaps or overlaps');
      }
    }
  }
  if(v.kind==='shapes'){
    const composed=v.compose||(v.layout==='join-triangles'?'square':null);
    assert.deepEqual(await host.locator('[data-primary-shape]').evaluateAll(nodes=>nodes.map(n=>n.dataset.primaryShape)),v.shapes,label+': no sorting objects disappear');
    if(composed){
      assert.equal(await host.locator(`[data-composed-shape="${composed}"]`).count(),1);
      if(composed==='square'){
        const polygons=await host.locator('[data-composed-shape] polygon').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('points').trim().split(/\s+/).map(p=>p.split(',').map(Number))));
        assert.equal(polygons.length,2);assert.equal(polygonArea(polygons[0]),polygonArea(polygons[1]),'two congruent half-square regions');
        const points=polygons.flat(),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
        const width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);
        assert.equal(width,height,'the outside has equal square dimensions');
        assert.equal(polygons.reduce((s,p)=>s+polygonArea(p),0),width*height,'the two triangles exactly cover the square');
      }else{
        const rects=await host.locator('[data-composed-shape] rect').evaluateAll(nodes=>nodes.map(n=>Object.fromEntries(['x','y','width','height'].map(k=>[k,Number(n.getAttribute(k))]))));
        assert.equal(rects.length,2);assert.equal(rects[0].width,rects[0].height);assert.equal(rects[1].width,rects[1].height);
        assert.equal(rects[0].x+rects[0].width,rects[1].x,'equal squares share a complete edge');
        assert.equal(rects[0].y,rects[1].y);assert.equal(rects[0].height,rects[1].height);
      }
    }
  }
  if(v.kind==='partition'){
    const parts=await host.locator('[data-equal-part]').evaluateAll(nodes=>nodes.map(n=>({area:Number(n.getAttribute('width'))*Number(n.getAttribute('height')),selected:n.dataset.partSelected==='true'})));
    assert.equal(parts.length,v.parts);assert.equal(parts.filter(p=>p.selected).length,v.selected);
    assert.ok(parts.every(p=>Math.abs(p.area-parts[0].area)<1e-8),label+': shares have equal area');
    assert.ok(Math.abs(parts.reduce((s,p)=>s+p.area,0)-360*132)<1e-8,label+': the whole keeps one fixed area');
  }
  if(v.kind==='money'){
    assert.deepEqual(await host.locator('[data-coin-value]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.coinValue))),v.coins||[],label+': one exact value per coin');
    assert.deepEqual(await host.locator('[data-bill-value]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.billValue))),v.bills||[],label+': bills keep dollar values');
    for(const coin of await host.locator('[data-coin-value]').all())assert.match(await coin.textContent(),/¢/,'coin value has cent unit');
    for(const bill of await host.locator('[data-bill-value]').all())assert.match(await bill.textContent(),/\$/,'bill value has dollar unit');
    if(Number.isInteger(v.groupBreak)&&v.groupBreak>0&&v.groupBreak<(v.coins||[]).length){
      for(const [side,expected] of [['left',v.coins.slice(0,v.groupBreak)],['right',v.coins.slice(v.groupBreak)]]){
        const values=await host.locator(`[data-money-group="${side}"]`).evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.coinValue)));
        assert.deepEqual(values,expected,label+': the '+side+' collection keeps its own coins');
        assert.equal(values.reduce((sum,n)=>sum+n,0),expected.reduce((sum,n)=>sum+n,0),label+': the '+side+' collection keeps its cent value');
      }
    }
  }
}
async function teaching(page,mission){
  if(!await page.locator('#adventure-intro').isVisible())return;
  const concept=conceptFor(mission);assert.ok(concept,mission.id);
  const coins=await page.evaluate(()=>AtlasJourney.load().pet.coins);
  for(let i=0;i<concept.steps.length;i++){
    assert.equal(await page.locator('#concept-position').textContent(),`Part ${i+1} of ${concept.steps.length}`);
    assert.equal(await page.locator('#adventure-mission').isVisible(),false,'concept has its own quiet step');
    await diagrams(page.locator('#concept-visual'),concept.steps[i].visual,concept.id+':'+i);
    if(i<concept.steps.length-1)await page.locator('#concept-next').click();
  }
  await page.locator('#concept-start').click();
  assert.equal(await page.evaluate(()=>AtlasJourney.load().pet.coins),coins,'worked examples do not grade or spend coins');
}
async function enter(page,mission){
  await yearMap(page,mission.gradeIds[0]);
  await page.locator(`.mission-card[data-mission="${mission.id}"]`).click();await teaching(page,mission);
  assert.equal(await page.locator('#mission-title').textContent(),mission.title);
}
async function setControl(page,key,value){
  const control=page.locator(`[data-control="${key}"]`);assert.equal(await control.count(),1,key);
  // Native range changes exercise the same bounded model as the +/− controls;
  // no text field is used for a learner answer.
  await control.fill(String(value));await control.dispatchEvent('input');
}
async function answer(page,t){
  await noTypedAnswer(page,t.id);
  if(t.answer.kind==='choice'){
    const radios=await page.locator('[name="adventure-choice"]').all(),values=await page.locator('[name="adventure-choice"]').evaluateAll(nodes=>nodes.map(n=>n.value));
    const index=values.indexOf(String(t.expected));assert.ok(index>=0,t.id);await radios[index].check();
  }else if(t.answer.kind==='pair'){
    for(const key of t.answer.keys)await setControl(page,key,t.expected[key]);
  }else{
    assert.ok(t.answer.key&&t.inputs.some(i=>i.key===t.answer.key),t.id+': answer is bound to a real control');
    await setControl(page,t.answer.key,t.expected);
  }
  await page.locator('#adventure-check').click();
  assert.equal(await page.locator('#adventure-next').isVisible(),true,t.id+': real controls submit the correct build');
  assert.match(await page.locator('#adventure-feedback').getAttribute('class'),/correct/);
}
async function checkLessonNotes(page,mission){
  assert.equal(await page.locator('#mission-lesson-notes').isVisible(),true,mission.id+': lesson notes exist');
  if(!await page.locator('#mission-worked-example').isVisible())await page.locator('#mission-lesson-notes summary').click();
  for(const [selector,key] of [['#mission-lesson-goal','goal'],['#mission-prerequisite','prerequisite'],['#mission-worked-example','workedExample'],['#mission-explain-prompt','explainPrompt'],['#mission-review-prompt','reviewPrompt']]){
    const text=await page.locator(selector).textContent();assert.ok(text.trim().length>15,mission.id+' '+key);
    if(mission.lessonPlan)assert.equal(text,mission.lessonPlan[key]);
  }
}
async function savedVariant(page,id,seed,step=0){
  const mission=missionById(id);await enter(page,mission);
  await page.evaluate(({id,seed,step})=>AtlasJourney.update({inProgress:{missionId:id,seed,step,answers:{},manipulated:{}}}),{id,seed,step});
  await page.reload();await page.waitForFunction(()=>window.AtlasJourney&&document.body.dataset.adventureView==='mission');
  return currentTask(page);
}
async function yearPaths(){
  const page=await freshPage();
  try{
    for(const [grade,total] of [['k',39],['1',36],['2',37]]){
      await yearMap(page,grade);const year=schoolYearForGrade(grade);assert.ok(year);
      assert.equal(await page.locator('.world-card').count(),6,grade+': six unit cards');
      assert.equal(await page.locator('.mission-card[data-mission]').count(),total,grade+': complete grade inventory');
      const actual=await page.locator('.mission-card[data-mission]').evaluateAll(nodes=>nodes.map(n=>n.dataset.mission));
      assert.deepEqual(actual,orderedMissions(missions,grade).map(m=>m.id),grade+': primary sequence order');
      assert.equal(new Set(actual).size,total,'no duplicate primary activities');
      for(const unit of year.units){
        const card=page.locator(`.world-card[data-world="${unit.id}"]`);
        assert.deepEqual(await card.locator('.mission-card[data-mission]').evaluateAll(nodes=>nodes.map(n=>n.dataset.mission)),unit.missionIds);
        assert.equal(await card.locator('[data-year-review]').count(),unit.reviewMissionIds.length);
        await card.locator('.unit-learning-notes summary').click();
        assert.ok((await card.locator('.unit-learning-notes').textContent()).includes(unit.methods[0]));
      }
      const later=missionById(year.units[3].missionIds[0]);await enter(page,later);await checkLessonNotes(page,later);
      for(let step=0;step<3;step++){await answer(page,await currentTask(page));await page.locator('#adventure-next').click();}
      const order=orderedMissions(missions,grade),index=order.findIndex(m=>m.id===later.id),next=order[index+1];
      await page.locator('#finish-next').click();await teaching(page,next);
      assert.equal(await page.evaluate(()=>AtlasJourney.load().inProgress.missionId),next.id,'continuation starts after the chosen later lesson');
      await yearMap(page,grade);
      const unit=year.units[2],card=page.locator(`.world-card[data-world="${unit.id}"]`);await card.locator('.unit-review summary').click();
      await card.locator('[data-year-review]').first().click();
      assert.equal(await page.evaluate(()=>AtlasJourney.load().inProgress.missionId),unit.reviewMissionIds[0],'review opens its real earlier activity');
      await teaching(page,missionById(unit.reviewMissionIds[0]));
      const familiar=year.units.flatMap(u=>u.missionIds).map(missionById).find(m=>!m.lessonPlan);
      assert.ok(familiar);await enter(page,{...familiar,gradeIds:[grade]});await checkLessonNotes(page,familiar);
    }
  }finally{await page.close();}
}
async function nativeBuildAndResume(){
  const page=await freshPage();
  try{
    await enter(page,missionById('ky-count-picnic'));await answer(page,await currentTask(page));await page.locator('#adventure-next').click();
    const plus=page.locator('#mission-controls [data-control-bump="count"][data-delta="1"]'),minus=page.locator('#mission-controls [data-control-bump="count"][data-delta="-1"]');
    assert.equal(await plus.evaluate(n=>n.tagName),'BUTTON','a native button is available');
    await plus.focus();await plus.press('Enter');
    assert.equal(await plus.evaluate(n=>n===document.activeElement),true,'Enter preserves button focus');
    assert.equal(await page.locator('#mission-visual [data-frame-counter]').count(),1);
    await plus.press('Space');assert.equal(await plus.evaluate(n=>n===document.activeElement),true,'Space preserves button focus');
    assert.equal(await page.locator('#mission-visual [data-frame-counter]').count(),2);
    await minus.focus();await minus.press('Enter');assert.equal(await minus.evaluate(n=>n===document.activeElement),true,'taking one away preserves focus');
    assert.equal(await page.locator('#mission-visual [data-frame-counter]').count(),1);
    const before=await page.evaluate(()=>AtlasJourney.load().inProgress);await page.reload();await page.waitForFunction(()=>document.body.dataset.adventureView==='mission');
    const after=await page.evaluate(()=>AtlasJourney.load().inProgress);
    assert.equal(after.missionId,before.missionId);assert.equal(after.seed,before.seed);assert.equal(after.step,1);assert.equal(after.manipulated[1].count,1);
    assert.equal(await page.locator('#mission-visual [data-frame-counter]').count(),1,'the saved picture resumes at its actual count');
    await page.locator('#adventure-pause').click();await page.reload();await ready(page);
    assert.equal(await page.locator('#adventure-start').getAttribute('data-mission'),'ky-count-picnic','the map offers the paused activity');
    await page.locator('#adventure-start').click();await teaching(page,missionById('ky-count-picnic'));
    assert.equal((await currentTask(page)).step,1);assert.equal(await page.locator('#mission-visual [data-frame-counter]').count(),1);
  }finally{await page.close();}
}
async function mobileReading(){
  const page=await freshPage({width:390,height:844});
  try{
    const settings=await page.evaluate(()=>MathReading.getSettings());assert.equal(settings.size,1.12);assert.equal(settings.oneStep,true);
    for(const large of [false,true]){
      if(large){await home(page);await page.locator('#reading-open').click();await page.locator('#reading-size').selectOption('1.4');await page.locator('#reading-line').selectOption('2.1');await page.locator('#reading-done').click();}
      for(const grade of ['k','1','2']){
        await yearMap(page,grade);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,grade+': phone year map fits at '+(large?'140%':'default')+' text');
      }
      for(const id of ['ky-build-teen','ky-shape-sort','g1y-make-ten','g1y-compare-tens','g2y-compare-digits','g2y-coin-counter']){
        await enter(page,missionById(id));await noTypedAnswer(page,id);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,id+': phone activity fits at '+(large?'140%':'default')+' text');
        assert.equal(await page.locator('#mission-visual').evaluate(n=>n.scrollWidth>n.clientWidth),false,id+': diagram fits');
      }
    }
  }finally{await page.close();}
}
async function screenshots(){
  if(!process.env.ATLAS_SCREENSHOT_DIR)return;
  const dir=resolve(process.env.ATLAS_SCREENSHOT_DIR);await mkdir(dir,{recursive:true});
  const page=await freshPage({width:1440,height:1100});
  try{
    await yearMap(page,'k');await page.evaluate(()=>scrollTo(0,document.querySelector('#map-heading').getBoundingClientRect().top+scrollY-60));
    await page.screenshot({path:resolve(dir,'kindergarten-year-overview.png'),animations:'disabled'});
    let t=await savedVariant(page,'g1y-make-ten',1,2);await setControl(page,t.answer.key,t.expected);
    await page.locator('#mission-title').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(dir,'grade-one-ten-frame.png'),animations:'disabled'});
    await savedVariant(page,'g2y-coin-counter',1);await page.locator('#mission-title').scrollIntoViewIfNeeded();
    await page.screenshot({path:resolve(dir,'grade-two-money.png'),animations:'disabled'});
    await savedVariant(page,'g2y-partner-parade',1,1);await page.locator('#mission-title').scrollIntoViewIfNeeded();
    await page.screenshot({path:resolve(dir,'grade-two-buddies.png'),animations:'disabled'});
  }finally{await page.close();}
}

try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  await yearPaths();console.log('K39 / Grade1 36 / Grade2 37: six-unit sequences, lesson notes, earlier reviews, and later-unit continuation passed.');
  await nativeBuildAndResume();console.log('Kindergarten native +/− keyboard buttons preserve focus, quantities, and save/resume.');
  const page=await freshPage();
  try{
    let challenges=0;
    for(const [index,mission] of primaryMissions.entries()){
      await enter(page,mission);await checkLessonNotes(page,mission);
      const before=await page.evaluate(()=>AtlasJourney.load().pet.coins);
      for(let step=0;step<3;step++){
        const t=await currentTask(page);assert.equal(t.step,step);await noTypedAnswer(page,t.id);
        await diagrams(page.locator('#mission-visual'),await currentVisual(page,t),t.id);await answer(page,t);
        await diagrams(page.locator('#mission-visual'),await currentVisual(page,t),t.id+': accepted');
        await page.locator('#adventure-next').click();challenges++;
      }
      assert.equal(await page.evaluate(id=>AtlasJourney.load().completed[id]?.steps,mission.id),3);
      assert.equal(await page.evaluate(()=>AtlasJourney.load().pet.coins),before+15,'one lesson rewards participation once');
      if((index+1)%12===0)console.log(`${index+1}/72 new primary lessons and ${challenges}/216 real UI challenges passed.`);
    }
    assert.equal(challenges,216);
    for(const [id,seed] of [['g1y-compare-tens',3],['g2y-compare-digits',1]]){
      const t=await savedVariant(page,id,seed);assert.equal(t.visual.left,id.startsWith('g1')?87:348);
      await diagrams(page.locator('#mission-visual'),await currentVisual(page,t),id+': large exact value');
    }
    const two=await savedVariant(page,'g2y-ruler-start',1,1);assert.equal(two.visual.unitStep,2);
    await diagrams(page.locator('#mission-visual'),await currentVisual(page,two),'two-centimeter units');
    assert.equal(await page.locator('#mission-visual [data-length-unit]').count(),3,'six centimeters use three two-centimeter blocks');
    const bills=await savedVariant(page,'g2y-tiny-shop',1,2);assert.equal(bills.visual.bills.length,5);
    await diagrams(page.locator('#mission-visual'),await currentVisual(page,bills),'five dollar bills');
    const buddies=await savedVariant(page,'g2y-partner-parade',1,1);assert.equal(buddies.visual.count,15);assert.equal(buddies.visual.pairBy,2);
    await diagrams(page.locator('#mission-visual'),await currentVisual(page,buddies),'fifteen friends make seven pairs and one leftover');
  }finally{await page.close();}
  await mobileReading();console.log('All 216 primary challenges, exact large comparisons, two-centimeter units, cent/dollar labels, and default/140% mobile reading passed.');
  await screenshots();
  assert.deepEqual(errors,[],'No uncaught primary lesson errors');assert.deepEqual(failed,[],'All primary lesson assets load');
}finally{
  if(browser)await browser.close();await new Promise(done=>server.close(done));
}
