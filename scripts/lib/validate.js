import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { questionType } from '../../server/content.js';
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validateContent(c) {
  const errors = [], seen = new Set(), ids = new Set(), examIds = new Set();
  const fail = (file, text, i) => errors.push(`${file}${i === undefined ? '' : ': блок '+(i+1)}: ${text}`);
  const question = (q, file, i) => {
    const type = questionType(q);
    if (!['single','multi','numeric'].includes(type)) fail(file,'тип вопроса single/multi/numeric',i);
    if (!q.question || !q.explanation) fail(file,'нужны question и explanation',i);
    if (q.formula !== undefined) {
      const lines = [].concat(q.formula);
      if (!lines.length || lines.some(x => typeof x !== 'string' || !x.trim())) fail(file,'formula: строка или список непустых строк',i);
    }
    if (q.formula_open !== undefined && (typeof q.formula_open !== 'boolean' || q.formula === undefined)) fail(file,'formula_open: boolean и только вместе с formula',i);
    if (type === 'numeric') {
      if (!Number.isFinite(q.answer) || !q.unit || (q.tolerance_percent !== undefined &&
          (!Number.isFinite(q.tolerance_percent) || q.tolerance_percent < 0))) fail(file,'числовой ответ, единица и неотрицательный допуск',i);
    } else {
      if (!Array.isArray(q.options) || q.options.length < 2) { fail(file,'минимум два варианта',i); return; }
      const answers = type === 'multi' ? q.answer : [q.answer];
      if (!Array.isArray(answers) || !answers.length || new Set(answers).size !== answers.length ||
          answers.some(a => !Number.isInteger(a) || a < 0 || a >= q.options.length)) fail(file,'answer вне options или повторён',i);
    }
  };
  if (!c.lessons.length) fail('content','нет уроков');
  for (const topic of c.topics) {
    if (!idPattern.test(topic.id) || ids.has(topic.id)) fail(topic.folder,'id темы неверен/повторён');
    ids.add(topic.id);
    if (!topic.lessons.length || !topic.title || !topic.summary) fail(topic.folder,'пустая тема');
  }
  const termIds = new Set(c.glossary.map(t => t.id));
  for (const l of c.lessons) {
    const f=l.file, bs=l.blocks, types=bs.map(b=>b.type);
    for (const key of ['id','title','icon','summary','level','minutes','prerequisites','objectives','glossary','flashcards'])
      if (l[key] === undefined) fail(f,'отсутствует '+key);
    if (!idPattern.test(l.id) || seen.has(l.id)) fail(f,'id урока неверен/повторён');
    if (!Array.isArray(l.prerequisites) || l.prerequisites.some(id => !seen.has(id))) fail(f,'prerequisites должны существовать и идти раньше');
    seen.add(l.id);
    if (typeof l.summary !== 'string' || l.summary.length > 140) fail(f,'summary не длиннее 140 символов');
    if (![1,2,3].includes(l.level) || !(l.minutes > 0)) fail(f,'level 1–3, minutes > 0');
    if (!['lesson','project','teardown'].includes(l.kind) || typeof l.optional !== 'boolean') fail(f,'kind/optional неверны');
    if (!Array.isArray(l.objectives) || l.objectives.length < 2 || l.objectives.length > 4) fail(f,'нужно 2–4 цели');
    if (!Array.isArray(l.flashcards) || l.flashcards.length < 2 || l.flashcards.length > 5 ||
        l.flashcards.some(card => !card.q || !card.a)) fail(f,'нужно 2–5 карточек q/a');
    for (const [n,card] of (Array.isArray(l.flashcards)?l.flashcards:[]).entries()) {
      if (card.more === undefined) continue;
      const paragraphs = [].concat(card.more);
      if (paragraphs.length > 2 || paragraphs.some(p => typeof p !== 'string' || !p.trim()) ||
          paragraphs.join('').length > 900) fail(f,`карточка ${n+1}: more — 1–2 абзаца, не больше 900 символов`);
    }
    if (!Array.isArray(l.glossary) || l.glossary.some(id=>!termIds.has(id))) fail(f,'неизвестный термин');
    if (!existsSync(join(c.root,'node_modules/lucide-static/icons',l.icon+'.svg'))) fail(f,'иконка не существует: '+l.icon);
    const blockIds = new Set();
    bs.forEach((b,i)=>{
      if (['quiz','predict','recall'].includes(b.type)) {
        if (!idPattern.test(b.id) || blockIds.has(b.id)) fail(f,'id блока отсутствует/повторён',i);
        blockIds.add(b.id);
      }
      if (b.type==='quiz') { question(b,f,i); if (!b.hint) fail(f,'нужна подсказка hint',i); }
      if (b.type==='predict') question({...b,question_type:'single',explanation:b.reveal},f,i);
      if (b.type==='figure' && (!b.file || b.file.includes('..') || !b.alt || !b.caption ||
          !existsSync(join(c.root,'public/figures',b.file)))) fail(f,'figure: файл/alt/caption',i);
      if (b.type==='widget' && (!idPattern.test(b.name) || !existsSync(join(c.root,'public/js/widgets',b.name+'.js'))))
        fail(f,'widget: модуль не существует',i);
      if (b.type==='example' && (!b.title || !Array.isArray(b.steps) || b.steps.length<2 || !b.result)) fail(f,'example: title/steps/result',i);
      if (b.type==='callout' && (!['tip','warning','mistake','safety','fact','board'].includes(b.kind) || !b.text)) fail(f,'callout: kind/text',i);
      if (b.type==='checkpoint' && (!Array.isArray(b.items) || !b.items.length)) fail(f,'checkpoint: items',i);
      if (b.type==='bench') {
        const gear=['psu','scope','dmm','awg','lcr'].filter(k=>b[k]!==undefined);
        if (!b.title || !gear.length || gear.some(k=>typeof b[k]!=='string' || !b[k].trim())) fail(f,'bench: title и хотя бы один прибор psu/scope/dmm/awg/lcr (строки)',i);
        for (const key of ['steps','expect'])
          if (!Array.isArray(b[key]) || !b[key].length || b[key].some(x=>typeof x!=='string' || !x.trim())) fail(f,'bench: '+key+' — список строк',i);
        if (b.steps?.length<2) fail(f,'bench: минимум два шага',i);
        if (b.warn!==undefined && typeof b.warn!=='string') fail(f,'bench: warn — строка',i);
      }
      if (['checkpoint','example','quiz','predict'].includes(b.type)) {
        const lists=[b.items,b.steps,b.options].filter(Array.isArray);
        if (lists.some(a=>a.some(x=>typeof x!=='string')) || (Array.isArray(l.objectives) && l.objectives.some(x=>typeof x!=='string'))) fail(f,b.type+': элемент списка не строка (кавычки вокруг «: »)',i);
      }
      if (b.type==='recall' && (!Number.isInteger(b.count) || b.count<1 || b.count>3)) fail(f,'recall: count 1–3',i);
    });
    const quizzes=bs.filter(b=>b.type==='quiz');
    for (const type of ['quiz','figure','checkpoint']) if (!types.includes(type)) fail(f,'нет '+type);
    if (l.kind==='lesson') {
      for (const type of ['example']) if (!types.includes(type)) fail(f,'нет '+type);
      if (bs.filter(b=>b.type==='figure').length<2) fail(f,'нужно минимум два рисунка');
      if (!bs.some(b=>b.type==='callout' && b.kind==='mistake')) fail(f,'нет типичной ошибки');
      if (!quizzes.some(q=>q.question_type==='numeric')) fail(f,'нет numeric');
      if (l.index>0 && !types.includes('recall')) fail(f,'нет recall');
      const sections=l.body.split(/^## /m).slice(1);
      const theory=sections.filter(s=>!s.startsWith('Практика') && !s.startsWith('Попробуй дома') && !s.startsWith('Опыт на стенде'));
      if (theory.length<3 || theory.length>5) fail(f,'нужно 3–5 разделов объяснения');
      for (const section of theory) {
        if (!section.includes('```quiz')) fail(f,'раздел без проверки: '+section.split('\n')[0]);
        const prose=section.replace(/```[\s\S]*?```/g,'');
        if (prose.split(/\s+/).length>170) fail(f,'слишком длинный раздел: '+section.split('\n')[0]);
      }
      const practice=sections.find(s=>s.startsWith('Практика'));
      const count=(practice?.match(/```quiz/g)||[]).length;
      if(count<3 || count>5) fail(f,'нужно 3–5 вопросов практики');
    }
    if (l.kind==='project') {
      let pos=-1;
      for (const title of ['Цель','Что понадобится','Расчёт','Сборка по шагам','Проверка','Если не работает','Безопасность','Идеи развития']) {
        const next=l.body.indexOf('## '+title);
        if(next<=pos) fail(f,'порядок раздела проекта: '+title);
        pos=next;
      }
      if (!types.includes('example') || !bs.some(b=>b.kind==='safety') || !bs.some(b=>b.kind==='mistake') ||
          !quizzes.some(q=>q.question_type==='numeric')) fail(f,'проект: пример, numeric, безопасность, ошибки');
    }
    if(l.kind==='teardown' && (!bs.some(b=>b.name==='board-hotspots') || quizzes.length<5 || quizzes.length>8))
      fail(f,'разбор: board-hotspots и 5–8 вопросов');
  }
  for (const e of c.exams) {
    if(examIds.has(e.id)) fail(e.file,'повтор id экзамена');
    examIds.add(e.id);
    if(!Number.isInteger(e.questions_per_attempt) || e.questions_per_attempt<1 ||
       e.questions?.length<Math.ceil(2.5*e.questions_per_attempt)) fail(e.file,'слишком мал банк вопросов');
    if(!(e.pass_percent>0 && e.pass_percent<=100)) fail(e.file,'порог 1–100');
    const ls=c.topics.find(t=>t.id===e.topic)?.lessons || [];
    for (const [i,q] of (e.questions||[]).entries()) {
      if(ids.has(q.id)) fail(e.file,'повтор id вопроса',i);
      ids.add(q.id); question(q,e.file,i);
      if(!ls.some(l=>l.id===q.lesson) || ![1,2,3].includes(q.difficulty)) fail(e.file,'lesson/difficulty',i);
      if(c.lessonById.get(q.lesson)?.blocks.some(b=>b.question===q.question)) fail(e.file,'дословный повтор вопроса урока',i);
    }
    for(const l of ls) if(e.questions.filter(q=>q.lesson===l.id).length<3) fail(e.file,'меньше 3 вопросов для '+l.id);
  }
  return errors;
}

