import { el } from '../dom.js';
import { api,act } from '../api.js';
let sequence=0;
export function answerControls(q,value){
 const type=q.question_type||q.type,group='answer-'+(++sequence),box=el('div',{class:'answer-controls'});
 if(type==='numeric'){
  const label=el('label',{class:'answer-field',text:'Ответ ('+q.unit+')'});
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
export function mountQuiz(container, q, {
  lessonId,
  saved,
  onAnswered = () => {},
  recall = false
} = {}) {
  const form = el('form', {
    class: 'quiz'
  });
  const fieldset = el('fieldset');
  const legend = el('legend', {
    text: q.question
  });
  const controls = answerControls(q.type === 'predict' ? {
    ...q,
    question_type: 'single'
  } : q, saved?.answer);
  const submit = el('button', {
    type: 'submit',
    class: 'primary',
    text: q.type === 'predict' ? 'Предсказать' : 'Проверить'
  });
  const feedback = el('p', {
    class: 'feedback',
    'aria-live': 'polite'
  });
  const actions = el('div', {
    class: 'row wrap quiz-actions'
  }, [submit]);
  let hint;
  if (q.hint) {
    hint = el('p', {
      class: 'quiz-hint',
      text: q.hint,
      hidden: true
    });
    const btn = el('button', {
      type: 'button',
      text: 'Подсказка',
      'aria-expanded': 'false'
    });
    btn.onclick = () => {
      hint.hidden = !hint.hidden;
      btn.setAttribute('aria-expanded', String(!hint.hidden));
      btn.textContent = hint.hidden ? 'Подсказка' : 'Скрыть подсказку';
    };
    actions.append(btn);
  }
  const show = data => {
    feedback.className = 'feedback ' + (data.is_correct ? 'correct' : 'incorrect');
    feedback.textContent = (data.is_correct ? '✓ Верно. ' : '✕ Пока неверно. ') + data.explanation;
    submit.textContent = q.type === 'predict' ? 'Изменить прогноз' : 'Проверить ещё раз';
  };
  if (q.feedback) {
    show(q.feedback);
  }
  if ((q.question_type || q.type) === 'multi') {
    controls.box.prepend(el('p', {
      class: 'muted',
      text: 'Можно выбрать несколько вариантов.'
    }));
  }
  fieldset.prepend(legend, controls.box);
  fieldset.append(actions);
  if (hint) fieldset.append(hint);
  fieldset.append(feedback);
  form.append(el('p', {
    class: 'eyebrow quiz-kind',
    text: recall ? 'Вспомни пройденное' : q.type === 'predict' ? 'Твой прогноз' : 'Проверь себя'
  }), fieldset);
  container.append(form);
  form.addEventListener('submit', act(async e => {
    e.preventDefault();
    const answer = controls.read();
    if (answer === undefined) {
      feedback.textContent = 'Сначала введи или выбери ответ.';
      return;
    }
    submit.disabled = true;
    try {
      const data = recall ? await api('/recall/answer', 'POST', {
        lesson_id: lessonId,
        block_id: q.id,
        answer
      }) : await api('/lessons/' + lessonId + '/answer', 'POST', {
        block_id: q.id,
        answer
      });
      show(data);
      onAnswered(q.id);
      document.dispatchEvent(new Event('course:update'));
    } finally {
      submit.disabled = false;
    }
  }));
  return form;
}

