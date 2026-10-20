import {g4Missions,g4TaskFor,g4Concepts,g4Units} from './grade4-content.mjs';
import {g5Missions,g5TaskFor,g5Concepts,g5Units} from './grade5-content.mjs';

export const upperMissions=[...g4Missions,...g5Missions];
export const upperConcepts=[...g4Concepts,...g5Concepts];
export const upperUnitSets=[{gradeId:'4',label:'Grade 4',units:g4Units},{gradeId:'5',label:'Grade 5',units:g5Units}];
export function upperTaskFor(id,step=0,seed=1){
 if(typeof id!=='string')return null;
 if(id.startsWith('g4y-'))return g4TaskFor(id,step,seed);
 if(id.startsWith('g5y-'))return g5TaskFor(id,step,seed);
 return null;
}
