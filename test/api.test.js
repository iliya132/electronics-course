import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { openDb } from '../server/db.js';
import { loadContent } from '../server/content.js';
import { createApp } from '../server/app.js';
function fixture(t){
 const db=openDb(':memory:');t.after(()=>db.close());const c=loadContent();
 const bank=Array.from({length:36},(_,i)=>({id:'test-'+i,lesson:c.lessons[i%2].id,difficulty:i%3+1,
  type:i%3===0?'numeric':'single',question:'Контроль '+i,answer:i%3===0?i:1,unit:'В',options:i%3===0?undefined:['неверно','верно','неверно тоже'],explanation:'Объяснение'}));
 const exam={id:'exam-basics',topic:'basics',questions_per_attempt:10,pass_percent:70,questions:bank};
 c.exams=[exam];c.examById=new Map([[exam.id,exam]]);c.topics[0].exam=exam.id;
 return {db,c,api:request(createApp(db,c)),exam};
}
test('Завершение требует все ответы, повторное завершение идемпотентно',async t=>{
 const {api,db,c}=fixture(t),l=c.lessons[0];
 await api.post('/api/lessons/'+l.id+'/complete').expect(400);
 for(const q of l.blocks.filter(b=>['quiz','predict'].includes(b.type)))
  await api.post('/api/lessons/'+l.id+'/answer').send({block_id:q.id,answer:q.answer}).expect(200);
 await api.post('/api/lessons/'+l.id+'/complete').expect(200);
 await api.post('/api/lessons/'+l.id+'/complete').expect(200);
 assert.equal(db.prepare('SELECT SUM(lessons_done) n FROM activity').get().n,1);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM cards').get().n,l.flashcards.length);
 const res=await api.get('/api/lessons/'+l.id);assert.equal(res.body.progress.status,'completed');
});
test('Экзамен: блокировка, отсутствие ответов, пересдача, ошибки и повторение',async t=>{
 const {api,db,c}=fixture(t);
 await api.post('/api/exams/exam-basics/start').expect(403);
 for(const l of c.lessons)db.prepare("INSERT INTO lesson_progress(lesson_id,status) VALUES (?,'completed')").run(l.id);
 const first=(await api.post('/api/exams/exam-basics/start').expect(200)).body;
 for(const q of first.questions){assert.equal(q.answer,undefined);assert.equal(q.explanation,undefined);}
 const result=(await api.post('/api/exams/attempts/'+first.attemptId+'/finish').expect(200)).body;
 assert.equal(result.score_percent,0);assert.equal(result.detail.length,10);
 assert.ok((await api.get('/api/review/queue')).body.length>=10);
 const second=(await api.post('/api/exams/exam-basics/start')).body;
 assert.ok(second.questions.every(q=>!first.questions.some(old=>old.id===q.id)));
 await api.put('/api/exams/attempts/'+first.attemptId+'/answer').send({question_id:first.questions[0].id,answer:0}).expect(400);
 const repeated=(await api.post('/api/exams/attempts/'+first.attemptId+'/finish')).body;
 assert.equal(repeated.score_percent,0);
});
test('Настройки, заметки, резервная копия, отказ без частичного удаления',async t=>{
 const {api,c}=fixture(t),id=c.lessons[0].id;
 await api.put('/api/lessons/'+id+'/note').send({text:'Моя заметка'}).expect(200);
 await api.put('/api/settings').send({theme:'dark',font_size:20}).expect(200);
 const backup=(await api.get('/api/export')).body;
 await api.post('/api/reset').send({confirm:'no'}).expect(400);
 await api.post('/api/reset').send({confirm:'СБРОСИТЬ'}).expect(200);
 await api.post('/api/import').send(backup).expect(200);
 assert.equal((await api.get('/api/lessons/'+id)).body.note,'Моя заметка');
 backup.tables.notes[0].extra='bad';await api.post('/api/import').send(backup).expect(400);
 assert.equal((await api.get('/api/lessons/'+id)).body.note,'Моя заметка');
 await api.post('/api/reset').set('Origin','https://example.org').send({confirm:'СБРОСИТЬ'}).expect(403);
});


