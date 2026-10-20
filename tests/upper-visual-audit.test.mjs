import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Fixed mathematical examples are independent of lesson generation. Check the
// actual SVG geometry and quantities, not a second copy of the lesson formulas.
const context=vm.createContext({window:{}});
for(const name of ['year-visuals.js','upper-visuals.js'])vm.runInContext(readFileSync(new URL('../src/'+name,import.meta.url),'utf8'),context);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const helpers={esc,fmt:value=>String(Math.round(value*1e9)/1e9),svg:(body,title,box)=>`<svg viewBox="${box}"><title>${esc(title)}</title>${body}</svg>`};
const render=(kind,details={},trial=null,proposal={})=>context.window.AtlasUpperVisuals.render({type:'upper',kind,...details},trial,proposal,helpers);
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const tags=(svg,key)=>[...svg.matchAll(/<(?:g|rect|circle|path|polygon)\b[^>]*>/g)].map(m=>attrs(m[0])).filter(a=>key in a);
const groups=(svg,key,value)=>[...svg.matchAll(/<g\b[^>]*>[\s\S]*?<\/g>/g)].map(m=>m[0]).filter(s=>new RegExp(`${key}="${value}"`).test(s));
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-7,message+`: ${a} versus ${b}`);
const points=value=>value.trim().split(/\s+/).map(p=>p.split(',').map(Number));
const area=pts=>Math.abs(pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;

test('305042 and 6.008 retain zero places and reconstruct their given quantities',()=>{
  for(const [value,places,zeroExponents] of [[305042,0,[4,2]],[6.008,3,[2,1,-1,-2]]]){
    const svg=render('place-value',{value,decimalPlaces:places}).markup,chart=tags(svg,'data-place-exponent');
    assert.deepEqual(chart.filter(a=>a['data-place-digit']==='0').map(a=>Number(a['data-place-exponent'])),zeroExponents);
    near(chart.reduce((sum,a)=>sum+Number(a['data-place-digit'])*Number(a['data-place-weight']),0),value,'place weights reconstruct the original');
  }
});

test('23 × 14 has the four literal partial products 200, 80, 30, and 12 at one physical scale',()=>{
  const svg=render('product-area',{rows:[20,3],columns:[10,4]}).markup;
  const cells=groups(svg,'data-area-row','[^"\\n]+').map(g=>({meta:attrs(g.slice(0,g.indexOf('>')+1)),rect:tags(g,'width')[0]}));
  assert.deepEqual(cells.map(c=>Number(c.meta['data-area-product'])),[200,80,30,12]);
  assert.equal(cells.reduce((sum,c)=>sum+Number(c.meta['data-area-product']),0),322);
  const scales=cells.flatMap(c=>[Number(c.rect.width)/Number(c.meta['data-area-column']),Number(c.rect.height)/Number(c.meta['data-area-row'])]);
  for(const scale of scales)near(scale,scales[0],'all partial areas use one length scale');
});

test('four-digit partial products use a clearly identified readable table when true strips would vanish',()=>{
  const result=render('product-area',{rows:[3],columns:[2000,10,3]});
  assert.deepEqual(tags(result.markup,'data-area-product').map(a=>Number(a['data-area-product'])),[6000,30,9]);
  assert.equal(tags(result.markup,'data-area-schematic').length,3);
  assert.match(result.caption,/table/);assert.match(result.caption,/sizes are for reading/);
});

test('184 ÷ 8 keeps the whole fixed and checks friendly groups against it',()=>{
  const details={total:184,divisor:8,chunks:[20,3]},exact=render('quotient',details,23),short=render('quotient',details,22);
  assert.deepEqual(tags(exact.markup,'data-chunk-items').map(a=>Number(a['data-chunk-items'])),[160,24]);
  assert.equal(Number(tags(exact.markup,'data-quotient-trial')[0]['data-leftover']),0);
  assert.equal(Number(tags(short.markup,'data-quotient-trial')[0]['data-leftover']),8);
  assert.deepEqual(tags(exact.markup,'data-quotient-given'),tags(short.markup,'data-quotient-given'));
});

test('fraction trials above one use the same whole size without changing the given seven fourths',()=>{
  const details={bars:[{num:7,den:4,label:'Seven fourths'}],maxWholes:3,responseDenominator:4};
  const first=render('fraction-bars',details,.5),second=render('fraction-bars',details,2.5);
  assert.deepEqual(groups(first.markup,'data-fraction-bar','given'),groups(second.markup,'data-fraction-bar','given'));
  const bars=tags(second.markup,'data-fraction-bar');assert.deepEqual(bars.map(a=>Number(a['data-fraction-value'])),[1.75,2.5]);
  near(Number(bars[0]['data-unit-width']),Number(bars[1]['data-unit-width']),'matching whole lengths for given and trial');
});

test('six pieces are a count while three halves are a fractional amount',()=>{
  const given={bars:[{num:2,den:1,label:'Two liters'}],maxWholes:2,partitionDen:3};
  const count=render('fraction-bars',{...given,answerKeys:{value:'response'},responseLabel:'Portions'},6);
  assert.equal(tags(count.markup,'data-fraction-bar').filter(a=>a['data-fraction-bar']==='trial').length,0,'six portions must not be drawn as six liters');
  assert.equal(Number(tags(count.markup,'data-upper-trial')[0]['data-upper-trial']),6);
  const amount=render('fraction-bars',{...given,answerKeys:{value:'fraction'},responseDenominator:2},1.5);
  const bars=tags(amount.markup,'data-fraction-bar').filter(a=>a['data-fraction-bar']==='trial');
  assert.equal(bars.length,1);assert.equal(Number(bars[0]['data-fraction-value']),1.5);
});

test('a remainder response counts leftover items rather than another quotient',()=>{
  const details={total:710,divisor:24,chunks:[20,9]};
  const remainder=render('quotient',{...details,trialMode:'remainder'},14),extraBox=render('quotient',{...details,trialMode:'none'},30);
  assert.equal(Number(tags(remainder.markup,'data-quotient-trial')[0]['data-trial-items']),14,'fourteen leftover items are not fourteen groups of twenty-four');
  assert.equal(tags(extraBox.markup,'data-quotient-trial').length,0,'an extra partly filled box is not presented as a full quotient');
  assert.equal(Number(tags(extraBox.markup,'data-upper-trial')[0]['data-upper-trial']),30);
});

test('47 hundredths and a 230-hundredth trial keep independent fixed-size grids',()=>{
  const first=render('decimal-grid',{value:.47,places:2},.2),second=render('decimal-grid',{value:.47,places:2},2.3);
  const given=groups(second.markup,'data-decimal-grid','given'),trial=groups(second.markup,'data-decimal-grid','trial');
  assert.equal(given.length,3);assert.equal(trial.length,3);
  assert.equal(given.flatMap(g=>tags(g,'data-grid-cell')).filter(a=>a['data-filled']==='true').length,47);
  assert.equal(trial.flatMap(g=>tags(g,'data-grid-cell')).filter(a=>a['data-filled']==='true').length,230);
  assert.deepEqual(groups(first.markup,'data-decimal-grid','given'),given,'a larger trial cannot enlarge or move the given whole');
  for(const cell of [...given,...trial].flatMap(g=>tags(g,'data-grid-cell')))near(Number(cell.width)*Number(cell.height),156.25,'one hundredth of a 125-square whole');
});

test('two thirds of three fourths has six of twelve equal-area overlap regions',()=>{
  const cells=tags(render('fraction-product',{left:[2,3],right:[3,4]}).markup,'data-fraction-product-cell');
  assert.equal(cells.length,12);assert.equal(cells.filter(a=>a['data-overlap']==='true').length,6);
  for(const cell of cells)near(Number(cell.width)*Number(cell.height),3675,'each overlap-grid piece has equal area');
});

test('a 135-degree given angle uses genuinely obtuse ray geometry',()=>{
  const given=groups(render('angle',{degrees:135}).markup,'data-given-angle','135')[0];
  const paths=tags(given,'d').map(a=>a.d.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi).map(Number));
  assert.equal(paths.length,2);
  const vectors=paths.map(p=>[p[2]-p[0],p[3]-p[1]]),dot=vectors[0][0]*vectors[1][0]+vectors[0][1]*vectors[1][1];
  near(Math.acos(dot/(Math.hypot(...vectors[0])*Math.hypot(...vectors[1])))*180/Math.PI,135,'angle between given rays');
});

