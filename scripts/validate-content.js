import { loadContent } from '../server/content.js';
import { validateContent } from './lib/validate.js';
try {
 const c=loadContent(); const errors=validateContent(c);
 if(errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
 else console.log(`OK: ${c.topics.length} тем, ${c.lessons.length} уроков, ${c.exams.length} экзаменов`);
} catch(e) { console.error(e.message); process.exitCode=1; }

