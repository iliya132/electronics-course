import {el} from '../dom.js';
export function mount(container){
 container.append(el('p',{text:'Классический ESP32-WROOM. Сверь маркировку своей платы; у S2/S3/C3 другая распиновка.'}));
 const select=el('select',{'aria-label':'Вывод GPIO'});
 for(const pin of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33,34,35,36,39])select.append(el('option',{value:pin,text:'GPIO'+pin}));
 const out=el('output',{'aria-live':'polite'});
 const show=()=>{const pin=Number(select.value);out.textContent=(pin>=6&&pin<=11?'Подключён к flash: не использовать.':pin>=34?'Только вход, внутренней подтяжки нет.':[0,2,5,12,15].includes(pin)?'Strapping: состояние при сбросе влияет на загрузку.':[1,3].includes(pin)?'UART0: используется для загрузки и консоли.':'Обычный GPIO; проверь функции периферии.')+' Уровни 3,3 В. 5 В подавать нельзя.';};
 select.onchange=show;container.append(select,out);show();
}

