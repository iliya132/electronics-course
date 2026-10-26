import { check } from './helpers.js';
export const tables=['lesson_progress','block_answers','exam_attempts','exam_answers','cards','notes','activity','settings'];
export function exportProgress(db){
 return {version:1,exported_at:new Date().toISOString(),tables:Object.fromEntries(tables.map(t=>[t,db.prepare('SELECT * FROM '+t).all()]))};
}
export function importProgress(db,c,data){
 check(data?.version===1&&data.tables&&typeof data.tables==='object','Неверный формат резервной копии');
 for(const t of tables){
  check(Array.isArray(data.tables[t])&&data.tables[t].length<=100000,'Неверная таблица '+t);
  const columns=db.prepare('PRAGMA table_info('+t+')').all().map(col=>col.name);
  for(const row of data.tables[t]){
   check(row&&typeof row==='object'&&!Array.isArray(row)&&
    Object.keys(row).length===columns.length&&columns.every(k=>Object.hasOwn(row,k)),'Неверные поля '+t);
   check(Object.values(row).every(v=>v===null||typeof v==='string'||typeof v==='number'),'Неверные значения '+t);
   if(row.lesson_id)check(c.lessonById.has(row.lesson_id),'Неизвестный урок '+row.lesson_id);
   if(row.answer_json!=null){try{JSON.parse(row.answer_json);}catch{check(false,'Невалидный JSON ответа');}}
   if(t==='lesson_progress')check(['not_started','in_progress','completed'].includes(row.status)&&row.scroll_pos>=0&&row.time_spent_sec>=0,'Неверный прогресс');
   if(t==='cards')check(['flashcard','quiz','exam'].includes(row.source)&&Number.isInteger(row.box)&&row.box>=1&&row.box<=5&&Number.isFinite(Date.parse(row.due_at))&&row.lapses>=0,'Неверная карточка');
   if(t==='exam_attempts'){
    const e=row.exam_id==='final'?{questions:c.exams.flatMap(e=>e.questions)}:c.examById.get(row.exam_id);
    check(e,'Неизвестный экзамен');
    let refs;try{refs=JSON.parse(row.question_ids_json);}catch{check(false,'Неверный набор вопросов');}
    check(Array.isArray(refs)&&refs.length>0&&new Set(refs.map(r=>r.id)).size===refs.length,'Неверный набор вопросов');
    for(const ref of refs){
     const q=e.questions.find(q=>q.id===ref.id);check(q,'Вопрос отсутствует в банке');
     if(q.options)check(Array.isArray(ref.order)&&ref.order.length===q.options.length&&
      new Set(ref.order).size===q.options.length&&ref.order.every(i=>Number.isInteger(i)&&i>=0&&i<q.options.length),'Неверная перестановка');
    }
   }
   if(t==='settings')check(['theme','font_size'].includes(row.key),'Неизвестная настройка');
  }
 }
 db.transaction(()=>{
  for(const t of [...tables].reverse())db.prepare('DELETE FROM '+t).run();
  for(const t of tables){
   const columns=db.prepare('PRAGMA table_info('+t+')').all().map(col=>col.name);
   const insert=db.prepare('INSERT INTO '+t+' ('+columns.join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')');
   for(const row of data.tables[t])insert.run(...columns.map(k=>row[k]));
  }
 })();
}

