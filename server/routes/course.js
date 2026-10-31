import { Router } from 'express';
import { lessonSummary, examState, progressMap, unlockedLessons } from '../helpers.js';
export function courseRoutes(db, c) {
  const r = Router();
  r.get('/course', (_, res) => {
    const all = progressMap(db);
    const open = unlockedLessons(c, all);
    const topics = c.topics.map(t => {
      const lessons = t.lessons.map(l => ({ ...lessonSummary(db, l, all), locked: !open.has(l.id) }));
      const done = lessons.filter(l => l.status === 'completed').length;
      const attempts = t.exam ?
        db.prepare("SELECT score_percent,passed FROM exam_attempts WHERE exam_id=? AND finished_" +
        "at IS NOT NULL ORDER BY id DESC").all(t.exam) : [];
      return {
        ...t,
        lessons,
        locked: lessons.every(l => l.locked),
        completed: done,
        percent: Math.round(done / lessons.length * 100),
        exam: t.exam ? {
          id: t.exam,
          ...examState(db, c, t.exam, all),
          passed: attempts.some(a => a.passed),
          best: Math.max(0, ...attempts.map(a => a.score_percent))
        } : null
      };
    });
    const lessons = topics.flatMap(t => t.lessons);
    const done = lessons.filter(l => l.status === 'completed').length;
    const passed = topics.filter(t => t.exam?.passed).length;
    const finalPassed = !!db.prepare("SELECT 1 FROM exam_attempts WHERE exam_id='final' AND passed=1").get();
    const remaining = c.exams.length - passed;
    const questionCount = c.exams.reduce((n, e) => n + e.questions.length, 0);
    const finalState = {
      available: remaining === 0 && questionCount >= c.course.final_exam.questions_per_attempt,
      remaining
    };
    const available = lessons.filter(l => !l.locked);
    const next = available.find(l => l.status === 'in_progress') || available.find(l => l.status !== 'completed' &&
      !l.optional) || available.find(l => l.status !== 'completed');
    res.json({
      title: c.course.title,
      topics,
      next,
      completed: done,
      total: lessons.length,
      percent: Math.round((done + passed + Number(finalPassed)) / (lessons.length + c.exams.length + 1) * 100),
      final_exam: {
        ...c.course.final_exam,
        ...finalState,
        passed: finalPassed
      }
    });
  });
  return r;
}
