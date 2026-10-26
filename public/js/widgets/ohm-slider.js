import {el} from '../dom.js';
import {controls,chart,number as f} from './controls.js';
export function mount(container,params={}){
 const out=el('output',{'aria-live':'polite'}),graph=el('div'),flow=el('div',{class:'current-flow','aria-hidden':'true'});
 flow.innerHTML='<svg viewBox="0 0 480 50"><path d="M20 25H460" stroke="currentColor" fill="none"/><circle cx="20" cy="25" r="6" fill="var(--accent)" class="charge-dot"/></svg>';
 const render=s=>{const i=s.u/s.r*1000,p=s.u*s.u/s.r;out.textContent='I = '+f(s.u)+' В / '+f(s.r)+' Ом = '+f(i)+' мА; P = U²/R = '+f(p)+' Вт.';
  flow.style.setProperty('--flow-time',Math.max(.4,8/(i/10+1))+'s');flow.classList.toggle('stopped',i===0);
  graph.innerHTML=chart(u=>1000*u/s.r,{xmax:12,ymax:12000/s.r,xlabel:'U, В',ylabel:'I, мА'});};
 const state=controls(container,[['u','Напряжение, В',0,12,.1,5],['r','Сопротивление, Ом',10,1000,10,100]],params,render);
 container.append(out,flow,el('p',{class:'muted',text:'Скорость точек условно показывает величину тока; это не реальная скорость электронов.'}),graph);render(state);
}
