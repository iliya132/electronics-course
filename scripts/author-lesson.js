import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
export const block=(type,data)=>'\n```'+type+'\n'+yaml.dump(data,{lineWidth:100,noRefs:true})+'```\n';
export function writeLesson(folder, order, d) {
 const meta={id:d.id,title:d.title,icon:d.icon||'zap',summary:d.summary,kind:d.kind||'lesson',
 optional:d.optional||false,level:d.level||1,minutes:d.minutes||18,prerequisites:d.prerequisites||[],
 objectives:d.objectives,glossary:d.glossary||[],flashcards:d.flashcards};
 let body=d.hook+'\n';
 if(d.predict) body+=block('predict',{id:'predict',...d.predict});
 d.sections.forEach((s,i)=>{
  body+='\n## '+s.title+'\n\n'+s.text+'\n';
  if(i<2) body+=block('figure',{file:d.id+'/'+(i?'model':'concept')+'.svg',
    alt:s.alt||s.title,caption:s.caption||s.title});
  body+=block('quiz',{id:'check-'+(i+1),...s.quiz});
 });
 body+=block('example',d.example);
 body+=block('quiz',{id:'independent',...d.independent});
 body+=block('callout',{kind:'mistake',text:d.mistake});
 if(d.widget) body+=block('widget',{name:d.widget,params:d.params||{},caption:d.widgetCaption||'Измени параметры и сравни результат с расчётом.'});
 if(d.safety) body+=block('callout',{kind:'safety',text:d.safety});
 body+='\n## Практика\n\nРеши самостоятельно; при затруднении открой подсказку.\n';
 d.practice.forEach((q,i)=>body+=block('quiz',{id:'practice-'+(i+1),...q}));
 if(order>1 || folder!=='01-basics') body+=block('recall',{id:'recall',count:1});
 body+=block('checkpoint',{items:d.checkpoint});
 const dir=join('content/topics',folder); mkdirSync(dir,{recursive:true});
 writeFileSync(join(dir,String(order).padStart(2,'0')+'-'+d.id+'.md'),
   '---\n'+yaml.dump(meta,{lineWidth:100,noRefs:true})+'---\n\n'+body);
}
export const single=(question,options,answer,explanation,hint='Сопоставь определение с условием задачи.')=>({type:'single',question,options,answer,hint,explanation});
export const numeric=(question,answer,unit,explanation,hint='Запиши данные в одной системе единиц и подставь в формулу.')=>
 ({type:'numeric',question,answer,unit,tolerance_percent:1,hint,explanation});

