import { el,esc } from '../dom.js';
export const number=n=>Number(n.toPrecision(5)).toLocaleString('ru-RU',{maximumFractionDigits:5});
export function chart(fn,{xmax=1,ymin=0,ymax=1,xlabel='t / T',ylabel='U, В',second}={}){
 const w=480,h=240,p=46,X=x=>p+x/xmax*(w-2*p),Y=y=>h-p-(y-ymin)/(ymax-ymin)*(h-2*p);
 const curve=f=>Array.from({length:241},(_,i)=>{const x=i*xmax/240;return X(x).toFixed(2)+','+Y(Math.max(ymin,Math.min(ymax,f(x)))).toFixed(2);}).join(' ');
 let grid='';
 for(let i=0;i<=4;i++){const x=i*xmax/4,y=ymin+i*(ymax-ymin)/4;
  grid+='<text x="'+X(x)+'" y="'+(h-p+20)+'" text-anchor="middle">'+number(x)+'</text><text x="'+(p-7)+'" y="'+(Y(y)+5)+'" text-anchor="end">'+number(y)+'</text>';}
 return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(ylabel+' по '+xlabel)+'"><g fill="currentColor" font-size="14" font-family="system-ui">'+grid+'<text x="240" y="235" text-anchor="middle">'+esc(xlabel)+'</text><text x="8" y="18">'+esc(ylabel)+'</text></g><path d="M'+p+' '+p+'V'+(h-p)+'H'+(w-p)+'" fill="none" stroke="currentColor"/><polyline points="'+curve(fn)+'" fill="none" stroke="var(--accent)" stroke-width="2.5"/>'+(second?'<polyline points="'+curve(second)+'" fill="none" stroke="currentColor" stroke-dasharray="5 4"/>':'')+'</svg>';
}
export function controls(container,spec,initial,onChange){
 const state={},form=el('div',{class:'widget-controls'});
 for(const [key,label,min,max,step,value]of spec){
  state[key]=initial[key]??value;const output=el('span',{text:String(state[key])});
  const input=el('input',{type:'range',min,max,step,value:state[key],'aria-label':label});
  const lab=el('label',{},[el('span',{text:label+' · '}),output,input]);
  input.oninput=()=>{state[key]=Number(input.value);output.textContent=number(state[key]);onChange(state);};
  form.append(lab);
 }
 container.append(form);return state;
}

