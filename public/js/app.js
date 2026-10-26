import {route,startRouter} from './router.js';
import {api} from './api.js';
import {home,topic} from './views/course.js';
import {settings,applySettings} from './views/settings.js';
import {lesson} from './views/lesson.js';
import {exam,attempt} from './views/exam.js';
import {review,glossary,search,summary} from './views/study.js';
for(const [name,view]of Object.entries({'':home,topic,settings,lesson,exam,attempt,review,glossary,search,summary}))route(name,view);
try{applySettings(await api('/settings'));}catch{}
document.addEventListener('course:update',async()=>{try{document.getElementById('review-count').textContent=(await api('/review/queue')).length;}catch{}});
document.querySelector('.skip').onclick=e=>{e.preventDefault();document.getElementById('main').focus();};
startRouter();

