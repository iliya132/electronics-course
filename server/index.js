import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
import { openDb } from './db.js';
import { loadContent } from './content.js';
import { createApp } from './app.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const db=openDb(resolve(root,process.env.DB_PATH||'data/app.sqlite'));
const app=createApp(db,loadContent(root));
const port=Number(process.env.PORT||3000);
const server=app.listen(port,'127.0.0.1');
server.on('listening',()=>console.log('Курс: http://localhost:'+port));
server.on('error',e=>{console.error(e.message);db.close();process.exitCode=1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));

