import {svg,text,escape} from './svg.js';
const step=40;
const path=d=>`<path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>`;
export function schematic(draw,title='Принципиальная схема',{width=480,height=320}={}){
 const parts=[];
 const pos=(x,y)=>[x*step,y*step];
 const addComponent=(x,y,body,label='',rotate=0)=>{const [a,b]=pos(x,y);parts.push(`<g transform="translate(${a} ${b}) rotate(${rotate})">${body}</g>`);if(label)parts.push(text(a,b-24,label,'text-anchor="middle"'));};
 const api={
 wire:(x1,y1,x2,y2)=>{const [a,b]=pos(x1,y1),[c,d]=pos(x2,y2);parts.push(path(`M${a} ${b}H${c}V${d}`));},
 junction:(x,y)=>parts.push(`<circle cx="${x*step}" cy="${y*step}" r="4"/>`),
 label:(x,y,label)=>parts.push(text(x*step,y*step,label)),
 resistor:(x,y,label,rotate=0)=>addComponent(x,y,path('M-40 0H-24V-10H24V10H-24V0M24 0H40'),label,rotate),
 battery:(x,y,label)=>addComponent(x,y,path('M-40 0H-8M-8 -22V22M8 -12V12M8 0H40')+text(-20,-28,'+'),label),
 capacitor:(x,y,label,rotate=0)=>addComponent(x,y,path('M-40 0H-6M-6 -20V20M6 -20V20M6 0H40'),label,rotate),
 inductor:(x,y,label)=>addComponent(x,y,path('M-40 0H-24c0 -20 12 -20 12 0c0 -20 12 -20 12 0c0 -20 12 -20 12 0c0 -20 12 -20 12 0H40'),label),
 diode:(x,y,label,rotate=0)=>addComponent(x,y,path('M-40 0H-12M-12 -16L14 0L-12 16ZM14 -18V18M14 0H40'),label,rotate),
 led:(x,y,label)=>addComponent(x,y,path('M-40 0H-12M-12 -16L14 0L-12 16ZM14 -18V18M14 0H40M0 -24L14 -38M12 -22L26 -36'),label),
 transistorNPN:(x,y,label)=>addComponent(x,y,path('M-40 0H-10M-10 -24V24M-10 -12L20 -28V-40M-10 12L20 28V40M10 18L20 28L7 25'),label),
 mosfetN:(x,y,label)=>addComponent(x,y,path('M-40 0H-16V24M-10 -24V-10M-10 -7V7M-10 10V24M-10 -18H20V-40M-10 18H20V40'),label),
 gnd:(x,y)=>addComponent(x,y,path('M0 0V12M-20 12H20M-12 20H12M-5 28H5')),
 switch:(x,y,label)=>addComponent(x,y,path('M-40 0H-20M-20 0L20 -20M20 0H40'),label),
 mcu:(x,y,label)=>addComponent(x,y,`<rect x="-48" y="-32" width="96" height="64" fill="none" stroke="currentColor"/>`+path('M-72 -16H-48M-72 16H-48M48 -16H72M48 16H72')+text(0,6,label,'text-anchor="middle"'))
 };
 draw(api);return svg(parts.join(''),{width,height,title});
}

