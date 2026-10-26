import {el} from '../dom.js';
import {controls,chart,number as f} from './controls.js';
export function mount(container,params={}){
 const out=el('output',{'aria-live':'polite'}),graph=el('div');
 const render=s=>{const tau=s.r*s.c*.001;out.textContent='τ = R·C = '+f(tau)+' с. U = 5·'+(s.discharge?'exp(−t/τ)':'(1−exp(−t/τ))')+' В.';
  graph.innerHTML=chart(t=>5*(s.discharge?Math.exp(-t/tau):1-Math.exp(-t/tau)),{xmax:5*tau,ymax:5,xlabel:'t, с'});};
 const state=controls(container,[['r','R, кОм',1,100,1,10],['c','C, мкФ',1,1000,1,100]],params,render);state.discharge=0;
 const charge=el('button',{text:'Заряд'}),discharge=el('button',{text:'Разряд'});
 const change=value=>{state.discharge=value;charge.setAttribute('aria-pressed',String(!value));discharge.setAttribute('aria-pressed',String(!!value));render(state);};
 charge.onclick=()=>change(0);discharge.onclick=()=>change(1);container.append(el('div',{class:'row'},[charge,discharge]),out,graph);change(0);
}
