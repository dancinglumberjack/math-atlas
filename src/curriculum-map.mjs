import { missions } from './adventure-model.mjs';

// These are useful starting points, not placements or complete grade courses.
// High-school sequences differ; a learner can freely choose a different grade.
export const grades = [
  {id:'pre-k',label:'Pre-K',bandId:'pre-k'}, {id:'k',label:'Kindergarten',bandId:'early'},
  ...Array.from({length:12},(_,i)=>({id:String(i+1),label:'Grade '+(i+1),bandId:i<2?'early':i<5?'elementary':i<8?'middle':'high'})),
  {id:'college',label:'College explorations',bandId:'college'}
];
export const topics = [
  ['counting','Counting & comparing'],['shapes','Shapes & sorting'],['patterns','Patterns'],
  ['addition','Addition'],['subtraction','Subtraction'],['place-value','Place value'],['time','Clocks & time'],
  ['multiplication','Multiplication'],['division','Division'],['fractions','Fractions'],
  ['measurement','Area & perimeter'],['volume','Volume'],['ratios','Ratios & rates'],['percents','Percents'],
  ['integers','Signed numbers'],['equations','Equations'],['functions','Lines & functions'],
  ['quadratics','Quadratics'],['exponents','Powers & growth'],['calculus','Change & accumulation'],['vectors','Vectors']
].map(([id,label])=>({id,label}));

