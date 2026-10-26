import {writeFileSync,mkdirSync} from 'node:fs';
import yaml from 'js-yaml';
import {block} from '../author-lesson.js';
import {calculation} from './calculations.js';
const quiz=(id,q)=>{const {formula,steps,result,...rest}=q;return block('quiz',{id,type:'numeric',...rest});};
export async function writeProject(topic,order,l,d,previous){
 if(!d.parts||!d.steps||!d.verify||!d.trouble)throw Error('Неполный проект '+l.id);
 const calc=calculation(d.model,2);
 if(d.code){mkdirSync('public/examples/'+l.id,{recursive:true});writeFileSync('public/examples/'+l.id+'/'+l.id+'.ino',d.code+'\n');}
 const meta={id:l.id,title:l.title,icon:l.icon,summary:d.truth.slice(0,140),kind:l.kind,optional:l.optional,
 level:topic.number<8?1:topic.number<14?2:3,minutes:60,prerequisites:previous?[previous]:[],
 objectives:['Собрать и проверить: '+l.title,'Сопоставить расчёт с измерениями и найти причину отклонения'],
 glossary:d.terms||[],flashcards:[{q:'Что проверяем в проекте «'+l.title+'»?',a:d.truth},{q:'Как найти ошибку?',a:d.trouble.join(' ')}]};
 let body='';
 if(l.kind==='teardown'){
  body=d.concept+'\n'+block('figure',{file:l.id+'/concept.svg',alt:d.diagram.join(' → '),caption:'Собственная упрощённая схема: функциональные связи.'})+
  block('widget',{name:'board-hotspots',params:{nodes:d.nodes},caption:'Выбери узел и его назначение.'})+
  block('figure',{file:l.id+'/model.svg',alt:'Расчётная характеристика узла питания',caption:calc.formula});
  for(const [i,node]of d.nodes.entries()){
   const wrong=d.nodes.filter(n=>n.role!==node.role).slice(0,2).map(n=>n.role),opts=[node.role,...wrong],shift=i%opts.length;
   for(let j=0;j<shift;j++)opts.push(opts.shift());
   body+=block('quiz',{id:'node-'+i,type:'single',question:'Зачем нужен '+node.name+' в этой схеме?',options:opts,answer:(opts.length-shift)%opts.length,
    hint:'Найди соединения узла с соседями.',explanation:node.role+'. '+node.explanation});
  }
  body+=block('callout',{kind:'safety',text:d.safety})+block('checkpoint',{items:[d.truth,d.check,calc.formula]});
 }else{
  body='## Цель\n\n'+d.concept+'\n\n## Что понадобится\n\n'+d.parts.map(p=>'- '+p).join('\n')+
   '\n\nБюджет: сначала используй детали своего набора. Для планирования можно заложить '+(topic.number<8?'500–1500':topic.number<14?'1000–2500':'1500–5000')+' ₽ без измерительных приборов; это условный резерв, актуальные цены проверяй перед покупкой.\n'+
   '\n## Расчёт\n\n'+calc.formula+block('figure',{file:l.id+'/concept.svg',alt:d.diagram.join(' → '),caption:d.diagram.join(' → ')})+
   block('example',{title:'Контрольный расчёт',steps:calc.steps,result:calc.result})+
   block('figure',{file:l.id+'/model.svg',alt:'Зависимость в расчётной модели проекта',caption:'Модель и условия обозначены на осях.'})+
   '\n## Сборка по шагам\n\n'+d.steps.map((s,i)=>(i+1)+'. '+s).join('\n')+
   (d.code?'\n\n[Скачать скетч .ino](/examples/'+l.id+'/'+l.id+'.ino)\n\n```cpp\n'+d.code+'\n```\n':'')+
   '\n## Проверка\n\n'+d.verify+'\n'+quiz('measurement',calculation(d.model,3))+
   '\n## Если не работает\n\n'+d.trouble.map(s=>'- '+s).join('\n')+
   block('callout',{kind:'mistake',text:d.wrong1+'. '+d.truth})+
   '\n## Безопасность\n'+block('callout',{kind:'safety',text:d.safety||'Собирай без питания. Работай только от защищённого низковольтного источника с ограничением тока. Не подключай сетевое напряжение.'})+
   '\n## Идеи развития\n\n'+(d.extend||'Измени один параметр, повтори расчёт и измерение. Запиши причины расхождения, не меняя одновременно несколько деталей.')+
   quiz('design',calculation(d.model,4))+quiz('transfer',calculation(d.model,5))+
   block('checkpoint',{items:[d.truth,d.check,calc.formula]});
 }
 writeFileSync('content/topics/'+topic.folder+'/'+String(order).padStart(2,'0')+'-'+l.id+'.md','---\n'+yaml.dump(meta,{lineWidth:100,noRefs:true})+'---\n\n'+body);
}

