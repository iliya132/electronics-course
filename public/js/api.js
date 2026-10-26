export async function api(path,method='GET',body){
 const res=await fetch('/api'+path,{method,headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await res.json();if(!res.ok)throw Error(data.error||'Ошибка запроса');return data;
}
export function toast(message){document.getElementById('status').textContent=message;clearTimeout(toast.timer);toast.timer=setTimeout(()=>document.getElementById('status').textContent='',6000);}
export function act(fn){return async(...args)=>{try{await fn(...args);}catch(e){toast(e.message);}};}

