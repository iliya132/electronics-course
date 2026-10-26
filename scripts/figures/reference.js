import {mkdirSync,writeFileSync} from 'node:fs';
import {plot} from '../lib/plot.js';
import {schematic} from '../lib/schematic.js';
export function generate(){
 const dir='public/figures/reference';mkdirSync(dir,{recursive:true});
 writeFileSync(dir+'/ohm.svg',plot({fn:u=>u/100*1000,xRange:[0,10],yRange:[0,100],xLabel:'Напряжение U, В',yLabel:'I, мА',title:'I = U / R',series:[{fn:u=>u/470*1000,label:'470 Ом: пунктир',dash:'6 4'}]}));
 writeFileSync(dir+'/rc.svg',plot({fn:t=>5*(1-Math.exp(-t)),xRange:[0,5],yRange:[0,5],xLabel:'Время t, с',yLabel:'U, В',title:'RC = 1 с; питание 5 В'}));
 writeFileSync(dir+'/circuit.svg',schematic(s=>{s.battery(3,2,'5 В');s.resistor(8,2,'100 Ом');s.wire(4,2,7,2);s.wire(2,2,1,2);s.wire(1,2,1,6);s.wire(1,6,10,6);s.wire(10,6,10,2);s.wire(9,2,10,2);},'Замкнутая резистивная цепь'));
}

