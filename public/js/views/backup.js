import {api,act,toast} from '../api.js';
import {el} from '../dom.js';
export function mountBackup(root){
 root.append(el('h2',{text:'Сохранение прогресса'}),el('p',{class:'muted',text:'Резервная копия содержит ответы, заметки, повторение и настройки.'}));
 const download=el('button',{text:'Экспорт JSON'}),file=el('input',{type:'file',accept:'.json,application/json','aria-label':'Файл прогресса JSON'});
 const apply=el('button',{text:'Заменить прогресс из файла',disabled:true}),message=el('p',{'aria-live':'polite'});let candidate;
 download.onclick=act(async()=>{
  const data=await api('/export'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link=el('a',{href:url,download:'electronics-progress.json'});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 file.onchange=act(async()=>{candidate=null;apply.disabled=true;const selected=file.files[0];if(!selected)return;
  if(selected.size>10000000)throw Error('Файл слишком большой');
  candidate=JSON.parse(await selected.text());if(candidate.version!==1||!candidate.tables)throw Error('Неподдерживаемый формат');
  message.textContent='Файл выбран. Импорт заменит текущий прогресс. При необходимости сначала сохрани экспорт.';apply.disabled=false;
 });
 apply.onclick=act(async()=>{apply.disabled=true;try{await api('/import','POST',candidate);location.reload();}catch(e){apply.disabled=false;throw e;}});
 root.append(download,el('label',{text:'Импортировать резервную копию'},[file]),message,apply,el('h2',{text:'Сброс прогресса'}));
 const confirm=el('input',{'aria-label':'Введи СБРОСИТЬ',placeholder:'СБРОСИТЬ'}),reset=el('button',{text:'Сбросить прогресс',disabled:true});
 confirm.oninput=()=>reset.disabled=confirm.value!=='СБРОСИТЬ';
 reset.onclick=act(async()=>{await api('/reset','POST',{confirm:confirm.value});location.reload();});
 root.append(el('p',{class:'muted',text:'Сброс удалит локальные ответы, заметки, историю и настройки. Для восстановления заранее сохрани JSON.'}),el('label',{text:'Для подтверждения введи СБРОСИТЬ'},[confirm]),reset);
}

