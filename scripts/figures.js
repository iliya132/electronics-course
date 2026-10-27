import {readdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
// npm run figures            — пересоздать все рисунки
// node scripts/figures.js id — только рисунки урока id (можно несколько id)
const only=process.argv.slice(2);
for(const file of readdirSync('scripts/figures').filter(f=>f.endsWith('.js')).sort()){
 if(only.length&&!only.includes(file.replace(/\.js$/,'')))continue;
 const module=await import(pathToFileURL(resolve('scripts/figures',file)));
 await module.generate();
}
console.log('SVG пересозданы по исходным формулам и сетке.');
