import { route,startRouter } from './router.js';
import { api } from './api.js';
import { home,topic } from './views/course.js';
import { settings,applySettings } from './views/settings.js';
route('',home);route('topic',topic);route('settings',settings);
route('lesson',async(root,id)=>{const l=await api('/lessons/'+id);root.innerHTML='<p class="eyebrow">Урок</p>';const h=document.createElement('h1');h.textContent=l.title;root.append(h);});
for(const name of ['review','search','glossary','exam','attempt','summary'])route(name,async root=>{root.textContent='Раздел подключается на следующей фазе.';});
try{applySettings(await api('/settings'));}catch{}
document.addEventListener('course:update',async()=>{try{document.getElementById('review-count').textContent=(await api('/review/queue')).length;}catch{}});
startRouter();

