import test from 'node:test';
import assert from 'node:assert/strict';
import { grade } from '../server/grading.js';
import { nextReview } from '../server/srs.js';
test('Одиночный и множественный выбор без повторов',()=>{
 assert.equal(grade({type:'single',options:['a','b'],answer:1},1),true);
 assert.equal(grade({type:'single',options:['a','b'],answer:1},'1'),false);
 assert.equal(grade({type:'multi',options:['a','b','c'],answer:[0,2]},[2,0]),true);
 assert.equal(grade({type:'multi',options:['a','b','c'],answer:[0,2]},[0,0]),false);
});
test('Числа: запятая, допуск, отрицательные, ноль, мусор',()=>{
 const q={type:'numeric',answer:22.7,tolerance_percent:2};
 assert.equal(grade(q,'22,7'),true);assert.equal(grade(q,'23.1'),true);assert.equal(grade(q,'24'),false);
 for(const v of ['',null,'22 мА','Infinity',true,[],{}])assert.equal(grade(q,v),false);
 assert.equal(grade({type:'numeric',answer:-3},'-3,01'),true);
 assert.equal(grade({type:'numeric',answer:0},0.001),true);
 assert.equal(grade({type:'numeric',answer:0},0.002),false);
});
test('Лейтнер: даты на границе месяца, максимальная коробка, ошибка',()=>{
 const now=new Date('2026-01-30T12:00:00Z');
 assert.equal(nextReview({box:1,lapses:0},true,now).due_at,'2026-02-02T12:00:00.000Z');
 assert.equal(nextReview({box:5,lapses:0},true,now).box,5);
 const failed=nextReview({box:4,lapses:2},false,now);
 assert.equal(failed.box,1);assert.equal(failed.lapses,3);
 assert.equal(failed.due_at,'2026-01-31T12:00:00.000Z');
});

