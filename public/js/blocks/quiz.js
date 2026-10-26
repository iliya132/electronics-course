import { el,esc } from '../dom.js';
import { api,act } from '../api.js';
let sequence=0;
export function answerControls(q,value){
 const type=q.question_type||q.type,group='answer-'+(++sequence),box=el('div');
 if(type==='numeric'){
  const label=el('label',{text:'Ответ ('+q.unit+')'});
  const input=el('input',{type:'text',inputmode:'decimal',autocomplete:'off','aria-label':'Ответ ('+q.unit+')',value:value??'',required:true});
  label.append(input);box.append(label);
  return {box,read:()=>input.value.trim()?input.value.trim():undefined};
 }
 q.options.forEach((option,i)=>{
  const input=el('input',{type:type==='multi'?'checkbox':'radio',name:group,value:i});
  input.checked=type==='multi'?Array.isArray(value)&&value.includes(i):value===i;
  const label=el('label',{class:'choice'},[input,el('span',{text:option})]);box.append(label);
 });
 return {box,read:()=>{
  const checked=[...box.querySelectorAll('input:checked')].map(i=>Number(i.value));
  return checked.length?(type==='multi'?checked:checked[0]):undefined;
 }};
}
export function mountQuiz(container,q,{lessonId,saved,onAnswered=()=>{}}={}){
 const form=el('form',{class:'quiz'}),fieldset=el('fieldset'),legend=el('legend',{text:q.question});
 const controls=answerControls(q.type==='predict'?{...q,question_type:'single'}:q,saved?.answer);
 const submit=el('button',{type:'submit',class:'primary',text:q.type==='predict'?'Предсказать':'Проверить'});
 const feedback=el('p',{class:'feedback','aria-live':'polite'});
 const actions=el('div',{class:'row wrap'},[submit]);
 if(q.hint){
  const hint=el('p',{text:q.hint,hidden:true}),btn=el('button',{type:'button',text:'Подсказка'});
  btn.onclick=()=>{hint.hidden=!hint.hidden;btn.textContent=hint.hidden?'Подсказка':'Скрыть подсказку';};actions.append(btn);fieldset.append(hint);
 }
 const show=data=>{feedback.className='feedback '+(data.is_correct?'correct':'incorrect');
  feedback.textContent=(data.is_correct?'✓ Верно. ':'✕ Пока неверно. ')+data.explanation;
  submit.textContent='Проверить ещё раз';};
 if(q.feedback)show(q.feedback);
 fieldset.prepend(legend,controls.box);fieldset.append(actions,feedback);form.append(fieldset);container.append(form);
 form.addEventListener('submit',act(async e=>{
  e.preventDefault();const answer=controls.read();
  if(answer===undefined){feedback.textContent='Сначала введи или выбери ответ.';return;}
  submit.disabled=true;
  try{
   const data=await api('/lessons/'+lessonId+'/answer','POST',{block_id:q.id,answer});
   show(data);onAnswered(q.id);document.dispatchEvent(new Event('course:update'));
  }finally{submit.disabled=false;}
 }));
 return form;
}

