import {el} from '../dom.js';
export function mount(container,params={}){
 const nodes=params.nodes||[{name:'МК',role:'Выполняет программу',lesson:'mcu-what'},{name:'LDO',role:'Стабилизирует питание',lesson:'ldo'},{name:'Развязка',role:'Замыкает быстрые токи питания',lesson:'decoupling'}];
 const choices=[...new Set(nodes.map(n=>n.role))],detail=el('div',{'aria-live':'polite'});
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 const height=40+Math.ceil(nodes.length/2)*100;svg.setAttribute('viewBox','0 0 480 '+height);
 svg.setAttribute('role','group');svg.setAttribute('aria-label','Узлы платы. Выбери узел кнопкой или клавиатурой.');
 function shape(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;return n;}
 svg.append(shape('rect',{x:8,y:8,width:464,height:height-16,rx:12,fill:'var(--surface)',stroke:'currentColor'}));
 const buttons=[];
 function open(node,index){
  buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  detail.replaceChildren(el('h3',{text:'Какова роль узла «'+node.name+'»?'}));
  const select=el('select',{'aria-label':'Роль узла'},[el('option',{value:'',text:'Выбери роль'})]);
  choices.forEach(role=>select.append(el('option',{value:role,text:role})));
  const feedback=el('p');select.onchange=()=>{feedback.textContent=select.value===node.role?'✓ Верно. '+(node.explanation||node.role):'Пока неверно. Сопоставь обозначение с назначением.';
   if(select.value===node.role&&node.lesson)feedback.append(' ',el('a',{href:'#/lesson/'+node.lesson,text:'Повторить урок →'}));};
  detail.append(select,feedback);
 }
 nodes.forEach((node,i)=>{
  const x=24+i%2*232,y=24+Math.floor(i/2)*100;
  const g=shape('g',{role:'button',tabindex:0,'aria-label':'Узел '+node.name,'aria-pressed':'false',class:'board-node'});
  g.append(shape('rect',{x,y,width:200,height:76,rx:5,fill:'var(--bg)',stroke:'var(--accent)','stroke-width':2}));
  const words=node.name.split(' ');let lines=[''];for(const word of words){if((lines.at(-1)+' '+word).length>19)lines.push(word);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;}
  lines.slice(0,3).forEach((line,j)=>g.append(shape('text',{x:x+100,y:y+28+j*19,'text-anchor':'middle',fill:'currentColor','font-size':16},line)));
  g.onclick=()=>open(node,i);g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open(node,i);}};
  buttons.push(g);svg.append(g);
 });
 container.append(el('p',{text:'Упрощённая карта узлов; расположение условное. Выбери узел и найди его функцию.'}),svg,detail);
}
