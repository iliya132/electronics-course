import { Router } from 'express';
import { nextReview } from '../srs.js';
import { required,check } from '../helpers.js';
import { recordActivity } from '../db.js';
export function cardContent(c,card){
 const l=c.lessonById.get(card.lesson_id);if(!l)return null;
 if(card.source==='flashcard')return l.flashcards[Number(card.card_id.split(':').at(-1))];
 const q=card.source==='exam'?c.exams.flatMap(e=>e.questions).find(q=>'q:'+q.id===card.card_id)
  :l.blocks.find(b=>'quiz:'+l.id+':'+b.id===card.card_id);
 if(!q)return null;
 const a=q.options?(Array.isArray(q.answer)?q.answer.map(i=>q.options[i]).join('; '):q.options[q.answer]):q.answer+' '+q.unit;
 return {q:q.question,a:a+'. '+(q.explanation||q.reveal)};
}
export function reviewRoutes(db,c){
 const r=Router();
 r.get('/review/queue',(_,res)=>res.json(db.prepare('SELECT * FROM cards WHERE due_at<=? ORDER BY due_at,card_id').all(new Date().toISOString())
  .map(card=>({...card,...cardContent(c,card)})).filter(card=>card.q)));
 r.post('/review/answer',(req,res)=>{
  const {card_id,correct}=req.body;check(typeof correct==='boolean','correct должен быть boolean');
  const card=required(db.prepare('SELECT * FROM cards WHERE card_id=?').get(card_id),'Карточка не найдена');
  check(card.due_at<=new Date().toISOString(),'Карточка уже повторена или ещё не назначена');
  const next=nextReview(card,correct);
  db.transaction(()=>{
   db.prepare('UPDATE cards SET box=?,due_at=?,last_reviewed_at=?,lapses=? WHERE card_id=?')
    .run(next.box,next.due_at,next.last_reviewed_at,next.lapses,card_id);
   recordActivity(db,'cards_reviewed');
  })();res.json(next);
 });
 return r;
}

