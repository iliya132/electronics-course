import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, parseLesson } from '../server/content.js';
import { validateContent } from '../scripts/lib/validate.js';
test('Корректный контент проходит валидатор',()=>assert.deepEqual(validateContent(loadContent()),[]));
test('Пустой курс не принимается',()=>assert.ok(validateContent({lessons:[],topics:[],exams:[],glossary:[]}).length));
test('Неверные предпосылки и ответы обнаруживаются с путём',()=>{
 const c=loadContent(); const l=c.lessons[0]; l.prerequisites=['missing'];
 l.blocks.find(b=>b.type==='quiz').answer=999;
 const errors=validateContent(c); assert.ok(errors.some(e=>e.includes('prerequisites')));
 assert.ok(errors.some(e=>e.includes('блок')&&e.includes('answer')));
});
test('Markdown HTML не исполняется, неизвестный блок отвергается',()=>{
 assert.ok(parseLesson('<script>alert(1)</script>').blocks[0].html.includes('&lt;script'));
 assert.throws(()=>parseLesson('```unknown\nx: 1\n```'),/неизвестный/);
});

test('formula: строка или список строк, formula_open только вместе с ней',()=>{
 const c=loadContent(); const q=c.lessons[0].blocks.find(b=>b.type==='quiz');
 q.formula=['U = I · R']; q.formula_open=true; assert.deepEqual(validateContent(c),[]);
 q.formula=[''];assert.ok(validateContent(c).some(e=>e.includes('formula')));
 delete q.formula;assert.ok(validateContent(c).some(e=>e.includes('formula_open')));
});