test('a missing-angle trial starts after the known part and completes the whole angle',()=>{
  for(const [whole,known,missing] of [[90,40,50],[180,120,60]]){
    const svg=render('angle',{degrees:whole,splitAt:known},missing).markup;
    const trial=tags(svg,'data-angle-trial')[0];
    assert.equal(Number(trial['data-angle-trial-start']),known);
    assert.equal(Number(trial['data-angle-trial-end']),whole);
  }
});

test('coordinate (4, 3) stays fixed while a separate proposed point uses (2, 8)',()=>{
  const result=render('coordinates',{points:[{x:4,y:3,label:'A'}],maxX:10,maxY:10,answerPoint:true},null,{x:2,y:8});
  const given=groups(result.markup,'data-coordinate-given','4,3')[0],trial=groups(result.markup,'data-coordinate-trial','2,8')[0];
  assert.equal(tags(given,'cx')[0].cx,'241');assert.equal(tags(given,'cy')[0].cy,'211');
  assert.equal(tags(trial,'cx')[0].cx,'163');assert.equal(tags(trial,'cy')[0].cy,'96');
});

test('volume parts contain 24 and 6 equal unit cubes with a shared cube scale',()=>{
  const svg=render('volume-parts',{prisms:[{length:2,width:3,height:4},{length:1,width:2,height:3}]}).markup;
  assert.deepEqual(tags(svg,'data-volume-cubes').map(a=>Number(a['data-volume-cubes'])),[24,6]);
  assert.equal(tags(svg,'data-unit-cube').length,30);
  const cubes=groups(svg,'data-unit-cube','[^"\\n]+'),topAreas=cubes.map(g=>area(points(tags(g,'points')[2].points)));
  assert.equal(topAreas.length,30);
  for(const top of topAreas)near(top,topAreas[0],'all small cubes have equal top-face area');
});
