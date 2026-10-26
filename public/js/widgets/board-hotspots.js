import {el} from '../dom.js';
export function mount(container,params={}){
 const nodes=params.nodes||[{name:'U1 · МК',role:'Выполняет программу',lesson:'mcu-what'},{name:'U2 · LDO',role:'Стабилизирует питание',lesson:'ldo'},{name:'C1',role:'Развязывает питание',lesson:'decoupling'}];
 const choices=[...new Set(nodes.map(n=>n.role))],board=el('div',{class:'stack'}),detail=el('div',{'aria-live':'polite'});
 nodes.forEach((node,i)=>{
  const button=el('button',{text:node.name,'aria-label':'Узел '+node.name});
  button.onclick=()=>{
   detail.replaceChildren(el('h3',{text:'Для чего нужен '+node.name+'?'}));
   const select=el('select',{'aria-label':'Роль узла'},[el('option',{value:'',text:'Выбери роль'})]);
   choices.forEach(role=>select.append(el('option',{value:role,text:role})));
   const feedback=el('p');select.onchange=()=>{feedback.textContent=select.value===node.role?'✓ Верно. '+(node.explanation||node.role):'Пока неверно. Сопоставь обозначение с назначением.';
    if(select.value===node.role&&node.lesson)feedback.append(' ',el('a',{href:'#/lesson/'+node.lesson,text:'Повторить урок →'}));};
   detail.append(select,feedback);
  };
  board.append(button);
 });
 container.append(el('p',{text:'Найди на плате: выбери узел и определи его роль.'}),board,detail);
}

