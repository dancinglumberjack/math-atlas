import {primaryMissions,primaryUnitSets} from './primary-content.mjs';

// Existing practice remains available once in each applicable grade. New
// activities provide the progression; these familiar activities revisit it.
const familiar={
 k:[['meadow-count','meadow-small-trail','meadow-zero'],['meadow-ten-trail'],['meadow-compare','meadow-same-number','meadow-fewer','pond-make-ten'],['meadow-add','pond-count-on','pond-take-all'],['meadow-shape-sort'],['meadow-shapes','meadow-shape-sides','meadow-patterns']],
 '1':[['meadow-tens','pond-ten-trade'],['meadow-add','pond-count-on','pond-make-ten','pond-doubles'],['meadow-subtract','pond-take-all','pond-missing-part'],[],['clock-hours','clock-halves'],['meadow-patterns']],
 '2':[['meadow-tens','pond-ten-trade'],['meadow-add','meadow-subtract','pond-count-on','pond-take-all','pond-missing-part','pond-make-ten','pond-doubles'],[],[],['clock-hours','clock-halves','clock-quarters','clock-five-minutes'],[]]
};
export const primaryYears=primaryUnitSets.map(set=>{
 const units=set.units.map((unit,i)=>({...unit,sequence:i+1,missionIds:[...unit.missionIds,...familiar[set.gradeId][i]],standards:[...new Set(primaryMissions.filter(m=>m.unitId===unit.id).flatMap(m=>m.standards))],prerequisiteMissionIds:i?[set.units[i-1].missionIds[0]]:[],reviewMissionIds:[]}));
 for(let i=0;i<units.length;i++){const ids=[...(i?[units[i-1].missionIds[0]]:[]),units[i].missionIds[0],units[i].missionIds.at(-1),units[i].missionIds[1]];units[i].reviewMissionIds=[...new Set(ids)].slice(0,3);}
 return {id:'math-atlas-grade-'+set.gradeId+'-year',gradeId:set.gradeId,label:set.label,title:'A year of '+set.label+' discoveries',description:'Six connected units with pictures, worked examples, hands-on practice, and familiar ideas to revisit.',paceNote:'About 36 flexible study weeks. Explore together, repeat, or take a break whenever useful.',coverageNote:'A growing practice companion. A short activity is one part of a learning session; completion records practice rather than mastery.',units};
});
