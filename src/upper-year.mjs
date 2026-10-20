import {upperMissions,upperUnitSets} from './upper-content.mjs';

const familiar={
 '4':[[],['meadow-groups','meadow-arrays','picnic-skip-groups'],['picnic-share-bags'],[],['meadow-fractions','ribbon-unit-parts','ribbon-equal-share','ribbon-equivalence'],[],['room-floor','room-border','clock-elapsed','studio-same-area','studio-border-repair','studio-factor-room'],[]],
 '5':[[],[],[],['meadow-fractions','ribbon-equivalence'],[],[],['room-stack'],[]]
};
export const upperYears=upperUnitSets.map(set=>{
 const units=set.units.map((unit,i)=>({...unit,sequence:i+1,missionIds:[...unit.missionIds,...familiar[set.gradeId][i]],standards:[...new Set(upperMissions.filter(m=>m.unitId===unit.id).flatMap(m=>m.standards))],prerequisiteMissionIds:i?[set.units[i-1].missionIds[0]]:[],reviewMissionIds:[]}));
 for(let i=0;i<units.length;i++)units[i].reviewMissionIds=[...new Set([...(i?[units[i-1].missionIds[0]]:[]),units[i].missionIds[0],units[i].missionIds.at(-1),units[i].missionIds[1]])].slice(0,3);
 return {id:'math-atlas-grade-'+set.gradeId+'-year',gradeId:set.gradeId,label:set.label,title:'A year of '+set.label+' discoveries',description:'Eight connected units with visual explanations, model-based practice, and ideas to revisit.',paceNote:'About 36 flexible study weeks. Explore, repeat, or take a break whenever useful.',coverageNote:'A growing practice companion. A short activity is one part of a learning session; completion records practice rather than mastery.',units};
});
