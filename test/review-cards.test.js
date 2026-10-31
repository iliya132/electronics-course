import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { openDb } from '../server/db.js';
import { loadContent } from '../server/content.js';
import { createApp } from '../server/app.js';
import { addCard } from '../server/srs.js';

const fixture = t => {
  const db = openDb(':memory:'); t.after(() => db.close());
  const c = loadContent();
  return { db, c, api: request(createApp(db, c)) };
};
const wrong = q => q.question_type === 'numeric' ? q.answer + 1000 : q.question_type === 'multi' ? [] : (q.answer + 1) % q.options.length;

test('Неверные ответы на вопросы уроков не создают карточек повторения', async t => {
  const { api, db, c } = fixture(t);
  const lesson = c.lessons[0];
  for (const q of lesson.blocks.filter(b => b.type === 'quiz')) {
    if (q.question_type === 'multi') continue;
    await api.post('/api/lessons/' + lesson.id + '/answer').send({ block_id: q.id, answer: wrong(q) }).expect(200);
  }
  assert.equal(db.prepare('SELECT COUNT(*) n FROM cards').get().n, 0);
});

test('В очереди повторения только карточки уроков, старые карточки-ошибки скрыты', async t => {
  const { api, db, c } = fixture(t);
  const lesson = c.lessons[0];
  const old = new Date(Date.now() - 2 * 86400000);
  const quizzes = lesson.blocks.filter(b => b.type === 'quiz');
  addCard(db, 'quiz:' + lesson.id + ':' + quizzes[0].id, 'quiz', lesson.id, old);
  addCard(db, 'q:' + c.exams[0].questions[0].id, 'exam', lesson.id, old);
  addCard(db, 'lesson:' + lesson.id + ':0', 'flashcard', lesson.id, old);
  const queue = (await api.get('/api/review/queue').expect(200)).body;
  assert.deepEqual(queue.map(card => card.card_id), ['lesson:' + lesson.id + ':0']);
  assert.equal(queue[0].q, lesson.flashcards[0].q);
});

test('В очереди у карточки есть справка и название урока для «Не помню»', async t => {
  const { api, db, c } = fixture(t);
  const lesson = c.lessons.find(l => l.flashcards.some(f => f.more));
  const index = lesson.flashcards.findIndex(f => f.more);
  addCard(db, 'lesson:' + lesson.id + ':' + index, 'flashcard', lesson.id, new Date(Date.now() - 2 * 86400000));
  const [card] = (await api.get('/api/review/queue').expect(200)).body;
  assert.deepEqual(card.more, [].concat(lesson.flashcards[index].more));
  assert.equal(card.lesson_title, lesson.title);
  assert.ok(card.more.length >= 1 && card.more.length <= 2);
});

test('Справка карточки: не больше двух абзацев и 900 символов', async () => {
  const { validateContent } = await import('../scripts/lib/validate.js');
  const c = loadContent();
  const card = c.lessons[0].flashcards[0];
  card.more = ['Один.', 'Два.', 'Три.'];
  assert.ok(validateContent(c).some(e => e.includes('more')));
  card.more = ['а'.repeat(901)];
  assert.ok(validateContent(c).some(e => e.includes('more')));
  card.more = ['Короткая справка.'];
  assert.ok(!validateContent(c).some(e => e.includes('more')));
});