test('Черновой ответ можно очистить и продолжить; чужой вопрос отклоняется',async t=>{
 const {api,db,c}=fixture(t);
 for(const l of c.topics[0].lessons)db.prepare("INSERT INTO lesson_progress(lesson_id,status) VALUES (?,'completed')").run(l.id);
 const a=(await api.post('/api/exams/exam-basics/start')).body,q=a.questions[0];
 await api.put('/api/exams/attempts/'+a.attemptId+'/answer').send({question_id:q.id,answer:0}).expect(200);
 await api.put('/api/exams/attempts/'+a.attemptId+'/answer').send({question_id:q.id,answer:null}).expect(200);
 assert.equal((await api.get('/api/exams/attempts/'+a.attemptId)).body.answers.length,0);
 await api.put('/api/exams/attempts/'+a.attemptId+'/answer').send({question_id:'foreign',answer:null}).expect(404);
});
test('Дополнительные уроки не блокируют экзамен темы',async t=>{
 const {api,db,c}=fixture(t);c.topics[0].lessons[0].optional=true;
 for(const l of c.topics[0].lessons.filter(l=>!l.optional))db.prepare("INSERT INTO lesson_progress(lesson_id,status) VALUES (?,'completed')").run(l.id);
 const info=(await api.get('/api/exams/exam-basics/history')).body;assert.equal(info.available,true);
 await api.post('/api/exams/exam-basics/start').expect(200);
});
test('Неверные настройки резервной копии не заменяют данные',async t=>{
 const {api}=fixture(t);await api.put('/api/settings').send({theme:'dark',font_size:20}).expect(200);
 const backup=(await api.get('/api/export')).body;backup.tables.settings.find(s=>s.key==='theme').value='"unknown"';
 await api.post('/api/import').send(backup).expect(400);
 assert.equal((await api.get('/api/settings')).body.theme,'dark');
});


test('Пустое или не JSON тело и чрезмерная прокрутка отклоняются', async t => {
  const {api} = fixture(t);
  for (const path of ['/api/reset', '/api/lessons/ohm-law/progress']) {
    const response = await api.post(path).expect(400);
    assert.match(response.body.error, /[а-яА-Я]/);
    await api.post(path).type('text').send('invalid').expect(400);
  }
  await api.post('/api/lessons/ohm-law/progress')
    .send({scroll_pos: 1e7 + 1, time_delta_sec: 0}).expect(400);
});

test('Host допускает только локальные адреса', async t => {
  const {db} = fixture(t);
  const api = request(createApp(db, loadContent()));
  await api.get('/api/course').set('Host', 'evil.example').expect(403);
  await api.post('/api/reset').set('Host', 'evil.example').send({confirm: 'СБРОСИТЬ'}).expect(403);
  for (const host of ['localhost:3000', '127.0.0.1:3000', '[::1]:3000']) {
    await api.get('/api/course').set('Host', host).expect(200);
  }
  await api.get('/api/course').expect(200);
});

test('Вспомним сохраняет исходные ответы и создаёт карточку ошибки', async t => {
  const {api, db, c} = fixture(t);
  const l = c.lessons[0];
  const q = l.blocks.find(b => b.type === 'quiz' && b.question_type === 'single');
  assert.ok(q);
  const payload = {lesson_id: l.id, block_id: q.id, answer: (q.answer + 1) % q.options.length};
  await api.post('/api/recall/answer').send(payload).expect(400);
  for (const b of l.blocks.filter(b => ['quiz', 'predict'].includes(b.type))) {
    await api.post('/api/lessons/' + l.id + '/answer').send({block_id: b.id, answer: b.answer}).expect(200);
  }
  await api.post('/api/lessons/' + l.id + '/complete').expect(200);
  const before = db.prepare('SELECT * FROM block_answers WHERE lesson_id=? AND block_id=?').get(l.id, q.id);
  const response = await api.post('/api/recall/answer').send(payload).expect(200);
  assert.equal(response.body.is_correct, false);
  assert.deepEqual(db.prepare('SELECT * FROM block_answers WHERE lesson_id=? AND block_id=?').get(l.id, q.id), before);
  assert.ok(db.prepare('SELECT * FROM cards WHERE card_id=?').get('quiz:' + l.id + ':' + q.id));
  const later = (await api.get('/api/lessons/' + c.lessons[1].id)).body;
  for (const b of later.blocks.filter(b => b.type === 'recall')) {
    for (const question of b.questions) {
      assert.equal(question.hint, l.blocks.find(b => b.id === question.id).hint);
    }
  }
});

test('Старт возобновляет экзамен до сдачи, после сдачи создаёт новый', async t => {
  const {api, db, c} = fixture(t);
  for (const l of c.topics[0].lessons) {
    db.prepare("INSERT INTO lesson_progress(lesson_id,status) VALUES (?,'completed')").run(l.id);
  }
  const first = (await api.post('/api/exams/exam-basics/start').expect(200)).body;
  await api.put('/api/exams/attempts/' + first.attemptId + '/answer')
    .send({question_id: first.questions[0].id, answer: 0}).expect(200);
  const resumed = (await api.post('/api/exams/exam-basics/start').expect(200)).body;
  assert.equal(resumed.attemptId, first.attemptId);
  assert.equal(resumed.resumed, true);
  assert.deepEqual(resumed.questions, first.questions);
  assert.equal((await api.get('/api/exams/attempts/' + first.attemptId)).body.answers.length, 1);
  await api.post('/api/exams/attempts/' + first.attemptId + '/finish').expect(200);
  const next = (await api.post('/api/exams/exam-basics/start').expect(200)).body;
  assert.notEqual(next.attemptId, first.attemptId);
});
