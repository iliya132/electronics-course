import {writeFileSync,mkdirSync} from 'node:fs';
import {svg,text,line,arrow} from '../lib/svg.js';
import {plot} from '../lib/plot.js';
export function generate(){
 const dir='public/figures/charge-current';mkdirSync(dir,{recursive:true});
 const width=480,body=[];
 for(const [i,label]of ['Вода: поток объёма','Провод: поток заряда'].entries()){
  const y=70+i*130;
  body.push(text(24,y-30,label),line(32,y-12,448,y-12,'stroke="currentColor"'),line(32,y+12,448,y+12,'stroke="currentColor"'),arrow(100,y,370,y));
 }
 body.push(text(24,285,'Аналогия потока, не строения вещества.'));
 writeFileSync(dir+'/concept.svg',svg(body.join(''),{width,height:315,title:'Поток воды и электрический ток'}));
 writeFileSync(dir+'/model.svg',plot({fn:t=>0.2*t,xRange:[0,40],yRange:[0,8],xLabel:'Время t, с',yLabel:'Q, Кл',title:'Q = I·t при I = 0,2 А',markers:[{x:30,y:6,label:'6 Кл'}]}));
}