export const learningSources = [
  {id:'im-g3-arrays',title:'Represent Arrays with Expressions · Grade 3, Unit 1, Lesson 18',url:'https://im.kendallhunt.com/k5/teachers/grade-3/unit-1/lesson-18/lesson.html',attribution:'Adapted from IM K–12 Math, © 2021 Illustrative Mathematics®, under CC BY 4.0. Math Atlas is an independent adaptation.',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',changes:'Shorter instructions, new stories and examples, original interactive diagrams, and individual practice instead of classroom partner activities.'},
  {id:'im-g3-division-groups',title:'How Many Groups? · Grade 3, Unit 4, Lesson 1',url:'https://im.kendallhunt.com/k5/teachers/grade-3/unit-4/lesson-1/lesson.html',attribution:'Adapted from IM K–12 Math, © 2021 Illustrative Mathematics®, under CC BY 4.0. Math Atlas is an independent adaptation.',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',changes:'Shorter instructions, new stories and examples, original interactive diagrams, and individual practice instead of classroom posters and gallery walks.'}
];

const p=(gradeIds,topicId,standards=[])=>({gradeIds,topicId,standards,sourceIds:[]});
const placements={
  'meadow-count':p(['pre-k','k'],'counting',['K.CC.B.4']),
  'meadow-compare':p(['pre-k','k'],'counting',['K.CC.C.6']),
  'meadow-shapes':p(['pre-k','k'],'shapes',['K.G.A.2']),
  'meadow-add':p(['k','1','2'],'addition',['1.OA.A.1']),
  'meadow-subtract':p(['k','1','2'],'subtraction',['1.OA.A.1']),
  'meadow-tens':p(['1','2'],'place-value',['1.NBT.B.2']),
  'clock-hours':p(['1','2'],'time',['1.MD.B.3']),
  'clock-halves':p(['1','2'],'time',['1.MD.B.3']),
  'clock-quarters':p(['2','3'],'time',['2.MD.C.7']),
  'meadow-groups':p(['3','4'],'multiplication',['3.OA.A.1']),
  'meadow-fractions':p(['3','4','5'],'fractions',['3.NF.A.1']),
  'meadow-arrays':p(['3','4'],'multiplication',['3.OA.A.3']),
  'garden-color':p(['6','7'],'ratios',['6.RP.A.1']),
  'garden-market':p(['6','7'],'ratios',['6.RP.A.2']),
  'garden-repair':p(['6','7'],'ratios',['6.RP.A.3']),
  'cargo-lift':p(['6','7','8'],'equations',['7.EE.B.4']),
  'cargo-equality':p(['6','7','8'],'equations',['6.EE.B.7']),
  'cargo-check':p(['6','7','8'],'equations',['7.EE.B.4']),
  'room-floor':p(['3','4'],'measurement',['3.MD.C.7']),
  'room-border':p(['3','4'],'measurement',['3.MD.D.8']),
  'room-stack':p(['5','6'],'volume',['5.MD.C.5']),
  'fountain-peak':p(['9','10','11'],'quadratics',['HSF.IF.C.7a']),
  'fountain-land':p(['9','10','11'],'quadratics',['HSA.REI.B.4']),
  'fountain-height':p(['9','10','11'],'quadratics',['HSF.IF.B.4']),
  'campus-slope':p(['12','college'],'calculus'),
  'campus-area':p(['12','college'],'calculus'),
  'campus-vectors':p(['11','12','college'],'vectors',['HSN.VM.B.4'])
};
const conceptPlacements={
  counting:p(['pre-k','k'],'counting',['K.CC.B.4']),zero:p(['pre-k','k'],'counting',['K.CC.A.3']),
  compare:p(['pre-k','k'],'counting',['K.CC.C.6']),shapes:p(['pre-k','k'],'shapes',['K.G.A.2']),
  sorting:p(['pre-k','k'],'shapes',['K.MD.B.3']),patterns:p(['pre-k','k','1'],'patterns'),
  addition:p(['k','1','2'],'addition',['1.OA.C.6']),subtraction:p(['k','1','2'],'subtraction',['1.OA.C.6']),
  'missing-parts':p(['1','2'],'addition',['1.OA.D.8']),'make-ten':p(['k','1','2'],'addition',['1.OA.C.6']),
  'place-value':p(['1','2'],'place-value',['1.NBT.B.2']),
  'clock-quarters':p(['2','3'],'time',['2.MD.C.7']),'clock-halves':p(['1','2'],'time',['1.MD.B.3']),
  'clock-minutes':p(['2','3'],'time',['2.MD.C.7']),'clock-elapsed':p(['3','4'],'time',['3.MD.A.1']),
  fractions:p(['3','4'],'fractions',['3.NF.A.1']),'fraction-equivalence':p(['3','4','5'],'fractions',['4.NF.A.1']),
  multiplication:p(['3','4'],'multiplication',['3.OA.A.1']),division:p(['3','4'],'division',['3.OA.A.2']),
  area:p(['3','4'],'measurement',['3.MD.C.7']),perimeter:p(['3','4'],'measurement',['3.MD.D.8']),
  negatives:p(['6','7'],'integers',['6.NS.C.5']),ratio:p(['6','7'],'ratios',['6.RP.A.1']),
  proportion:p(['6','7'],'ratios',['7.RP.A.2']),percent:p(['6','7'],'percents',['6.RP.A.3c']),
  equations:p(['6','7','8'],'equations',['7.EE.B.4']),lines:p(['8','9','10'],'functions',['8.F.A.3']),
  systems:p(['8','9','10'],'equations',['8.EE.C.8']),
  quadratics:p(['9','10','11'],'quadratics',['HSF.IF.C.7a']),'quadratics-up':p(['9','10','11'],'quadratics',['HSF.IF.C.7a']),
  exponentials:p(['9','11','12'],'exponents',['HSF.LE.A.1c']),'exponential-decay':p(['9','11','12'],'exponents',['HSF.LE.A.1c']),
  powers:p(['8','9','11'],'exponents',['8.EE.A.1']),derivative:p(['12','college'],'calculus'),
  'derivative-power':p(['12','college'],'calculus'),'tangent-line':p(['12','college'],'calculus'),
  integral:p(['12','college'],'calculus'),'integral-constant':p(['12','college'],'calculus'),
  'integral-interval':p(['12','college'],'calculus'),vectors:p(['11','12','college'],'vectors',['HSN.VM.B.4']),
  'vector-scale':p(['11','12','college'],'vectors',['HSN.VM.B.5']),
  'vector-difference':p(['11','12','college'],'vectors',['HSN.VM.B.4'])
};
export function gradeById(id){return grades.find(g=>g.id===id)||null;}
export function topicById(id){return topics.find(t=>t.id===id)||null;}
export function missionSources(mission){
  return (missionPlacement(mission)?.sourceIds||[]).map(id=>learningSources.find(s=>s.id===id)).filter(Boolean).map(source=>({...source}));
}
export function missionPlacement(mission){
  if(typeof mission==='string')mission=missions.find(m=>m.id===mission);
  if(!mission)return null;
  const fallback=placements[mission.id]||conceptPlacements[mission.conceptKey||mission.conceptId];
  const value={...fallback,...(mission.gradeIds?{gradeIds:mission.gradeIds}:{}),...(mission.topicId?{topicId:mission.topicId}:{}),...(mission.standards?{standards:mission.standards}:{}),...(mission.sourceIds?{sourceIds:mission.sourceIds}:{})};
  if(!value.gradeIds||!topicById(value.topicId))throw new RangeError('A mission needs a grade and topic: '+mission.id);
  return {...value,gradeIds:[...value.gradeIds],standards:[...(value.standards||[])],sourceIds:[...(value.sourceIds||[])]};
}
export function filterMissions({gradeId='all',topicId='all',bandId='middle'}={}){
  if(gradeId!=='all'&&!gradeById(gradeId)||topicId!=='all'&&!topicById(topicId))return [];
  return missions.filter(m=>{const v=missionPlacement(m);return (gradeId==='all'?m.bandId===bandId:v.gradeIds.includes(gradeId))&&(topicId==='all'||v.topicId===topicId);});
}
