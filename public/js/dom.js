export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function el(tag,attrs={},children=[]){
 const node=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(k==='text')node.textContent=v;else if(k==='html')node.innerHTML=v;else if(k.startsWith('on'))node.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)node.setAttribute(k,v===true?'':v);}
 for(const child of children)node.append(child);return node;
}
export function progressBar(percent){return '<div class="progress" role="progressbar" aria-label="Прогресс" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><span style="width:'+percent+'%"></span></div>';}
export const icon=name=>'<img class="lesson-icon" src="/icons/'+esc(name)+'.svg" alt="">';
export const statusName={not_started:'Не начат',in_progress:'В процессе',completed:'Завершён'};
export function lessonRow(l){return '<a class="lesson-row" href="#/lesson/'+esc(l.id)+'">'+icon(l.icon)+'<span class="details"><strong>'+esc(l.title)+'</strong> '+(l.optional?'<span class="badge">Дополнительно</span>':'')+'<small>'+esc(l.summary)+'</small></span><span class="time">'+l.minutes+' мин<br><span class="'+(l.status==='completed'?'complete':'muted')+'">'+statusName[l.status]+'</span></span></a>';}

