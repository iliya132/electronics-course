import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import MarkdownIt from 'markdown-it';
export const markdown = new MarkdownIt({ html: false, linkify: false, typographer: true });
export const blockTypes = ['quiz','predict','example','figure','widget','callout','recall','checkpoint'];
export function parseLesson(source, file = '') {
  const { data, content } = matter(source);
  const tokens = markdown.parse(content, {});
  const blocks = [];
  let group = [];
  const flush = () => {
    if (group.length) blocks.push({ type: 'html', html: markdown.renderer.render(group, markdown.options, {}) });
    group = [];
  };
  for (const token of tokens) {
    if (token.type === 'fence' && blockTypes.includes(token.info.trim())) {
      flush();
      let payload;
      try { payload = yaml.load(token.content); }
      catch (e) { throw Error(`${file}: блок ${blocks.length+1}: ${e.message}`); }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw Error(`${file}: блок должен быть YAML-объектом`);
      blocks.push({ ...payload, type: token.info.trim(), question_type: payload.type });
    } else {
      if (token.type === 'fence' && !['','js','javascript','cpp','c','json','text','bash','html','css'].includes(token.info.trim()))
        throw Error(`${file}: неизвестный блок ${token.info}`);
      group.push(token);
    }
  }
  flush();
  return { kind: 'lesson', optional: false, ...data, blocks, body: content, file };
}
export function loadContent(root = resolve('.')) {
  const readYaml = p => yaml.load(readFileSync(join(root, 'content', p), 'utf8'));
  const course = readYaml('course.yml');
  if (!Array.isArray(course?.topics) || !course.topics.length) throw Error('content/course.yml: курс пуст');
  const glossary = readYaml('glossary.yml') || [];
  const lessons = [], topics = [], exams = [];
  for (const folder of course.topics) {
    if (!/^[a-z0-9-]+$/.test(folder)) throw Error('Недопустимая папка темы');
    const path = join('topics', folder);
    const topic = { ...readYaml(join(path,'topic.yml')), folder, lessons: [] };
    for (const name of readdirSync(join(root,'content',path)).filter(n => n.endsWith('.md')).sort()) {
      const file = join('content',path,name);
      const lesson = { ...parseLesson(readFileSync(join(root,file),'utf8'), file), topic: topic.id, index: lessons.length };
      lessons.push(lesson); topic.lessons.push(lesson);
    }
    if (readdirSync(join(root,'content',path)).includes('exam.yml')) {
      const exam = { ...readYaml(join(path,'exam.yml')), file: join('content',path,'exam.yml') };
      exams.push(exam); topic.exam = exam.id;
    }
    topics.push(topic);
  }
  return { root, course, topics, lessons, exams, glossary,
    lessonById: new Map(lessons.map(l => [l.id,l])),
    examById: new Map(exams.map(e => [e.id,e])) };
}
export function publicQuestion(q) {
  const { answer, explanation, reveal, hint, ...safe } = q;
  return safe;
}
export function questionType(q) { return q.question_type || q.type; }

