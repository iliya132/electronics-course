import {el} from '../dom.js';
export function mount(container){
 let shift=0,latched=0;const bit=el('input',{type:'checkbox'}),out=el('output',{'aria-live':'polite'});
 const clock=el('button',{text:'Такт SHCP'}),latch=el('button',{text:'Защёлка STCP'}),reset=el('button',{text:'Сброс модели'});
 const show=()=>out.textContent='Сдвиг: '+shift.toString(2).padStart(8,'0')+'; выходы Q7…Q0: '+latched.toString(2).padStart(8,'0')+' ('+latched+').';
 clock.onclick=()=>{shift=((shift<<1)|Number(bit.checked))&255;show();};latch.onclick=()=>{latched=shift;show();};
 reset.onclick=()=>{shift=latched=0;show();};container.append(el('label',{},[bit,' Вход DS = 1']),el('div',{class:'row wrap'},[clock,latch,reset]),out);show();
}

