import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const window={};
runInNewContext(readFileSync(new URL('../src/primary-visuals.js',import.meta.url),'utf8'),{window});
const draw=visual=>window.AtlasPrimaryVisuals.render(visual,null,{}, {svg:(body,label,box)=>`<svg viewBox="${box}">${body}<title>${label}</title></svg>`,esc:String});
const instances=(source,needle)=>(source.match(new RegExp(needle,'g'))||[]).length;

test('frames preserve twenty separate objects, empty spaces, and a real zero',()=>{
 for(const n of [0,1,5,10,13,19,20]){const {markup}=draw({type:'primary',kind:'ten-frame',capacity:20,count:n});assert.equal(instances(markup,'data-frame-space='),20);assert.equal(instances(markup,'data-frame-counter='),n);}
});
test('buddy pictures show complete pairs and exactly one leftover for an odd collection',()=>{
 for(const [n,pairs,leftover]of[[6,3,0],[7,3,1],[14,7,0],[15,7,1]]){
  const markup=draw({type:'primary',kind:'ten-frame',capacity:20,count:n,pairBy:2}).markup;
  const groups=new Map();for(const match of markup.matchAll(/data-pair-member="(\d+)"/g))groups.set(match[1],(groups.get(match[1])||0)+1);
  assert.equal([...groups.values()].filter(n=>n===2).length,pairs);assert.equal([...groups.values()].filter(n=>n===1).length,leftover);
  assert.equal(instances(markup,'data-frame-counter='),n);
 }
});
test('taking away preserves the original collection and marks only the removed part',()=>{
 for(const [start,removed,remaining]of[[7,3,4],[5,5,0],[0,0,0],[12,0,12]]){const {markup}=draw({type:'blocks',start,remove:removed});assert.equal(instances(markup,'data-math-object="removed"'),removed);assert.equal(instances(markup,'data-math-object="remaining"'),remaining);assert.equal(instances(markup,'data-object='),start);}
});
test('comparisons and equal-unit lengths retain exact group counts',()=>{
 const comparison=draw({type:'primary',kind:'comparison',left:4,right:7}).markup;assert.equal(instances(comparison,'data-compare-side="left"'),4);assert.equal(instances(comparison,'data-compare-side="right"'),7);
 for(const orientation of['horizontal','vertical']){const length=draw({type:'primary',kind:'length',lengths:[3,6,8],orientation}).markup;for(const [index,n]of[[0,3],[1,6],[2,8]])assert.equal(instances(length,`data-length-unit="${index}"`),n);assert.doesNotMatch(length,/NaN|Infinity/);}
});
test('equal-share partitions and composed shapes cover fixed wholes',()=>{
 for(const layout of['rows','columns','grid']){const {markup}=draw({type:'primary',kind:'partition',parts:4,selected:1,layout});assert.equal(instances(markup,'data-equal-part='),4);assert.equal(instances(markup,'data-part-selected="true"'),1);}
 const square=draw({type:'primary',kind:'shapes',shapes:['triangle','triangle'],compose:'square'}).markup;assert.equal(instances(square,'data-primary-shape="triangle"'),2);assert.match(square,/195,80 365,80 365,250/);assert.match(square,/195,80 365,250 195,250/);
 const rectangle=draw({type:'primary',kind:'shapes',shapes:['square','square'],compose:'rectangle'}).markup;assert.equal(instances(rectangle,'data-primary-shape="square"'),2);assert.match(rectangle,/x="140" y="100" width="140" height="140"/);assert.match(rectangle,/x="280" y="100" width="140" height="140"/);
});
test('labeled money and number charts keep quantity and denomination distinct',()=>{
 const coins=draw({type:'primary',kind:'money',coins:[25,10,5,1],currency:'USD'}).markup;for(const n of[25,10,5,1])assert.equal(instances(coins,`data-coin-value="${n}"`),1);
 const chart=draw({type:'primary',kind:'number-chart',start:101,end:120,highlight:[110]}).markup;assert.equal(instances(chart,'data-chart-cell='),20);assert.match(chart,/data-chart-cell="101"/);assert.match(chart,/data-chart-cell="120"/);assert.doesNotMatch(chart,/NaN|Infinity/);
});
