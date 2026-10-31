import { Router } from 'express';
import { required,check,examState,httpError } from '../helpers.js';
import { examDefinition,selectQuestions,hydrateQuestions,examPublic,result } from '../exam-engine.js';
import { grade,validAnswer } from '../grading.js';
export function examRoutes(db,c) {
 const r=Router(),attempt=id=>required(db.prepare('SELECT * FROM exam_attempts WHERE id=?').get(id),'Попытка не найдена');
 r.post('/exams/:examId/start', (req, res) => {
   const exam = required(examDefinition(c, req.params.examId), 'Экзамен не найден');
   if (!examState(db, c, exam.id).available) {
     throw httpError(403, 'Сначала заверши обязательные уроки или экзамены тем');
   }
   const open = db.prepare("SELECT * FROM exam_attempts WHERE exam_id=? AND finished_at IS NULL ORDER BY" +
     " id DESC").get(exam.id);
   if (open) {
     return res.json({
       attemptId: open.id,
       resumed: true,
       questions: examPublic(hydrateQuestions(exam, JSON.parse(open.question_ids_json)))
     });
   }
   const selection = selectQuestions(db, c, exam);
   check(selection.length === exam.questions_per_attempt, 'В банке недостаточно вопросов');
   const id = db.prepare('INSERT INTO exam_attempts(exam_id,question_ids_json,started_at) VALUES (?,?,?)').run(exam.id,
     JSON.stringify(selection), new Date().toISOString()).lastInsertRowid;
   res.json({
     attemptId: id,
     questions: examPublic(hydrateQuestions(exam, selection))
   });
 });
 r.get('/exams/attempts/:id',(req,res)=>{
  const a=attempt(req.params.id);
  if(a.finished_at)return res.json({finished:true,result:result(db,c,a)});
  const e=examDefinition(c,a.exam_id),qs=hydrateQuestions(e,JSON.parse(a.question_ids_json));
  res.json({attemptId:a.id,examId:a.exam_id,questions:examPublic(qs),
   answers:db.prepare('SELECT question_id,answer_json FROM exam_answers WHERE attempt_id=?').all(a.id)
    .map(row=>({id:row.question_id,answer:JSON.parse(row.answer_json)}))});
 });
 r.put('/exams/attempts/:id/answer',(req,res)=>{
  const a=attempt(req.params.id);check(!a.finished_at,'Попытка уже завершена');
  const qs=hydrateQuestions(examDefinition(c,a.exam_id),JSON.parse(a.question_ids_json));
  const q=required(qs.find(q=>q.id===req.body.question_id),'Вопрос не входит в попытку');
  if(req.body.answer===null){db.prepare('DELETE FROM exam_answers WHERE attempt_id=? AND question_id=?').run(a.id,q.id);return res.json({ok:true});}
  check(validAnswer(q,req.body.answer),'Ответ имеет неверный формат');
  db.prepare('INSERT INTO exam_answers(attempt_id,question_id,answer_json) VALUES (?,?,?) ON CONFLICT(attempt_id,question_id) DO UPDATE SET answer_json=excluded.answer_json')
   .run(a.id,q.id,JSON.stringify(req.body.answer));res.json({ok:true});
 });
 r.post('/exams/attempts/:id/finish',(req,res)=>{
  const a=attempt(req.params.id);
  if(a.finished_at)return res.json(result(db,c,a));
  db.transaction(()=>{
   const e=examDefinition(c,a.exam_id),questions=hydrateQuestions(e,JSON.parse(a.question_ids_json));
   let correct=0;
   for(const q of questions){
    const saved=db.prepare('SELECT answer_json FROM exam_answers WHERE attempt_id=? AND question_id=?').get(a.id,q.id);
    const ok=!!saved&&grade(q,JSON.parse(saved.answer_json));if(ok)correct++;
    db.prepare('INSERT INTO exam_answers(attempt_id,question_id,answer_json,is_correct) VALUES (?,?,?,?) ON CONFLICT(attempt_id,question_id) DO UPDATE SET is_correct=excluded.is_correct')
      .run(a.id,q.id,saved?.answer_json||null,Number(ok));
   }
   const score=correct/questions.length*100;
   db.prepare('UPDATE exam_attempts SET finished_at=?,score_percent=?,passed=? WHERE id=?')
     .run(new Date().toISOString(),score,Number(score>=e.pass_percent),a.id);
  })();res.json(result(db,c,attempt(a.id)));
 });
 r.get('/exams/:examId/history',(req,res)=>{
  const e=required(examDefinition(c,req.params.examId),'Экзамен не найден');
  res.json({id:e.id,count:e.questions_per_attempt,pass_percent:e.pass_percent,...examState(db,c,e.id),
   attempts:db.prepare('SELECT id,started_at,finished_at,score_percent,passed FROM exam_attempts WHERE exam_id=? ORDER BY id DESC').all(e.id)});
 });
 return r;
}

