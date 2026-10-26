import {el} from '../dom.js';
import {controls} from './controls.js';
import {configs} from './configs.js';
import {calculations} from './math.js';
export function mountAnalog(name,container,params={}){
 const cfg=configs[name],out=el('output',{'aria-live':'polite'}),graph=el('div');
 const render=state=>{const values=calculations[name](state);out.textContent=cfg.result(state,values);graph.innerHTML=cfg.graph(state,values);};
 const state=controls(container,cfg.controls,params,render);container.append(out,graph);render(state);
}

