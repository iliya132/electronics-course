import {el} from '../dom.js';
export function mount(container){
 const input=el('input',{type:'range',min:0,max:255,value:165,'aria-label':'Число 0–255'}),out=el('output');
 const render=()=>{const n=Number(input.value);out.textContent=n+' = 0x'+n.toString(16).toUpperCase().padStart(2,'0')+' = '+n.toString(2).padStart(8,'0')+'₂';};
 container.append(el('label',{text:'Восемь бит: 0…255'},[input]),out);input.oninput=render;render();
}

