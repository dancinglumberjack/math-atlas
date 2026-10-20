import {kMissions,kTaskFor,kConcepts,kUnits} from './grade-k-content.mjs';
import {g1Missions,g1TaskFor,g1Concepts,g1Units} from './grade1-content.mjs';
import {g2Missions,g2TaskFor,g2Concepts,g2Units} from './grade2-content.mjs';

export const primaryMissions=[...kMissions,...g1Missions,...g2Missions];
export const primaryConcepts=[...kConcepts,...g1Concepts,...g2Concepts];
export const primaryUnitSets=[{gradeId:'k',label:'Kindergarten',units:kUnits},{gradeId:'1',label:'Grade 1',units:g1Units},{gradeId:'2',label:'Grade 2',units:g2Units}];
export function primaryTaskFor(id,step=0,seed=1){
  if(typeof id!=='string')return null;
  if(id.startsWith('ky-'))return kTaskFor(id,step,seed);
  if(id.startsWith('g1y-'))return g1TaskFor(id,step,seed);
  if(id.startsWith('g2y-'))return g2TaskFor(id,step,seed);
  return null;
}
