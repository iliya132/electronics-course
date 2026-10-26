import {api,act} from '../api.js';
import {el,esc,lessonRow} from '../dom.js';
export async function review(root){
 const queue=await api('/review/queue');root.className='reading';let index=0;
 const render=()=>{
  if(index>=queue.length){root.innerHTML='<p class="eyebrow">Повторение</p><h1>На сегодня всё.</h1><p>Возвращайся завтра. Новые карточки появятся по расписанию.</p><a class="button" href="#/">К курсу →</a>';return;}
  const card=queue[index];root.innerHTML='<p class="eyebrow">Активное вспоминание</p><p class="muted">Осталось '+(queue.length-index)+' · коробка '+card.box+' из 5</p><h1>'+esc(card.q)+'</h1><p class="muted">Сначала сформулируй ответ своими словами.</p>';
  const answer=el('div',{class:'card-answer',text:card.a,hidden:true}),show=el('button',{class:'primary',text:'Показать ответ'}),actions=el('div',{class:'row wrap',hidden:true});
  show.onclick=()=>{answer.hidden=false;actions.hidden=false;show.hidden=true;};
  for(const correct of [false,true]){
   const button=el('button',{text:correct?'Помню':'Не помню',class:correct?'primary':''});
   button.onclick=act(async()=>{actions.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api('/review/answer','POST',{card_id:card.card_id,correct});index++;render();document.dispatchEvent(new Event('course:update'));}catch(e){actions.querySelectorAll('button').forEach(b=>b.disabled=false);throw e;}});
   actions.append(button);
  }
  root.append(show,answer,actions);
 };
 render();
}
export async function glossary(root){
 const terms=await api('/glossary');root.className='reading';root.innerHTML='<p class="eyebrow">Справочник</p><h1>Словарь терминов</h1><p class="muted">'+terms.length+' понятий — коротко и по существу.</p>';
 const input=el('input',{type:'search','aria-label':'Найти термин',placeholder:'Ток, конденсатор, GPIO…'}),list=el('dl');
 const render=()=>{const query=input.value.trim().toLowerCase(),found=terms.filter(t=>(t.term+' '+t.definition).toLowerCase().includes(query));
 list.replaceChildren();for(const term of found.sort((a,b)=>a.term.localeCompare(b.term,'ru')))list.append(el('dt',{id:term.id,text:term.term}),el('dd',{text:term.definition}));if(!found.length)list.append(el('p',{text:'Ничего не найдено.'}));};
 input.oninput=render;root.append(input,list);render();
}
export async function search(root){
 root.className='reading';root.innerHTML='<p class="eyebrow">Найти в курсе</p><h1>Поиск</h1>';
 const input=el('input',{type:'search','aria-label':'Поиск по урокам и терминам',placeholder:'Например, напряжение'}),results=el('div',{'aria-live':'polite'});
 let timer,version=0;
 input.oninput=()=>{clearTimeout(timer);const current=++version;timer=setTimeout(act(async()=>{
  const data=await api('/search?q='+encodeURIComponent(input.value));if(current!==version)return;
  results.innerHTML='<h2>Уроки</h2>'+data.lessons.map(l=>'<a class="lesson-row" href="#/lesson/'+l.id+'"><span>'+esc(l.title)+'<small>'+esc(l.summary)+'</small></span></a>').join('')+
   '<h2>Термины</h2>'+data.terms.map(t=>'<p><strong>'+esc(t.term)+'</strong><br>'+esc(t.definition)+'</p>').join('')+
   (!data.lessons.length&&!data.terms.length?'<p>Ничего не найдено. Попробуй другое слово.</p>':'');
 }),200);};root.append(input,results);return ()=>{clearTimeout(timer);version++;};
}
export async function summary(root) {
  const [course, stats] = await Promise.all([api('/course'), api('/stats')]);
  root.className = 'reading';
  if (!course.final_exam.passed) {
    root.innerHTML = "<h1>Итоги пока впереди</h1><p>Итоговый экран откроется после сдачи финальног" +
      "о экзамена.</p><a href=\"#/\">Вернуться к курсу</a>";
    return;
  }
  root.innerHTML = "<p class=\"eyebrow\">Поздравляем с завершением</p><h1>Курс пройден</h1><p>Сред" +
    "ний лучший результат: " + stats.average + ' %.<br>Завершено уроков: ' + stats.lessons + '. Время: ' +
    stats.minutes + ' мин.</p><h2>Что стоит повторить</h2>' + stats.weak.map(t => '<p>' + esc(t.title) + ' · ' +
    t.best.toFixed(0) + ' % <a href="#/exam/' + t.exam_id + '">Повторить</a></p>').join('') +
    ("<h2>Что дальше</h2><p>Выбери итоговый проект и доведи устройство от расчёта " +
    "до проверки.</p><a class=\"button primary\" href=\"#/topic/capstone\">Итоговые п" + "роекты →</a>");
  const projects = course.topics.find(t => t.id === 'capstone')?.lessons || [];
  root.insertAdjacentHTML('beforeend', projects.map(lessonRow).join(''));
}
