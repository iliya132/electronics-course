import { api,act,toast } from '../api.js';
import { el,esc,icon } from '../dom.js';
import { renderBlock } from '../blocks/render.js';
import { applyTerms } from '../blocks/glossary.js';
export async function lesson(root,id){
 const [l,terms]=await Promise.all([api('/lessons/'+id),api('/glossary')]);
 await api('/lessons/'+id+'/open','POST',{});
 document.title=l.title+' — Электроника';
 root.className='reading';root.innerHTML='<a href="#/topic/'+l.topic+'">← Тема «'+esc(l.topic_title)+'»</a><article><p class="eyebrow">Урок '+l.position+' из '+l.topic_count+' · '+l.minutes+' мин · Уровень '+l.level+(l.optional?' · Дополнительный урок':'')+'</p><h1>'+icon(l.icon)+' '+esc(l.title)+'</h1><p class="muted">'+esc(l.summary)+'</p><section class="panel"><h3>После урока ты сможешь…</h3><ul>'+l.objectives.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul></section></article>';
 const article=root.querySelector('article'),answered=new Set(l.answers.map(a=>a.block_id));
 const required=l.blocks.filter(b=>['quiz','predict'].includes(b.type)).map(b=>b.id);
 if(l.missing.length)article.append(el('aside',{class:'callout warning',html:'Сначала рекомендуем: '+l.missing.map(m=>'<a href="#/lesson/'+m.id+'">'+esc(m.title)+'</a>').join(', ')}));
 const complete=el('button',{class:'primary',text:l.progress.status==='completed'?'✓ Урок завершён':'Завершить урок'});
 const remaining=el('p',{class:'muted','aria-live':'polite'});
 const update=()=>{const n=required.filter(id=>!answered.has(id)).length;complete.hidden=n>0;remaining.textContent=n?'Осталось ответить: '+n:'';};
 const disposers=[];
 for (const b of l.blocks) {
  try {
    await renderBlock(article, b, {
      lessonId: id, answers: l.answers, disposers,
      onAnswered: key => { answered.add(key); update(); }
    });
  } catch (e) {
    article.append(el('aside', {
      class: 'callout warning', text: 'Не удалось показать блок «' + b.type + '»: ' + e.message
    }));
  }
 }
 applyTerms(article,terms,l.glossary);
 const note=el('textarea',{'aria-label':'Моя заметка',placeholder:'Запиши, что было важным или осталось непонятным.'});note.value=l.note;
 const noteState=el('small',{'aria-live':'polite'});let noteTimer,dirty=false;
 const saveNote=async()=>{if(!dirty)return;await api('/lessons/'+id+'/note','PUT',{text:note.value});dirty=false;noteState.textContent='Сохранено';};
 note.oninput=()=>{dirty=true;noteState.textContent='Сохранение…';clearTimeout(noteTimer);noteTimer=setTimeout(act(saveNote),600);};
 root.append(el('section',{class:'note'},[el('h2',{text:'Моя заметка'}),note,noteState]));
 complete.onclick=act(async()=>{await api('/lessons/'+id+'/complete','POST',{});complete.textContent='✓ Урок завершён';toast('Урок завершён. Карточки добавлены в повторение.');document.dispatchEvent(new Event('course:update'));});
 const actions=el('div',{class:'lesson-actions'},[remaining,el('div',{class:'row wrap'},[complete])]);
 if (l.topic_exam && !l.topic_exam.passed) {
  actions.lastChild.append(el('a', {
    class: 'button', href: '#/exam/' + l.topic_exam.id, text: 'Экзамен темы →'
  }));
 }
 if(l.next)actions.lastChild.append(el('a',{class:'button',href:'#/lesson/'+l.next,text:'Следующий урок →'}));
 if(l.previous)actions.append(el('p',{},[el('a',{href:'#/lesson/'+l.previous,text:'← Предыдущий урок'})]));
 root.append(actions);update();
 const toc=el('nav',{class:'lesson-toc','aria-label':'Оглавление урока'}),headings=[...article.querySelectorAll('h2')];
 headings.forEach((h,i)=>{h.id='section-'+i;const a=el('a',{href:'#',text:h.textContent});a.onclick=e=>{e.preventDefault();h.scrollIntoView();h.tabIndex=-1;h.focus({preventScroll:true});};toc.append(a);});root.append(toc);
 let last=Date.now(),scroll=l.progress.scroll_pos,ready=false;
 const onScroll=()=>{if(!ready)return;scroll=window.scrollY;const max=document.documentElement.scrollHeight-innerHeight;
  document.getElementById('reading-progress').style.width=(max>0?Math.min(100,scroll/max*100):0)+'%';
  let active=0;headings.forEach((h,i)=>{if(h.getBoundingClientRect().top<180)active=i;});
  [...toc.children].forEach((a,i)=>a.classList.toggle('current',i===active));
 };
 const saveProgress=async()=>{const now=Date.now(),delta=document.visibilityState==='visible'?Math.min(120,Math.floor((now-last)/1000)):0;last=now;
  await api('/lessons/'+id+'/progress','POST',{scroll_pos:scroll,time_delta_sec:delta});};
 const onReady=()=>{ready=true;window.scrollTo(0,l.progress.scroll_pos);onScroll();};document.addEventListener('route:ready',onReady,{once:true});
 window.addEventListener('scroll',onScroll,{passive:true});const timer=setInterval(act(saveProgress),15000);
 const onHide=()=>{if(document.visibilityState==='hidden'){saveProgress().catch(()=>{});saveNote().catch(()=>{});}last=Date.now();};
 document.addEventListener('visibilitychange',onHide);
 return ()=>{clearInterval(timer);clearTimeout(noteTimer);window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',onHide);
  document.removeEventListener('route:ready',onReady);saveProgress().catch(()=>{});saveNote().catch(()=>{});disposers.forEach(fn=>fn());};
}

