import { questionType } from './content.js';
export function parseNumber(value) {
 if(typeof value==='number') return Number.isFinite(value)?value:NaN;
 if(typeof value!=='string' || !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return NaN;
 return Number(value.trim().replace(',','.'));
}
export function validAnswer(q,a) {
 const type=questionType(q);
 if(type==='numeric') return Number.isFinite(parseNumber(a));
 if(type==='multi') return Array.isArray(a) && new Set(a).size===a.length &&
  a.every(i=>Number.isInteger(i)&&i>=0&&i<q.options.length);
 return Number.isInteger(a)&&a>=0&&a<q.options.length;
}
export function grade(q,a) {
 if(!validAnswer(q,a)) return false;
 if(questionType(q)==='numeric'){
  const tolerance=q.answer===0?0.001:Math.abs(q.answer)*(q.tolerance_percent??1)/100;
  return Math.abs(parseNumber(a)-q.answer)<=tolerance+Number.EPSILON*10;
 }
 if(questionType(q)==='multi') return a.length===q.answer.length&&a.every(v=>q.answer.includes(v));
 return a===q.answer;
}

