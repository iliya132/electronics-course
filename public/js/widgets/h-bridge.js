import {el} from '../dom.js';
import {bridgeState} from './math.js';
export function mount(container){
 const inputs=['A: верхний левый','B: верхний правый','C: нижний левый','D: нижний правый'].map(label=>{
  const input=el('input',{type:'checkbox'});container.append(el('label',{},[input,' '+label]));return input;
 });
 const out=el('output',{'aria-live':'polite'}),drawing=el('div');container.append(drawing,out);
 const labels={short:'Опасно: сквозной ток! Два ключа одной стойки включены.',forward:'Вращение вперёд: A + D.',reverse:'Вращение назад: B + C.',brake:'Торможение: выводы мотора на одном потенциале.',coast:'Свободный ход или неполная цепь.'};
 const render=()=>{const state=bridgeState(...inputs.map(i=>i.checked));out.textContent=labels[state];out.style.color=state==='short'?'var(--bad)':'var(--text)';
 drawing.innerHTML='<svg viewBox="0 0 400 240" role="img" aria-label="H-мост"><g fill="none" stroke="currentColor"><path d="M70 30H330M70 210H330M100 120H300"/>'+['M100 30V120','M300 30V120','M100 120V210','M300 120V210'].map((d,i)=>
  '<path d="'+d+'" stroke="'+(inputs[i].checked?(state==='short'?'var(--bad)':'var(--accent)'):'currentColor')+
  '" stroke-width="4" opacity="'+(inputs[i].checked?1:.35)+'"/>').join('')+'<circle cx="200" cy="120" r="27"/></g><g fill="currentColor" text-anchor="middle" font-size="20"><text x="200" y="127">M</text><text x="200" y="20">+U</text><text x="200" y="235">GND</text>'+inputs.map((s,i)=>'<text x="'+(i%2?330:70)+'" y="'+(i<2?75:180)+'">'+['A','B','C','D'][i]+(s.checked?' ●':' ○')+'</text>').join('')+'</g></svg>';};
 inputs.forEach(i=>i.onchange=render);render();
}

