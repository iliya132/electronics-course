import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const source=readFileSync('../CURRICULUM_electronics.md','utf8'),topics=[];let topic;
for(const line of source.split(/\r?\n/)){
 const heading=line.match(/^### (\d+) · ([a-z0-9-]+) — (.*?) \((?:иконка темы: )?`([a-z0-9-]+)`\)/);
 if(heading){topic={number:Number(heading[1]),id:heading[2],title:heading[3],icon:heading[4],folder:heading[1]+'-'+heading[2],lessons:[]};topics.push(topic);continue;}
 if(topic&&line.startsWith('Цель:'))topic.summary=line.slice(5).trim();
 const lesson=line.match(/^(?:\d+\. )?([⭐◇🛠🔍]+)\s+\*\*(?:[PC]\d+ · )?([a-z0-9-]+)\*\* · `([a-z0-9-]+)` · (.+)$/u);
 if(topic&&lesson){
  const description=lesson[4],title=description.split(' — ')[0].split(' · ')[0].replace(/\*.*$/,'').trim().replace(/\.$/,'');
  topic.lessons.push({id:lesson[2],icon:lesson[3],title,description,optional:lesson[1]==='◇',kind:lesson[1].includes('🛠')?'project':lesson[1]==='🔍'?'teardown':'lesson'});
 }
}
mkdirSync('scripts/course',{recursive:true});writeFileSync('scripts/course/plan.json',JSON.stringify(topics,null,2));
console.log(topics.map(t=>t.id+': '+t.lessons.length).join('\n'));
console.log('Всего:',topics.reduce((n,t)=>n+t.lessons.length,0));

