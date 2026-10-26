import { api,act,toast } from '../api.js';
export function applySettings(s){
 if(s.theme&&s.theme!=='system')document.documentElement.dataset.theme=s.theme;else delete document.documentElement.dataset.theme;
 document.documentElement.style.setProperty('--font-size',(s.font_size||18)+'px');
}
export async function settings(root){
 const s=await api('/settings');root.className='reading settings';
 root.innerHTML='<p class="eyebrow">Твоё рабочее место</p><h1>Настройки</h1><label>Оформление<select id="theme"><option value="system">Как в системе</option><option value="light">Светлое</option><option value="dark">Тёмное</option></select></label><label>Размер текста<select id="font">'+[16,18,20,22].map(n=>'<option value="'+n+'">'+n+' px</option>').join('')+'</select></label><button id="save-settings" class="primary">Сохранить</button><div id="backup-settings"></div>';
 root.querySelector('#theme').value=s.theme||'system';root.querySelector('#font').value=s.font_size||18;
 root.querySelector('#save-settings').onclick=act(async()=>{
  const value={theme:root.querySelector('#theme').value,font_size:Number(root.querySelector('#font').value)};
  await api('/settings','PUT',value);applySettings(value);toast('Настройки сохранены');
 });
}

