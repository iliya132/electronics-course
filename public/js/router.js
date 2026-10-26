const routes=new Map();let cleanup=null,revision=0;
export function route(name,render){routes.set(name,render);}
export async function navigate(){
 const version=++revision;if(cleanup){cleanup();cleanup=null;}
 document.getElementById('reading-progress').style.width='0';
 const [name='',id]=location.hash.replace(/^#\/?/,'').split('/');
 const main=document.getElementById('main');main.innerHTML='<p class="muted">Загрузка…</p>';
 try{
  const render=routes.get(name);if(!render)throw Error('Страница не найдена');
  const container=document.createElement('div');
  const dispose=await render(container,id);
  if(version!==revision){dispose?.();return;}
  main.replaceChildren(container);cleanup=dispose;window.scrollTo(0,0);main.focus({preventScroll:true});
  document.querySelectorAll('.topbar nav a').forEach(a=>a.classList.toggle('active',a.hash==='#/'+name));
  document.dispatchEvent(new Event('course:update'));
  document.dispatchEvent(new Event('route:ready'));
 }catch(e){main.textContent=e.message;}
}
export function startRouter(){window.addEventListener('hashchange',navigate);navigate();}

