import {el} from '../dom.js';
import {gate} from './math.js';
export function mount(container){
 const a=el('input',{type:'checkbox'}),b=el('input',{type:'checkbox'}),select=el('select',{'aria-label':'Логический элемент'});
 for(const [value,label]of [['AND','И'],['OR','ИЛИ'],['NOT','НЕ A'],['XOR','Исключающее ИЛИ']])select.append(el('option',{value,text:label}));
 const out=el('output',{'aria-live':'polite'}),table=el('table');
 container.append(el('label',{},[a,' A']),el('label',{},[b,' B']),select,out,table);
 const render=()=>{out.textContent='Выход Y = '+Number(gate(a.checked,b.checked,select.value));
 table.innerHTML='<thead><tr><th>A</th><th>B</th><th>Y</th></tr></thead><tbody>'+[0,1].flatMap(x=>[0,1].map(y=>'<tr><td>'+x+'</td><td>'+y+'</td><td>'+Number(gate(!!x,!!y,select.value))+'</td></tr>')).join('')+'</tbody>';};
 for(const input of [a,b,select])input.onchange=render;render();
}

