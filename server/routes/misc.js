import { Router } from 'express';
import { check } from '../helpers.js';
import { tables,exportProgress,importProgress } from '../backup.js';
export function miscRoutes(db,c){
 const r=Router();
 r.get('/glossary',(_,res)=>res.json(c.glossary));
 r.get('/search',(req,res)=>{
  const q=String(req.query.q||'').trim().toLocaleLowerCase('ru').slice(0,200);
  res.json({lessons:q?c.lessons.filter(l=>(l.title+' '+l.summary).toLocaleLowerCase('ru').includes(q)).map(l=>({id:l.id,title:l.title,summary:l.summary})):[],
   terms:q?c.glossary.filter(t=>(t.term+' '+t.definition).toLocaleLowerCase('ru').includes(q)):[]});
 });
 r.get('/settings',(_,res)=>res.json(Object.fromEntries(db.prepare('SELECT * FROM settings').all().map(s=>[s.key,JSON.parse(s.value)]))));
 r.put('/settings',(req,res)=>{
  const {theme,font_size}=req.body;
  check(['system','light','dark'].includes(theme)&&[16,18,20,22].includes(font_size),'Неверная тема или размер шрифта');
  const save=db.prepare('INSERT INTO settings VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  db.transaction(()=>{save.run('theme',JSON.stringify(theme));save.run('font_size',JSON.stringify(font_size));})();
  res.json({theme,font_size});
 });
 r.get('/stats',(_,res)=>{
  const activity=db.prepare('SELECT * FROM activity ORDER BY day DESC').all();
  const now=new Date(),fmt=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(d);
  let day=new Date(now),streak=0;
  const active=new Set(activity.filter(a=>a.lessons_done||a.cards_reviewed||a.minutes>0).map(a=>a.day));
  if(!active.has(fmt(day)))day.setUTCDate(day.getUTCDate()-1);
  while(active.has(fmt(day))){streak++;day.setUTCDate(day.getUTCDate()-1);}
  const week=new Date(now);week.setUTCDate(week.getUTCDate()-6);
  const attempts=db.prepare('SELECT exam_id,MAX(score_percent) best FROM exam_attempts WHERE finished_at IS NOT NULL GROUP BY exam_id').all();
  res.json({streak,minutes_week:Math.round(activity.filter(a=>a.day>=fmt(week)).reduce((n,a)=>n+a.minutes,0)),
   minutes:Math.round(activity.reduce((n,a)=>n+a.minutes,0)),lessons:db.prepare("SELECT COUNT(*) n FROM lesson_progress WHERE status='completed'").get().n,
   cards_reviewed:activity.reduce((n,a)=>n+a.cards_reviewed,0),average:attempts.length?Math.round(attempts.reduce((n,a)=>n+a.best,0)/attempts.length):0,
   weak:attempts.filter(a=>a.exam_id!=='final').sort((a,b)=>a.best-b.best).slice(0,3).map(a=>({...a,title:c.topics.find(t=>t.exam===a.exam_id)?.title})),activity});
 });
 r.get('/export',(_,res)=>res.json(exportProgress(db)));
 r.post('/import',(req,res)=>{importProgress(db,c,req.body);res.json({ok:true});});
 r.post('/reset',(req,res)=>{
  check(req.body.confirm==='СБРОСИТЬ','Требуется подтверждение СБРОСИТЬ');
  db.transaction(()=>tables.forEach(t=>db.prepare('DELETE FROM '+t).run()))();res.json({ok:true});
 });
 return r;
}

