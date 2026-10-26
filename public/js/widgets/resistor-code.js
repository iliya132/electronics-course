import {el} from '../dom.js';
const names=['Чёрный','Коричневый','Красный','Оранжевый','Жёлтый','Зелёный','Синий','Фиолетовый','Серый','Белый'];
const colors=['#111','#80502d','#c52626','#eb7d1c','#e5c834','#2b8b45','#2b58ad','#853e95','#888','#fff'];
export function mount(container){
 const selects=Array.from({length:3},(_,index)=>{
  const select=el('select',{'aria-label':['Первая цифра','Вторая цифра','Множитель'][index]});
  names.forEach((name,value)=>select.append(el('option',{value,text:name+(index===2?' ×10^'+value:' '+value)})));
  select.value=[1,0,2][index];return select;
 });
 const input=el('input',{type:'number',min:10,step:1,value:1000,'aria-label':'Номинал, Ом'}),out=el('output',{'aria-live':'polite'}),image=el('div');
 const draw=()=>{
  const digits=selects.map(s=>Number(s.value)),r=(digits[0]*10+digits[1])*10**digits[2];input.value=r;
  out.textContent=r+' Ом ±5 %. Четвёртая полоса золотая. Значащая первая цифра не должна быть нулём.';
  image.innerHTML='<svg viewBox="0 0 420 100" role="img" aria-label="Цветовые полосы резистора"><path d="M0 50H420" stroke="currentColor"/><rect x="50" y="20" width="320" height="60" rx="20" fill="#e4c99e"/>'+[...digits,0].map((v,i)=>'<rect x="'+(95+i*65)+'" y="20" width="15" height="60" fill="'+(i===3?'#a67c00':colors[v])+'"/>').join('')+'</svg>';
 };
 selects.forEach(s=>{container.append(s);s.onchange=draw;});
 input.onchange=()=>{const r=Number(input.value),p=Math.floor(Math.log10(r))-1,d=Math.round(r/10**p);
  if(p<0||p>9||d<10||d>99||Math.abs(d*10**p-r)>1e-8){out.textContent='Этот номинал не представляется двумя цифрами и множителем 10⁰…10⁹. Например, введи 4700.';return;}
  selects[0].value=Math.floor(d/10);selects[1].value=d%10;selects[2].value=p;draw();
 };
 container.append(el('label',{text:'Обратный перевод: номинал, Ом'},[input]),image,out);draw();
}

