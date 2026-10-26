import { shuffle } from './helpers.js';
import { publicQuestion, questionType } from './content.js';
export function examDefinition(c,id) {
 return id==='final'?{...c.course.final_exam,questions:c.exams.flatMap(e=>e.questions)}:c.examById.get(id);
}
export function selectQuestions(db,c,exam) {
 const seen=new Set(),wrong=new Set(),last=new Set();
 const attempts=db.prepare('SELECT * FROM exam_attempts WHERE exam_id=? AND finished_at IS NOT NULL ORDER BY id DESC').all(exam.id);
 attempts.forEach((a,i)=>JSON.parse(a.question_ids_json).forEach(q=>{
  const id=typeof q==='string'?q:q.id;seen.add(id);if(i===0)last.add(id);
 }));
 db.prepare('SELECT question_id FROM exam_answers WHERE is_correct=0').all().forEach(q=>wrong.add(q.question_id));
 const rank=q=>(seen.has(q.id)?(wrong.has(q.id)?1:2):0)+(last.has(q.id)?3:0);
 const groups=new Map();
 for(const q of shuffle(exam.questions)){
  const group=exam.id==='final'?c.lessonById.get(q.lesson).topic:q.lesson;
  if(!groups.has(group))groups.set(group,[]);
  groups.get(group).push(q);
 }
 groups.forEach(g=>g.sort((a,b)=>rank(a)-rank(b)));
 const order=shuffle([...groups.keys()]), selected=[];
 while(selected.length<exam.questions_per_attempt){
  let added=false;
  for(const key of order){
   const q=groups.get(key).shift();
   if(q){selected.push(q);added=true;}
   if(selected.length===exam.questions_per_attempt)break;
  }
  if(!added)break;
 }
 return shuffle(selected).map(q=>({id:q.id,order:q.options?shuffle(q.options.map((_,i)=>i)):null}));
}
export function hydrateQuestions(exam,selection) {
 return selection.map(ref=>{
  const q=exam.questions.find(q=>q.id===ref.id);
  if(!ref.order)return q;
  const answer=questionType(q)==='multi'?q.answer.map(a=>ref.order.indexOf(a)):ref.order.indexOf(q.answer);
  return {...q,options:ref.order.map(i=>q.options[i]),answer};
 });
}
export const examPublic=questions=>questions.map(publicQuestion);
export function result(db,c,attempt) {
 const exam=examDefinition(c,attempt.exam_id);
 const questions=hydrateQuestions(exam,JSON.parse(attempt.question_ids_json));
 const answers=db.prepare('SELECT * FROM exam_answers WHERE attempt_id=?').all(attempt.id);
 const detail=questions.map(q=>{
  const a=answers.find(a=>a.question_id===q.id);
  return {...q,user_answer:a?.answer_json?JSON.parse(a.answer_json):null,is_correct:!!a?.is_correct};
 });
 const score=attempt.score_percent;
 return {...attempt,question_ids_json:undefined,grade:score>=90?'Отлично':score>=80?'Хорошо':score>=70?'Удовлетворительно':'Не сдано',
  correct:detail.filter(d=>d.is_correct).length,total:detail.length,detail};
}

