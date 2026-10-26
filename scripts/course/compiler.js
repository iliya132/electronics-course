import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import yaml from 'js-yaml';
import {writeLesson,single,numeric,block} from '../author-lesson.js';
import {calculation} from './calculations.js';
import {makeFigures} from './figures.js';
import {loadContent} from '../../server/content.js';
import {validateContent} from '../lib/validate.js';
import {enrich,practiceChoice} from './enrich.js';
const plan=JSON.parse(readFileSync('scripts/course/plan.json','utf8'));
const number=Number(process.argv[2]);const t=plan.find(t=>t.number===number);if(!t)throw Error('Укажи номер темы');
const {data}=await import('./topic-'+String(number).padStart(2,'0')+'.js');
let previous='';
for(const old of plan.filter(p=>p.number<number))for(const l of old.lessons)if(!l.optional)previous=l.id;
const bank=[];
const clean=q=>{const {formula,steps,result,...fields}=q;return {type:'numeric',...fields};};
function choice(d,question,index=0){
 const options=[d.truth,d.wrong1,d.wrong2],shift=index%3;for(let i=0;i<shift;i++)options.push(options.shift());
 return single(question,options,(3-shift)%3,d.truth+' '+d.concept+' Ошибочные варианты: '+d.wrong1+'; '+d.wrong2+'. Они не учитывают описанный принцип.',d.check);
}
const folder='content/topics/'+t.folder;mkdirSync(folder,{recursive:true});
writeFileSync(folder+'/topic.yml',yaml.dump({id:t.id,title:t.title,icon:t.icon,summary:t.summary}));
for(const [i,l]of t.lessons.entries()){
 const d=data[l.id];if(!d)throw Error('Нет авторского материала: '+l.id);enrich(d,l,t);
 const icon=existsSync('node_modules/lucide-static/icons/'+l.icon+'.svg')?l.icon:'circuit-board';
 const title=d.title||l.title,calc=calculation(d.model,1),example=calculation(d.model,2);
 if(l.kind!=='lesson'){
  const {writeProject}=await import('./projects.js');await writeProject(t,i+1,{...l,title,icon},d,previous);
 }else if(!['charge-current','voltage'].includes(l.id)){
  const split=d.concept.indexOf('. '),hook=split>=0?d.concept.slice(0,split+1):'Как применить «'+title+'» в реальном устройстве?';
  const concept=split>=0?d.concept.slice(split+2):d.concept;
  writeLesson(t.folder,i+1,{...l,title,icon,summary:d.truth.slice(0,140),level:number<8?1:number<14?2:3,
   minutes:d.code?25:18,prerequisites:previous?[previous]:[],glossary:d.terms||[],
   objectives:['Объяснять принцип: '+title,'Выполнять расчёт и проверять результат измерением'],
   hook,predict:{id:'predict',question:'Какое предположение верно для этой задачи?',options:[d.truth,d.wrong1],answer:0,reveal:d.concept},
   sections:[
    {title:'Как это устроено',text:concept,alt:d.diagram.join(' → '),caption:'Основные связи: '+d.diagram.join(' → '),
     quiz:choice(d,'Какой принцип объясняет работу этого узла?',i)},
    {title:'Модель и единицы',text:calc.formula+'\n\n'+d.check,alt:'График модели '+title,caption:'Расчётная модель. Условия и единицы подписаны на графике.',
     quiz:clean(calc)},
    {title:'Проверяем на практике',text:d.check+'\n\nДо подключения найди общий провод и проверь режим прибора. Изменяй один параметр за раз, записывай расчёт и измерение. Несовпадение сначала проверь по единицам и условиям модели.'+(d.code?'\n\n```cpp\n'+d.code+'\n```':''),
     quiz:single('Как проверить этот узел и интерпретировать результат?',[d.wrong2,d.check,d.wrong1],1,d.check+' '+d.concept,'Сначала выясни условия, при которых работает модель.')}
   ],
   example:{title:'Расчёт с проверкой единиц',steps:example.steps,result:example.result},
   independent:clean(calculation(d.model,3)),mistake:d.wrong1+'. '+d.truth,widget:d.widget,
   safety:d.safety,board:d.board,home:d.home,
   practice:[practiceChoice(d),clean(calculation(d.model,4)),clean(calculation(d.model,5))],
   flashcards:[{q:'Главное правило: '+title+'?',a:d.truth},{q:'Как считать в задаче «'+title+'»?',a:calc.formula},{q:'Что проверить перед измерением?',a:d.check}],
   checkpoint:[d.truth,calc.formula,d.check]});
 }
 if(!['charge-current','voltage'].includes(l.id))makeFigures(l.id,d);
 const script=`import {data} from '../course/topic-${String(number).padStart(2,'0')}.js';\nimport {makeFigures} from '../course/figures.js';\nexport function generate(){makeFigures('${l.id}',data['${l.id}']);}\n`;
 if(!['charge-current','voltage'].includes(l.id))writeFileSync('scripts/figures/'+l.id+'.js',script);
 for(let j=0;j<5;j++){
  const q=j===2?{...practiceChoice(d),question:'В задаче «'+title+'» выбери два верных основания для решения.'}:j===0?choice(d,'При разборе задачи «'+title+'» какой вывод обоснован?',i+1):clean(calculation(d.model,5+j));
  bank.push({...q,id:t.id+'-'+l.id+'-'+j,lesson:l.id,difficulty:j<2?1:j<4?2:3});
 }
 if(!l.optional)previous=l.id;
}
if(number<=17)writeFileSync(folder+'/exam.yml',yaml.dump({id:'exam-'+t.id,topic:t.id,pass_percent:70,questions_per_attempt:10,questions:bank},{lineWidth:100,noRefs:true}));
const course={title:'Электроника: от тока до ESP32',topics:plan.filter(p=>p.number<=number).map(p=>p.folder),final_exam:{id:'final',questions_per_attempt:30,pass_percent:70}};
writeFileSync('content/course.yml',yaml.dump(course));
const errors=validateContent(loadContent());if(errors.length)throw Error(errors.join('\n'));
console.log('OK: тема '+t.id+', '+t.lessons.length+' занятий, банк '+(number<=17?bank.length:0));

