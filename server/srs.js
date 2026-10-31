export const intervals=[1,3,7,16,35];
export function nextReview(card,correct,now=new Date()) {
 const box=correct?Math.min(card.box+1,5):1;
 const due=new Date(now); due.setUTCDate(due.getUTCDate()+intervals[box-1]);
 return {box,due_at:due.toISOString(),last_reviewed_at:now.toISOString(),lapses:card.lapses+(correct?0:1)};
}
export function addCard(db, id, source, lesson, now = new Date()) {
  const due = new Date(now);
  due.setUTCDate(due.getUTCDate() + intervals[0]);
  db.prepare('INSERT OR IGNORE INTO cards(card_id,source,lesson_id,due_at) VALUES (?,?,?,?)').run(id, source, lesson,
    due.toISOString());
}

