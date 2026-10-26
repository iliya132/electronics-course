import {openDb} from '../server/db.js';
import {loadContent} from '../server/content.js';
import {createApp} from '../server/app.js';
import {resolve} from 'node:path';
const c=loadContent(),db=openDb(resolve('data/browser-qa.sqlite'));
for(const l of c.topics[0].lessons)db.prepare("INSERT OR IGNORE INTO lesson_progress(lesson_id,status) VALUES (?,'completed')").run(l.id);
const server=createApp(db,c).listen(3003,'127.0.0.1',()=>console.log('QA: http://localhost:3003'));
process.on('SIGINT',()=>server.close(()=>{db.close();process.exit(0);}));

