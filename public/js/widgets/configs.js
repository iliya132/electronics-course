import {calculations} from './math.js';
import {chart,number as f} from './controls.js';
const v=(key,label,min,max,step,value)=>[key,label,min,max,step,value];
export const configs={
 'series-parallel':{controls:[v('r1','R1, Ом',10,1000,10,100),v('r2','R2, Ом',10,1000,10,100),v('parallel','Соединение параллельное (выкл. — последовательное)',0,1,1,0)],
 result:(s,o)=>(s.parallel?'R = R1·R2/(R1+R2)':'R = R1+R2')+' = '+f(o.r)+' Ом.',
 graph:s=>chart(r=>calculations['series-parallel']({...s,r2:r}).r,{xmax:1000,ymax:s.parallel?s.r1:s.r1+1000,xlabel:'R2, Ом',ylabel:'R, Ом'})},
 divider:{controls:[v('u','Вход, В',0,12,.1,5),v('r1','R1 сверху, кОм',1,100,1,10),v('r2','R2 снизу, кОм',1,100,1,10)],
 result:(s,o)=>'Uвых = '+f(s.u)+' × '+s.r2+' / ('+s.r1+' + '+s.r2+') = '+f(o.v)+' В. Без нагрузки.',
 graph:s=>chart(r=>s.u*r/(s.r1+r),{xmax:100,ymax:Math.max(1,s.u),xlabel:'R2, кОм',ylabel:'Uвых, В'})},
 'led-resistor':{controls:[v('u','Питание, В',3,12,.1,5),v('vf','Падение LED, В',1.6,3.2,.1,2),v('i','Желаемый ток, мА',1,20,1,10)],
 result:(s,o)=>s.u<=s.vf?'Питание не выше Vf: такой расчёт для свечения не подходит.':'R = (U−Vf)/I = '+f(o.r)+' Ом. E12 вверх: '+f(o.chosen)+' Ом; ток '+f(o.current)+' мА; P = '+f(o.p)+' Вт. Выбирай мощность с запасом.',
 graph:s=>chart(u=>Math.max(0,u-s.vf)/Math.max(1,calculations['led-resistor'](s).chosen)*1000,{xmax:12,ymax:100,xlabel:'Uпит, В',ylabel:'I, мА'})},
 'pwm-duty':{controls:[v('u','Высокий уровень, В',1,5,.1,5),v('d','Коэффициент заполнения D, %',0,100,1,50)],
 result:(s,o)=>'Uср = U·D = '+s.u+' × '+s.d+'/100 = '+f(o.v)+' В. Скважность T/tимп = '+(s.d?f(100/s.d):'∞')+'.',
 graph:(s,o)=>chart(t=>t%1<s.d/100?s.u:0,{xmax:2,ymax:5,second:()=>o.v})},
 'rc-filter':{controls:[v('r','R, кОм',.1,100,.1,1),v('c','C, нФ',1,1000,1,100)],
 result:(s,o)=>'fc = 1/(2πRC) = '+f(o.fc)+' Гц. При fc усиление −3,01 дБ; дальше около −20 дБ/дек.',
 graph:()=>chart(x=>-10*Math.log10(1+10**(2*x)),{xmax:3,ymin:-60,ymax:0,xlabel:'log10(f/fc)',ylabel:'K, дБ'})},
 ripple:{controls:[v('i','Ток нагрузки, А',.01,1,.01,.1),v('f','Частота пульсаций, Гц',50,200,50,100),v('c','Ёмкость, мкФ',100,10000,100,1000)],
 result:(s,o)=>'ΔU ≈ I/(fпульс·C) = '+f(o.ripple)+' В. Для моста fпульс = 2fсети. Модель малых пульсаций; зарядные импульсы не учтены.',
 graph:(s,o)=>chart(t=>Math.max(0,10-o.ripple*(t*s.f%1)),{xmax:4/s.f,ymax:10,xlabel:'t, с'})},
 lm317:{controls:[v('r1','R1, Ом',120,240,10,240),v('r2','R2, Ом',0,2400,10,720)],
 result:(s,o)=>'Uвых ≈ 1,25·(1 + '+s.r2+'/'+s.r1+') = '+f(o.v)+' В. Без тока ADJ; нужен запас входного напряжения.',
 graph:s=>chart(r=>1.25*(1+r/s.r1),{xmax:2400,ymax:30,xlabel:'R2, Ом',ylabel:'Uвых, В'})},
 'buck-converter':{controls:[v('u','Вход, В',5,24,1,12),v('d','Заполнение D, %',5,95,1,50),v('l','Индуктивность, мкГн',10,1000,10,100),v('f','Частота, кГц',20,500,10,100)],
 result:(s,o)=>'Идеальный buck, непрерывный ток: Uвых = Uвх·D = '+f(o.v)+' В; ΔI = (Uвх−Uвых)·D/(Lf) = '+f(o.delta)+' А.',
 graph:(s,o)=>chart(t=>{const x=t%1,d=s.d/100;return x<d?o.delta*x/d:o.delta*(1-(x-d)/(1-d));},{xmax:2,ymax:Math.max(.01,o.delta),ylabel:'ΔI, А'})},
 'opamp-gain':{controls:[v('rf','Rf, кОм',0,100,1,10),v('rg','Rg, кОм',1,100,1,10),v('u','Вход, В',0,2,.01,.1),v('supply','Верхний предел выхода модели, В',1,12,.1,3.3)],
 result:(s,o)=>'K = 1+Rf/Rg = '+f(o.gain)+'; K·Uвх = '+f(o.raw)+' В; выход '+f(o.v)+' В.'+(o.raw>s.supply?' Ограничение выходного сигнала!':'')+' У реального ОУ проверь диапазоны входа и выхода.',
 graph:(s,o)=>chart(t=>Math.min(s.supply,Math.max(0,s.u*o.gain*(1+Math.sin(t*Math.PI*2))/2)),{xmax:2,ymax:s.supply,second:t=>s.u*(1+Math.sin(t*Math.PI*2))/2})},
 'adc-quantizer':{controls:[v('n','Разрядность, бит',2,12,1,10),v('ref','Uref, В',1,5,.1,5),v('u','Вход, В',0,5,.01,2.5)],
 result:(s,o)=>'LSB = Uref/2ⁿ = '+f(o.lsb*1000)+' мВ; код = '+o.code+'; код·LSB = '+f(o.v)+' В; разность '+f(o.error*1000)+' мВ.'+(s.u>s.ref?' Вход за диапазоном — в реальной схеме недопустимо.':''),
 graph:(s,o)=>chart(u=>calculations['adc-quantizer']({...s,u}).v,{xmax:s.ref,ymax:s.ref,xlabel:'Uвх, В',ylabel:'Код·LSB, В'})},
 'timer-555':{controls:[v('r1','R1, кОм',1,100,1,10),v('r2','R2, кОм',1,100,1,68),v('c','C, мкФ',.1,100,.1,10)],
 result:(s,o)=>'f = 1/[ln(2)·(R1+2R2)·C] = '+f(o.f)+' Гц; D = (R1+R2)/(R1+2R2) = '+f(o.d)+' %. Без диода D > 50 %.',
 graph:(s,o)=>chart(t=>t%1<o.d/100?5:0,{xmax:2,ymax:5})}
};

