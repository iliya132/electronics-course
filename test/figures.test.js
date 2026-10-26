import test from 'node:test';
import assert from 'node:assert/strict';
import {plot} from '../scripts/lib/plot.js';
import {schematic} from '../scripts/lib/schematic.js';
test('Графики детерминированы и имеют доступное имя',()=>{
 const params={fn:x=>x/100,xRange:[0,10],yRange:[0,.1],xLabel:'U, В',yLabel:'I, А',title:'Закон Ома'};
 assert.equal(plot(params),plot(params));assert.ok(plot(params).includes('viewBox'));assert.ok(plot(params).includes('U, В'));
});
test('Провода ортогональны, примитивы доступны',()=>{
 const output=schematic(s=>{s.wire(1,1,3,2);s.resistor(5,2,'100 Ом');s.mosfetN(3,4,'Q1');});
 assert.ok(output.includes('M40 40H120V80'));assert.ok(output.includes('100 Ом'));
});

