import { Router } from 'express';
import { grade, validAnswer } from '../grading.js';
import { publicQuestion } from '../content.js';
import { addCard } from '../srs.js';
import { required,check,httpError,progress,progressMap,unlockedLessons,shuffle } from '../helpers.js';
import { recordActivity } from '../db.js';
export function lessonRoutes(db,c) {
 const r=Router(); const lesson=id=>required(c.lessonById.get(id),'Урок не найден');
 const unlocked=()=>unlockedLessons(c,progressMap(db));
 const accessible=id=>{
  const l=lesson(id);
  if(unlocked().has(l.id))return l;
  const all=progressMap(db),current=c.lessons.find(x=>!x.optional&&all.get(x.id)?.status!=='completed');
  throw httpError(403,'Урок пока закрыт'+(current?': сначала заверши «'+current.title+'»':''));
 };
 const touch=id=>db.prepare("INSERT INTO lesson_progress(lesson_id,status,started_at) VALUES (?,'not_started',?) ON CONFLICT(lesson_id) DO NOTHING").run(id,new Date().toISOString());
 const start=id=>{touch(id);db.prepare("UPDATE lesson_progress SET status='in_progress' WHERE lesson_id=? AND status='not_started'").run(id);};
 r.get('/lessons/:id', (req, res) => {
   const l = accessible(req.params.id);
   const open = unlocked();
   const answers = db.prepare('SELECT * FROM block_answers WHERE lesson_id=?').all(l.id);
   const blocks = l.blocks.map(b => {
     if (b.type === 'recall') {
       const pool = c.lessons.filter(old => old.index < l.index && progress(db,
         old.id).status === 'completed').flatMap(old => old.blocks.filter(q => q.type === 'quiz').map(q => ({
         ...publicQuestion(q),
         hint: q.hint,
         source_lesson: old.id
       })));
       return {
         ...b,
         questions: shuffle(pool).slice(0, b.count)
       };
     }
     if (!['quiz', 'predict'].includes(b.type)) {
       return b;
     }
     const a = answers.find(a => a.block_id === b.id);
     return {
       ...publicQuestion(b),
       hint: b.hint,
       ...(a ? {
         feedback: {
           is_correct: !!a.is_correct,
           explanation: b.explanation || b.reveal,
           answer: b.answer
         }
       } : {})
     };
   });
   const topic = c.topics.find(t => t.id === l.topic);
   const lastRequired = topic.lessons.filter(x => !x.optional).at(-1);
   const topicExam = topic.exam && lastRequired?.id === l.id ? {
     id: topic.exam,
     passed: !!db.prepare('SELECT 1 FROM exam_attempts WHERE exam_id=? AND passed=1').get(topic.exam)
   } : null;
   res.json({
     ...l,
     topic_exam: topicExam,
     topic_title: topic.title,
     position: topic.lessons.indexOf(l) + 1,
     topic_count: topic.lessons.length,
     body: undefined,
     file: undefined,
     blocks,
     progress: progress(db, l.id),
     answers: answers.map(a => ({
       ...a,
       answer: JSON.parse(a.answer_json)
     })),
     note: db.prepare('SELECT text FROM notes WHERE lesson_id=?').get(l.id)?.text || '',
     previous: open.has(c.lessons[l.index - 1]?.id) ? c.lessons[l.index - 1].id : undefined,
     next: c.lessons[l.index + 1]?.id,
     next_open: open.has(c.lessons[l.index + 1]?.id),
     missing: l.prerequisites.filter(id => progress(db, id).status !== 'completed').map(id => ({
       id,
       title: lesson(id).title
     }))
   });
 });
 r.post('/lessons/:id/progress', (req, res) => {
   const l = accessible(req.params.id);
   const {
     scroll_pos,
     time_delta_sec
   } = req.body;
   check(Number.isFinite(scroll_pos) && scroll_pos >= 0 && scroll_pos <= 1e7 && Number.isInteger(time_delta_sec) &&
     time_delta_sec >= 0 && time_delta_sec <= 120, 'Неверная позиция или время');
   touch(l.id);
   db.transaction(() => {
     db.prepare("UPDATE lesson_progress SET scroll_pos=?,time_spent_sec=time_spent_sec+? WHER" +
       "E lesson_id=?").run(scroll_pos, time_delta_sec, l.id);
     recordActivity(db, 'minutes', time_delta_sec / 60);
   })();
   res.json({
     ok: true
   });
 });
 r.post('/lessons/:id/answer',(req,res)=>{
  const l=accessible(req.params.id),{block_id,answer}=req.body;
  const b=required(l.blocks.find(b=>b.id===block_id&&['quiz','predict'].includes(b.type)),'Вопрос не найден');
  const q=b.type==='predict'?{...b,question_type:'single'}:b;
  check(validAnswer(q,answer),'Ответ имеет неверный формат');
  const correct=grade(q,answer);
  db.transaction(()=>{
   start(l.id);
   db.prepare(`INSERT INTO block_answers(lesson_id,block_id,answer_json,is_correct,answered_at) VALUES (?,?,?,?,?)
   ON CONFLICT(lesson_id,block_id) DO UPDATE SET answer_json=excluded.answer_json,is_correct=excluded.is_correct,
   attempts=attempts+1,answered_at=excluded.answered_at`).run(l.id,b.id,JSON.stringify(answer),Number(correct),new Date().toISOString());
  })();
  res.json({is_correct:correct,answer:b.answer,explanation:b.explanation||b.reveal});
 });
 r.post('/lessons/:id/complete',(req,res)=>{
  const l=accessible(req.params.id);
  db.transaction(()=>{
   const answered=new Set(db.prepare('SELECT block_id FROM block_answers WHERE lesson_id=?').all(l.id).map(a=>a.block_id));
   check(l.blocks.filter(b=>['quiz','predict'].includes(b.type)).every(b=>answered.has(b.id)),'Сначала ответь на все вопросы и предсказания');
   if(progress(db,l.id).status!=='completed'){
    touch(l.id);db.prepare("UPDATE lesson_progress SET status='completed',completed_at=? WHERE lesson_id=?").run(new Date().toISOString(),l.id);
    l.flashcards.forEach((_,i)=>addCard(db,'lesson:'+l.id+':'+i,'flashcard',l.id));
    recordActivity(db,'lessons_done');
   }
  })();res.json(progress(db,l.id));
 });
 r.put('/lessons/:id/note',(req,res)=>{
  const l=accessible(req.params.id);check(typeof req.body.text==='string'&&req.body.text.length<=20000,'Заметка: максимум 20000 символов');
  db.prepare('INSERT INTO notes VALUES (?,?,?) ON CONFLICT(lesson_id) DO UPDATE SET text=excluded.text,updated_at=excluded.updated_at')
   .run(l.id,req.body.text,new Date().toISOString());res.json({ok:true});
 });
 r.post('/recall/answer', (req, res) => {
   const {
     lesson_id,
     block_id,
     answer
   } = req.body;
   const l = lesson(lesson_id);
   const b = required(l.blocks.find(x => x.id === block_id && x.type === 'quiz'), 'Вопрос не найден');
   check(progress(db, l.id).status === 'completed', 'Урок ещё не пройден');
   check(validAnswer(b, answer), 'Ответ имеет неверный формат');
   const correct = grade(b, answer);
   res.json({
     is_correct: correct,
     answer: b.answer,
     explanation: b.explanation
   });
 });
 return r;
}

