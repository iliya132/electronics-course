import {boardFigure} from './board-figures.js';
import {svg,text,line,arrow,blocks} from '../lib/svg.js';
import {schematic} from '../lib/schematic.js';
import {plot} from '../lib/plot.js';
const poly=(points,attrs='')=>'<polyline points="'+points+'" fill="none" stroke="currentColor" stroke-width="2" '+attrs+'/>';
export function specialConcept(id,d){
 if(d.nodes){
  return boardFigure(id);
 }
 if(id==='series'||id==='parallel'){
  return schematic(s=>{
   s.label(1,1,'U между A и B');s.label(.5,3,'A');s.label(10.5,3,'B');
   if(id==='series'){s.resistor(3,3,'R1');s.resistor(8,3,'R2');s.wire(1,3,2,3);s.wire(4,3,7,3);s.wire(9,3,10,3);}
   else{for(const y of [2,5]){s.resistor(6,y,y===2?'R1':'R2');s.wire(2,3,2,y);s.wire(2,y,5,y);s.wire(7,y,10,y);s.wire(10,y,10,3);}s.junction(2,3);s.junction(10,3);}
  },id==='series'?'Два последовательных резистора':'Два параллельных резистора');
 }
 if(['rc-charge','rc-lowpass','rc-highpass','ac-coupling','pwm-dac','measure-capacitance'].includes(id)){
  const hp=['rc-highpass','ac-coupling'].includes(id);
  return schematic(s=>{
   s.label(1,1,'Вход');(hp?s.capacitor:s.resistor)(4,2,hp?'C':'R');
   s.wire(1,2,3,2);s.wire(5,2,8,2);s.wire(8,2,8,3);
   (hp?s.resistor:s.capacitor)(8,4,hp?'R':'C',90);
   s.wire(8,5,8,6);s.gnd(8,6);s.junction(8,2);s.wire(8,2,10,2);s.label(9,1,'Выход');
   s.label(1,7,'Вход и выход относительно общей GND');
  },hp?'RC-фильтр верхних частот':'RC-цепь: резистор и конденсатор');
 }
 if(['capacitor-basics','capacitor-types','capacitor-ratings-esr','bulk-caps','decoupling'].includes(id)){
  return schematic(s=>{s.label(1,1,'Шина питания');s.wire(1,2,10,2);s.capacitor(5,4,'C',90);s.wire(5,2,5,3);s.wire(5,5,5,6);s.gnd(5,6);s.label(7,3,'К нагрузке');s.label(1,7,'Ёмкость между питанием и GND');},'Конденсатор параллельно питанию');
 }
 if(['rl-circuit','inductor-basics'].includes(id)){
  return schematic(s=>{s.label(1,1,'Входной скачок U');s.resistor(4,2,'R');s.inductor(8,2,'L');s.wire(1,2,3,2);s.wire(5,2,7,2);s.wire(9,2,10,2);s.wire(10,2,10,6);s.gnd(10,6);s.label(1,7,'Ток нарастает с постоянной времени L/R');},'RL-цепь');
 }
 if(['diode-basics','schottky-zener','reverse-polarity','reverse-protect-test','diode-logic-or','rectifier-half-full'].includes(id)){
  return schematic(s=>{s.diode(5,3,'Диод');s.wire(1,3,4,3);s.wire(6,3,10,3);s.label(2,5,'Анод A');s.label(7,5,'Катод K');s.label(1,7,'Прямой условный ток: A → K');},'Диод: обозначение и направление');
 }
 if(['buck','buck-vs-linear','teardown-buck-module'].includes(id)){
  return schematic(s=>{s.label(.5,1,'Uвх');s.switch(3,2,'Ключ');s.inductor(7,2,'L');s.wire(1,2,2,2);s.wire(4,2,6,2);s.wire(8,2,10,2);s.capacitor(10,4,'C',90);s.wire(10,2,10,3);s.wire(10,5,10,6);s.gnd(10,6);s.diode(5,4,'D',-90);s.wire(5,2,5,3);s.wire(5,5,5,6);s.gnd(5,6);s.junction(5,2);s.label(9,1,'Uвых');},'Несинхронный buck: силовой путь');
 }
 if(['mosfet-switch','inductive-loads','motor-relay-driver','smart-irrigation'].includes(id)){
  return svg(
   text(240,26,'Низкобоковой ключ; общая земля','text-anchor="middle"')+
   poly('320,55 320,85')+text(330,60,'+U нагрузки')+
   '<rect x="290" y="85" width="60" height="60" fill="none" stroke="currentColor"/>'+
   text(270,120,'Нагрузка','text-anchor="end"')+poly('320,145 320,190')+
   '<rect x="290" y="190" width="60" height="65" fill="none" stroke="currentColor"/>'+
   text(320,228,'NMOS','text-anchor="middle" font-size="14"')+
   poly('70,220 290,220')+text(70,205,'GPIO → Rg → G')+
   poly('320,255 320,290')+text(332,285,'S → GND')+
   poly('320,65 410,65 410,165 320,165')+
   text(420,110,'D','font-size="16"')+text(240,330,'Защитный диод: K к +U, A к drain','text-anchor="middle" font-size="16"'),
   {height:355,title:'Ключ индуктивной нагрузки. Диод параллельно нагрузке'});
 }
 if(['uart','i2c','spi','logic-analyzer','one-wire'].includes(id)){
  const lines=id==='uart'?['TX → RX','RX ← TX','GND ─ GND']:id==='i2c'?['SDA ↔ SDA','SCL → SCL','GND ─ GND']:id==='one-wire'?['DQ ↔ DQ','Подтяжка DQ к питанию','GND ─ GND']:['SCK → SCK','MOSI → вход','MISO ← выход','CS → выбор'];
  return svg('<rect x="20" y="45" width="100" height="220" fill="none" stroke="currentColor"/><rect x="360" y="45" width="100" height="220" fill="none" stroke="currentColor"/>'+text(70,35,'Ведущий','text-anchor="middle"')+text(410,35,'Устройство','text-anchor="middle"')+lines.map((a,i)=>line(120,85+i*48,360,85+i*48,'stroke="currentColor"')+text(240,76+i*48,a,'text-anchor="middle" font-size="16"')).join('')+text(240,295,'Согласуй уровни питания и логику','text-anchor="middle"'),{height:320,title:'Соединения '+id});
 }
 return null;
}
export function specialModel(id,d){
 if(id==='teardown-esp32-devkit')return plot({fn:u=>(u-3.3)*.3,xRange:[3.5,6],yRange:[0,1],xLabel:'Uвх, В',yLabel:'Pпот, Вт',title:'LDO: Uвых=3,3 В, I=0,3 А'});
 if(id==='diode-basics')return plot({fn:v=>1e-9*(Math.exp(v/(2*.02585))-1)*1000,xRange:[0,.8],yRange:[0,6],xLabel:'Uдиода, В',yLabel:'I, мА',title:'Шокли: Is=1 нА, n=2, VT=25,85 мВ'});
 if(d.model==='threshold'){
  return svg(text(240,25,'Гистерезис: два возможных пути','text-anchor="middle"')+
   line(60,250,430,250,'stroke="currentColor"')+line(60,250,60,55,'stroke="currentColor"')+
   poly('60,230 330,230 330,80 430,80')+poly('60,230 210,230 210,80 430,80','stroke-dasharray="6 5"')+
   text(45,235,'0','text-anchor="end"')+text(45,85,'1','text-anchor="end"')+
   text(210,275,'U↓','text-anchor="middle"')+text(330,275,'U↑','text-anchor="middle"')+text(430,300,'Uвх','text-anchor="end"')+
   text(240,330,'Между порогами сохраняется предыдущее состояние','text-anchor="middle" font-size="15"'),
   {height:350,title:'Неинвертирующий Шмитт: пороги переключения'});
 }
 return null;
}

