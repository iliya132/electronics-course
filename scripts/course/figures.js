import {mkdirSync,writeFileSync} from 'node:fs';
import {plot} from '../lib/plot.js';
import {blocks} from '../lib/svg.js';
import {schematic} from '../lib/schematic.js';
import {plots} from './plots.js';
export function makeFigures(id,d){
 const dir='public/figures/'+id;mkdirSync(dir,{recursive:true});
 let concept=blocks(d.diagram,'Принцип: '+d.diagram.join(' → '));
 if(['ohm','power','wire','series','led'].includes(d.model)){
  concept=schematic(s=>{
   s.battery(3,2,'Источник U');s.resistor(8,2,d.model==='led'?'Rогр':'Резистор R');
   s.wire(4,2,7,2);s.wire(2,2,1,2);s.wire(1,2,1,6);s.wire(1,6,7,6);
   if(d.model==='led'){s.led(8,6,'LED');s.wire(9,6,10,6);}else{s.wire(7,6,10,6);}
   s.wire(10,6,10,2);s.wire(9,2,10,2);s.label(3,7,'Замкнутый путь тока');
  },d.model==='led'?'LED с ограничением тока':'Источник и резистивная нагрузка');
 }
 if(['divider','pullup'].includes(d.model)){
  concept=schematic(s=>{s.label(2,1,'Uвх');s.resistor(5,2,'R1');s.resistor(8,5,'R2',90);
   s.wire(1,2,4,2);s.wire(6,2,8,2);s.wire(8,2,8,4);s.wire(8,6,8,7);s.gnd(8,7);
   s.junction(8,3);s.wire(8,3,10,3);s.label(9,2.6,'Uвых');},'Делитель: R1 сверху, R2 к земле',{height:360});
 }
 const p=plots[d.model];if(!p)throw Error('Нет графика '+d.model);
 writeFileSync(dir+'/concept.svg',concept);
 writeFileSync(dir+'/model.svg',plot({fn:p[0],xRange:p[1],yRange:p[2],xLabel:p[3],yLabel:p[4],title:p[5]}));
}

