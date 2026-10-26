import {svg,text,line,arrow} from '../lib/svg.js';
const boards={
 'teardown-esp32-devkit':{labels:['USB','USB-UART','ESP32','LDO 3,3 В','EN / BOOT','Антенна'],edges:[[0,1],[1,2],[0,3],[3,2],[1,4],[4,2],[2,5]]},
 'teardown-arduino-uno':{labels:['USB + PTC','ATmega16U2','ATmega328P','DC → LDO','Выбор 5 В','RESET / такт'],edges:[[0,1],[1,2],[0,4],[3,4],[4,2],[5,2]]},
 'teardown-usb-charger-5v':{labels:['Вход / мост','Ключ','Трансформатор','Диод / фильтр','Выход 5 В','TL431 + опто'],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,1]]},
 'teardown-buck-module':{labels:['Вход + C','Ключ','L + диод','Выход + C','Нагрузка','FB-делитель'],edges:[[0,1],[1,2],[2,3],[3,4],[3,5],[5,1]]},
 'teardown-tp4056-module':{labels:['USB 5 В','TP4056','Ячейка B+/B−','RPROG','DW01 + FET','Выход OUT'],edges:[[0,1],[1,2],[3,1],[2,4],[4,5]]}
};
export function boardFigure(id){
 const d=boards[id];if(!d)return null;
 const coords=[[90,60],[240,60],[390,60],[90,220],[240,220],[390,220]];
 let body='';
 for(const[a,b]of d.edges){const[x,y]=coords[a],[X,Y]=coords[b];body+=arrow(x,y+(Y>y?25:Y<y?-25:0),X+(x<X?-64:x>X?64:0),Y+(y<Y?-32:y>Y?32:0));}
 d.labels.forEach((label,i)=>{const[x,y]=coords[i];body+='<rect x="'+(x-66)+'" y="'+(y-30)+'" width="132" height="60" rx="5" fill="var(--bg)" stroke="currentColor"/>'+text(x,y+5,label,'text-anchor="middle" font-size="14"');});
 body+=text(240,295,'Стрелки: энергия или управление; не монтажные провода','text-anchor="middle" font-size="13"');
 if(id==='teardown-usb-charger-5v')body+=text(240,145,'Изоляция в трансформаторе и оптопаре','text-anchor="middle" font-size="15"');
 return svg(body,{height:320,title:'Функциональные связи узлов устройства'});
}

