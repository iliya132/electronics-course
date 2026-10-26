import {api,act,toast} from '../api.js';
import {el,esc,progressBar} from '../dom.js';
import {answerControls} from '../blocks/quiz.js';
const num=a=>typeof a==='number'?Number(a.toPrecision(6)).toLocaleString('ru-RU'):a;
const format=(q,a)=>a==null||(Array.isArray(a)&&!a.length)?'Пропущен':q.options?(Array.isArray(a)?a.map(i=>q.options[i]).join('; '):q.options[a]):num(a)+' '+q.unit;
export async function exam(root,id){
 const [info,course]=await Promise.all([api('/exams/'+id+'/history'),api('/course')]);
 const topic=course.topics.find(t=>t.exam?.id===id);
 root.className='reading';root.innerHTML='<a href="'+(topic?'#/topic/'+topic.id:'#/')+'">← К курсу</a><p class="eyebrow">Проверка знаний</p><h1>'+esc(topic?'Экзамен: '+topic.title:'Итоговый экзамен')+'</h1><p>'+info.count+' вопросов · порог '+info.pass_percent+' % · без ограничения времени.</p><p class="muted">Можно возвращаться к вопросам. Ответы и объяснения появятся после сдачи.</p>';
 const start=el('button',{class:'primary',text:info.attempts.some(a=>a.finished_at===null)?'Продолжить попытку':'Начать экзамен',disabled:!info.available});
 start.onclick=act(async()=>{start.disabled=true;try{const a=await api('/exams/'+id+'/start','POST',{});location.hash='#/attempt/'+a.attemptId;}finally{start.disabled=false;}});
 root.append(start);
 if(!info.available)root.append(el('p',{class:'muted',text:'Осталось '+(id==='final'?'сдать экзаменов: ':'завершить обязательных уроков: ')+info.remaining}));
 root.append(el('h2',{text:'История попыток'}));
 if(!info.attempts.length)root.append(el('p',{class:'muted',text:'Попыток пока нет.'}));
 for(const a of info.attempts)root.append(el('a',{class:'lesson-row',href:'#/attempt/'+a.id,text:new Date(a.started_at).toLocaleString('ru-RU')+' · '+(a.finished_at?a.score_percent.toFixed(0)+' % · '+(a.passed?'Сдано':'Не сдано'):'Продолжить попытку')}));
}
export function showResult(root,r){
 root.innerHTML='<p class="eyebrow">Результат экзамена</p><h1>'+r.score_percent.toFixed(0)+' % — '+r.grade+'</h1><p>'+(r.passed?'✓ Сдано':'✕ Не сдано')+' · Верно '+r.correct+' из '+r.total+'</p><div class="row wrap"><a class="button primary" href="#/exam/'+r.exam_id+'">Пересдать</a><a class="button" href="#/">К курсу</a>'+(r.exam_id==='final'&&r.passed?'<a class="button" href="#/summary">Итоги курса →</a>':'')+'</div><h2>Разбор ошибок</h2>';
 const errors=r.detail.filter(q=>!q.is_correct);
 if(!errors.length)root.append(el('p',{text:'Все ответы верны. Отличная работа.'}));
 errors.forEach(q=>root.append(el('section',{class:'panel',html:'<h3>'+esc(q.question)+'</h3><p>Твой ответ: '+esc(format(q,q.user_answer))+'</p><p>Правильно: '+esc(format(q,q.answer))+'</p><p>'+esc(q.explanation)+'</p><a href="#/lesson/'+q.lesson+'">Повторить урок →</a>'})));
 document.dispatchEvent(new Event('course:update'));
}
export async function attempt(root,id){
 const data=await api('/exams/attempts/'+id);root.className='reading';
 if(data.finished){showResult(root,data.result);return;}
 const answers=new Map((data.answers||[]).map(a=>[a.id,a.answer]));let index=0,controls,reviewing=false,dirty=false,saveTimer;
 let saveChain=Promise.resolve();
 const queueSave=(q,value)=>{
  if(value===null)answers.delete(q.id);else answers.set(q.id,value);
  saveChain=saveChain.catch(()=>{}).then(()=>api('/exams/attempts/'+id+'/answer','PUT',{question_id:q.id,answer:value}));
  return saveChain;
 };
 const save=async()=>{if(!controls||reviewing)return;const value=controls.read();
  if(value!==undefined||answers.has(data.questions[index].id)){dirty=false;await queueSave(data.questions[index],value??null);}};
 const render=()=>{
  reviewing=false;const q=data.questions[index];
  root.innerHTML='<p class="eyebrow">Экзамен · вопрос '+(index+1)+' из '+data.questions.length+'</p>'+progressBar((index+1)/data.questions.length*100);
  const form=el('form'),fieldset=el('fieldset',{class:'panel'},[el('legend',{text:q.question})]);
  if ((q.question_type || q.type) === 'multi') {
    fieldset.append(el('p', {class: 'muted', text: 'Можно выбрать несколько вариантов.'}));
  }
  const error = el('p', {class: 'feedback incorrect', role: 'alert'});
  const guard = fn => async () => {
    error.textContent = '';
    try {
      await fn();
    } catch (e) {
      error.textContent = e.message;
    }
  };
  controls=answerControls(q,answers.get(q.id));fieldset.append(controls.box);form.append(fieldset);form.onsubmit=e=>e.preventDefault();root.append(form,error);
  controls.box.addEventListener('change',()=>{dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(guard(save),250);});
  const back=el('button',{text:'← Назад',disabled:index===0}),next=el('button',{class:'primary',text:index===data.questions.length-1?'Проверить ответы →':'Далее →'});
  back.onclick=guard(async()=>{clearTimeout(saveTimer);await save();index--;render();});
  next.onclick=guard(async()=>{clearTimeout(saveTimer);await save();if(index<data.questions.length-1){index++;render();}else review();});
  root.append(el('div',{class:'row spread'},[back,next]),el('p',{class:'muted',text:'Пустой ответ можно пропустить и заполнить перед сдачей.'}));
 };
 const review=()=>{
  reviewing=true;controls=null;root.innerHTML='<p class="eyebrow">Перед сдачей</p><h1>Проверь ответы</h1>';
  const missing=data.questions.filter(q=>!answers.has(q.id));
  root.append(el('p',{text:missing.length?'Пропущено вопросов: '+missing.length+'. При сдаче они считаются ошибками.':'Ответы на все вопросы сохранены.'}));
  data.questions.forEach((q,i)=>{
   const btn=el('button',{class:'lesson-row',text:(i+1)+'. '+q.question+' — '+(answers.has(q.id)?'Ответ сохранён':'Пропущен')});
   btn.onclick=()=>{index=i;render();};root.append(btn);
  });
  const finish=el('button',{class:'primary',text:'Сдать экзамен'});
  finish.onclick=act(async()=>{finish.disabled=true;try{await saveChain;showResult(root,await api('/exams/attempts/'+id+'/finish','POST',{}));}finally{finish.disabled=false;}});
  root.append(finish);
 };
 render();
 return ()=>{clearTimeout(saveTimer);if(dirty)save().catch(e=>toast(e.message));};
}

