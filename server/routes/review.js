import { Router } from 'express';
import { nextReview } from '../srs.js';
import { required,check } from '../helpers.js';
import { recordActivity } from '../db.js';
export function cardContent(c,card){
 const l=c.lessonById.get(card.lesson_id);if(!l)return null;
 // В повторении только карточки уроков: вопросы тестов и экзаменов без вариантов ответа и расчёты карточками быть не могут.
 const f=card.source==='flashcard'?l.flashcards[Number(card.card_id.split(':').at(-1))]:null;
 // more — короткая справка (1–2 абзаца), которую показываем после «Не помню»
 return f&&{q:f.q,a:f.a,more:[].concat(f.more||[]),lesson_title:l.title};
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

