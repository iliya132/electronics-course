import { Router } from 'express';
import { lessonSummary, examState } from '../helpers.js';
export function courseRoutes(db,c) {
 const r=Router();
 r.get('/course',(_,res)=>{
  const topics=c.topics.map(t=>{
   const lessons=t.lessons.map(l=>lessonSummary(db,l)),done=lessons.filter(l=>l.status==='completed').length;
   const attempts=t.exam?db.prepare('SELECT score_percent,passed FROM exam_attempts WHERE exam_id=? AND finished_at IS NOT NULL ORDER BY id DESC').all(t.exam):[];
   return {...t,lessons,completed:done,percent:Math.round(done/lessons.length*100),
    exam:t.exam?{id:t.exam,...examState(db,c,t.exam),passed:attempts.some(a=>a.passed),best:Math.max(0,...attempts.map(a=>a.score_percent))}:null};
  });
  const lessons=topics.flatMap(t=>t.lessons),done=lessons.filter(l=>l.status==='completed').length;
  const passed=topics.filter(t=>t.exam?.passed).length,finalPassed=!!db.prepare("SELECT 1 FROM exam_attempts WHERE exam_id='final' AND passed=1").get();
  const next=lessons.find(l=>l.status==='in_progress')||lessons.find(l=>l.status!=='completed'&&!l.optional)||lessons.find(l=>l.status!=='completed');
  res.json({title:c.course.title,topics,next,completed:done,total:lessons.length,
   percent:Math.round((done+passed+Number(finalPassed))/(lessons.length+c.exams.length+1)*100),
   final_exam:{...c.course.final_exam,...examState(db,c,'final'),passed:finalPassed}});
 });
 return r;
}

