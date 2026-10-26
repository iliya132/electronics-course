import {readdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
for(const file of readdirSync('scripts/figures').filter(f=>f.endsWith('.js')).sort()){
 const module=await import(pathToFileURL(resolve('scripts/figures',file)));
 await module.generate();
}
console.log('SVG пересозданы по исходным формулам и сетке.');

