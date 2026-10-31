import {execFileSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {mkdtempSync,rmSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {loadContent} from '../server/content.js';
import {openDb} from '../server/db.js';
import {createApp} from '../server/app.js';
import {examDefinition,hydrateQuestions} from '../server/exam-engine.js';
import {calculation} from '../scripts/course/calculations.js';
const content=loadContent();
test('Полная программа: 185 занятий, все связи, изображения, скетчи, числовые модели',async()=>{
 const plan=JSON.parse(readFileSync('scripts/course/plan.json','utf8'));
 assert.deepEqual(content.lessons.map(l=>l.id),plan.flatMap(t=>t.lessons.map(l=>l.id)));
 assert.equal(content.lessons.length,185);assert.equal(content.exams.length,17);
 const usedModels=new Set();
 for(const t of plan){
  const {data}=await import('../scripts/course/topic-'+String(t.number).padStart(2,'0')+'.js');
  for(const d of Object.values(data)){
   usedModels.add(d.model);
   for(const n of d.nodes||[])assert.ok(content.lessonById.has(n.lesson),'Ссылка узла: '+n.lesson);
   if(d.code){
    assert.ok(!/"\{\"[a-z]+\":/.test(d.code),'JSON должен быть экранирован в строке C++');
    assert.ok(!/"[^"\n]*\n"/.test(d.code),'Случайный перенос в строке C++');
   }
  }
 }
 for(const model of usedModels)for(let k=1;k<=9;k++){
  const q=calculation(model,k);assert.ok(Number.isFinite(q.answer));assert.ok(q.steps.length>=3);
 }
 for(const l of content.lessons){
  assert.ok(l.blocks.filter(b=>b.type==='figure').length>=2);
  for(const b of l.blocks.filter(b=>b.type==='figure')){
   const svg=readFileSync(join('public/figures',b.file),'utf8');
   assert.match(svg,/viewBox=/);assert.doesNotMatch(svg,/NaN|Infinity|<script|https?:\/\/(?!www.w3.org)/);
  }
 }
});
test('Контрольные расчёты проектов независимым способом',()=>{
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,a+' != '+b);
 close((80*3+.05*597)/600,.44975);close(1800/.44975/24,166.75931072818233);
 close(.5*.001/(470e-6),1.0638297872340425);
 close(.6**2*.05,.018);close((5-3.3)*.25,.425);
 close(40*86400,3456000);close(1.4**2/10,.196);
 close(5*6800/(33000+6800),.8542713567839196);
 const tc=1/(1/298.15+Math.log(.5)/3950)-273.15;close(tc,41.4602347981853);
});
test('Все занятия, 17 экзаменов, финал, повторение, перезапуск SQLite',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'electronics-course-'));let db=openDb(join(dir,'qa.sqlite'));
 try{
  let api=request(createApp(db,content));
  await api.post('/api/exams/final/start').expect(403);
  for(const lesson of content.lessons){
   await api.get('/api/lessons/'+lesson.id).expect(200);
   for(const q of lesson.blocks.filter(b=>['quiz','predict'].includes(b.type))){
    const r=await api.post('/api/lessons/'+lesson.id+'/answer').send({block_id:q.id,answer:q.answer}).expect(200);
    assert.equal(r.body.is_correct,true,lesson.id+':'+q.id);
   }
   await api.post('/api/lessons/'+lesson.id+'/complete').expect(200);
  }
  const solve=async(examId)=>{
   const a=(await api.post('/api/exams/'+examId+'/start').expect(200)).body;
   const row=db.prepare('SELECT * FROM exam_attempts WHERE id=?').get(a.attemptId);
   const qs=hydrateQuestions(examDefinition(content,examId),JSON.parse(row.question_ids_json));
   for(const q of a.questions){assert.equal(q.answer,undefined);assert.equal(q.explanation,undefined);}
   for(const q of qs)await api.put('/api/exams/attempts/'+a.attemptId+'/answer').send({question_id:q.id,answer:q.answer}).expect(200);
   const resume=(await api.get('/api/exams/attempts/'+a.attemptId).expect(200)).body;
   assert.equal(resume.answers.length,qs.length);
   const done=(await api.post('/api/exams/attempts/'+a.attemptId+'/finish').expect(200)).body;
   assert.equal(done.score_percent,100);assert.equal(done.passed,1);
   return qs;
  };
  for(const e of content.exams)await solve(e.id);
  const final=await solve('final');assert.equal(final.length,30);
  const counts={};for(const q of final){const topic=content.lessonById.get(q.lesson).topic;counts[topic]=(counts[topic]||0)+1;}
  assert.equal(Object.keys(counts).length,17);assert.ok(Object.values(counts).every(n=>n===1||n===2));
  assert.equal((await api.get('/api/course')).body.percent,100);
  assert.equal((await api.get('/api/review/queue')).body.length, 0);
  db.prepare("UPDATE cards SET due_at=? WHERE card_id=(SELECT card_id FROM cards LIMIT 1)")
    .run(new Date(Date.now() - 1000).toISOString());
  const card=(await api.get('/api/review/queue')).body[0];
  const reviewed=(await api.post('/api/review/answer').send({card_id:card.card_id,correct:true}).expect(200)).body;
  assert.equal(reviewed.box,2);
  await api.post('/api/review/answer').send({card_id:card.card_id,correct:true}).expect(400);
  await api.put('/api/lessons/charge-current/note').send({text:'Переживает перезапуск'}).expect(200);
  await api.post('/api/lessons/charge-current/progress').send({scroll_pos:812,time_delta_sec:60}).expect(200);
  db.close();db=openDb(join(dir,'qa.sqlite'));api=request(createApp(db,content));
  const saved=(await api.get('/api/lessons/charge-current')).body;
  assert.equal(saved.note,'Переживает перезапуск');assert.equal(saved.progress.scroll_pos,812);assert.equal(saved.progress.status,'completed');
  assert.equal((await api.get('/api/course')).body.final_exam.passed,true);
  const backup=(await api.get('/api/export')).body;
  await api.post('/api/import').send(backup).expect(200);
  assert.equal((await api.get('/api/course')).body.percent,100);
 }finally{db.close();assert.ok(dir.startsWith(join(tmpdir(),'electronics-course-')));rmSync(dir,{recursive:true,force:true});}
});


test('Все браузерные ES-модули синтаксически корректны',()=>{for(const entry of readdirSync('public/js',{recursive:true}).filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',join('public/js',entry)]);});
test('Сайт использует локальные ресурсы и ограничивает внешние подключения',async()=>{
 const db=openDb(':memory:');try{
  const api=request(createApp(db,content)),home=await api.get('/').expect(200);
  assert.match(home.headers['content-security-policy'],/default-src 'self'/);
  for(const folder of ['public/js','public/css'])for(const entry of readdirSync(folder,{recursive:true}).filter(f=>/\.(js|css)$/.test(f))){
   const source=readFileSync(join(folder,entry),'utf8').replaceAll('http://www.w3.org/2000/svg','');
   assert.doesNotMatch(source,/https?:\/\/|wss?:\/\//,entry);
  }
  for(const path of ['/js/app.js','/css/tokens.css','/icons/zap.svg','/figures/'+content.lessonById.get('ohm-law').blocks.find(b=>b.type==='figure').file])await api.get(path).expect(200);
 }finally{db.close();}
});
