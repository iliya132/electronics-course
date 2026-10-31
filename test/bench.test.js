import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../server/content.js';
import { validateContent } from '../scripts/lib/validate.js';

const content = loadContent();
const benches = content.lessons.flatMap(l => l.blocks.filter(b => b.type === 'bench').map(b => ({ lesson: l, block: b })));

test('Опыты на стенде есть в основных темах курса', () => {
  assert.ok(benches.length >= 120, 'блоков bench: ' + benches.length);
  const topicsWithBench = new Set(benches.map(x => x.lesson.topic));
  for (const id of ['basics', 'circuits', 'passives', 'capacitors', 'inductors-ac', 'filters', 'diodes', 'power', 'transistors', 'analog', 'digital', 'arduino', 'buses', 'esp32'])
    assert.ok(topicsWithBench.has(id), 'нет опытов в теме ' + id);
});

test('Первое занятие курса знакомит со стендом', () => {
  assert.equal(content.lessons[0].id, 'lab-bench');
  assert.ok(content.lessons.some(l => l.id === 'scope-generator'));
});

test('Каждый опыт называет приборы, шаги и ожидаемый результат', () => {
  for (const { lesson, block } of benches) {
    const gear = ['psu', 'scope', 'dmm', 'awg', 'lcr'].filter(k => block[k]);
    assert.ok(gear.length, lesson.id + ': нет приборов');
    assert.ok(block.steps.length >= 2 && block.steps.length <= 8, lesson.id + ': шагов ' + block.steps.length);
    assert.ok(block.expect.length >= 1, lesson.id + ': нет ожидаемого результата');
  }
});

test('Блок bench без шагов не проходит проверку', () => {
  const { block } = benches[0];
  const steps = block.steps;
  delete block.steps;
  try { assert.ok(validateContent(content).some(e => e.includes('bench'))); }
  finally { block.steps = steps; }
  assert.deepEqual(validateContent(content), []);
});

test('В материале нет цен на компоненты и приборы', () => {
  const text = content.lessons.map(l => l.body).join('\n');
  assert.doesNotMatch(text, /₽|руб\./);
  assert.doesNotMatch(text, /Ориентир(?:ы)? (?:по )?цен/i);
  assert.doesNotMatch(text, /Цены условные/);
});

test('В опытах задан предел тока, если используется блок питания', () => {
  for (const { lesson, block } of benches) {
    if (!block.psu) continue;
    assert.match(block.psu, /предел/i, lesson.id + ': у блока питания нет предела тока');
  }
});
