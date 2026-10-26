export function httpError(status,message) { return Object.assign(Error(message),{status}); }
export function required(value,message='Не найдено') { if(!value) throw httpError(404,message); return value; }
export function check(condition,message) { if(!condition) throw httpError(400,message); }
export function shuffle(items,random=Math.random) {
 const a=[...items]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a;
}
export function progress(db,id) {
 return db.prepare('SELECT * FROM lesson_progress WHERE lesson_id=?').get(id)||
 {lesson_id:id,status:'not_started',scroll_pos:0,time_spent_sec:0};
}
export function examState(db,c,id,all) {
 if(id==='final'){
  const remaining=c.exams.filter(e=>!db.prepare('SELECT 1 FROM exam_attempts WHERE exam_id=? AND passed=1').get(e.id)).length;
  const total=c.exams.reduce((n,e)=>n+e.questions.length,0);
  return {available:remaining===0&&total>=c.course.final_exam.questions_per_attempt,remaining};
 }
 const e=required(c.examById.get(id),'Экзамен не найден');
 const remaining=c.topics.find(t=>t.id===e.topic).lessons.filter(l=>!l.optional&&(all ? all.get(l.id)?.status : progress(db,l.id).status)!=='completed').length;
 return {available:remaining===0,remaining};
}
export function lessonSummary(db,l,all) {
 const {id,title,icon,summary,minutes,level,optional,kind,topic}=l;
 return {id,title,icon,summary,minutes,level,optional,kind,topic,...(all ? all.get(id)||{lesson_id:id,status:'not_started',scroll_pos:0,time_spent_sec:0} : progress(db,id))};
}


export const dayKey = (date = new Date()) => new Intl.DateTimeFormat('sv-SE').format(date);

export function progressMap(db) {
  return new Map(db.prepare('SELECT * FROM lesson_progress').all().map(row => [row.lesson_id, row]));
}
