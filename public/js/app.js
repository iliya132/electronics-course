import { lesson } from './views/lesson.js';
import { route,startRouter } from './router.js';
import { api } from './api.js';
import { home,topic } from './views/course.js';
import { settings,applySettings } from './views/settings.js';
route('',home);route('topic',topic);route('settings',settings);
route('lesson',lesson);
for(const name of ['review','search','glossary','exam','attempt','summary'])route(name,async root=>{root.textContent='Раздел подключается на следующей фазе.';});
try{applySettings(await api('/settings'));}catch{}
document.addEventListener('course:update',async()=>{try{document.getElementById('review-count').textContent=(await api('/review/queue')).length;}catch{}});
startRouter();


