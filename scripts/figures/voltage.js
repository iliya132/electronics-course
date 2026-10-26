import {writeFileSync,mkdirSync} from 'node:fs';
import {schematic} from '../lib/schematic.js';
import {svg,text,line} from '../lib/svg.js';
export function generate(){
 const dir='public/figures/voltage';mkdirSync(dir,{recursive:true});
 const x0=80,step=140,y0=240,scale=30,values=[0,2,5];
 const body=values.map((v,i)=>text(x0+i*step,y0+36,['GND','B','A'][i],'text-anchor="middle"')+
 text(x0+i*step,y0-v*scale-16,v+' В','text-anchor="middle"')+
 line(x0+i*step,y0,x0+i*step,y0-v*scale,'stroke="var(--accent, #2457d6)" stroke-width="4"')).join('');
 writeFileSync(dir+'/concept.svg',svg(body+line(40,y0,440,y0,'stroke="currentColor"'),{title:'Потенциалы относительно GND'}));
 writeFileSync(dir+'/model.svg',schematic(s=>{
  s.battery(6,2,'Батарейка AA');s.wire(5,2,2,2);s.wire(7,2,10,2);
  s.wire(2,2,2,6);s.wire(10,2,10,6);s.wire(2,6,4.2,6);s.wire(7.8,6,10,6);
  s.mcu(6,6,'V');s.label(1,4,'+');s.label(10,4,'−');s.label(3,7.5,'Щупы: COM и V');
 },'Вольтметр параллельно батарейке',{height:340}));
}

