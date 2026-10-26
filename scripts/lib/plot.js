import {svg,text,line} from './svg.js';
export function plot({fn,xRange,yRange,xLabel,yLabel,title='',markers=[],series=[]}){
 const width=480,height=340,left=70,right=20,top=44,bottom=70;
 const X=x=>left+(x-xRange[0])/(xRange[1]-xRange[0])*(width-left-right);
 const Y=y=>height-bottom-(y-yRange[0])/(yRange[1]-yRange[0])*(height-top-bottom);
 let body=text(width/2,24,title,'text-anchor="middle"')+text(width/2,height-12,xLabel,'text-anchor="middle"')+text(8,52,yLabel);
 for(let i=0;i<=4;i++){
  const x=xRange[0]+i*(xRange[1]-xRange[0])/4,y=yRange[0]+i*(yRange[1]-yRange[0])/4;
  body+=line(X(x),top,X(x),height-bottom,'stroke="currentColor" opacity=".18"')+
   line(left,Y(y),width-right,Y(y),'stroke="currentColor" opacity=".18"')+
   text(X(x),height-bottom+25,Number(x.toPrecision(3)),'text-anchor="middle"')+
   text(left-10,Y(y)+5,Number(y.toPrecision(3)),'text-anchor="end"');
 }
 body+=line(left,top,left,height-bottom,'stroke="currentColor"')+line(left,height-bottom,width-right,height-bottom,'stroke="currentColor"');
 [{fn,label:'',dash:''},...series].forEach((s,i)=>{
  const points=Array.from({length:201},(_,j)=>{
   const x=xRange[0]+j*(xRange[1]-xRange[0])/200,y=s.fn(x);
   return X(x).toFixed(2)+','+Y(Math.max(yRange[0],Math.min(yRange[1],y))).toFixed(2);
  }).join(' ');
  body+=`<polyline points="${points}" fill="none" stroke="var(--accent, #2457d6)" stroke-width="2.5" stroke-dasharray="${s.dash||''}"/>`;
  if(s.label)body+=text(left+10,top+22+i*22,s.label);
 });
 for(const m of markers)body+=`<circle cx="${X(m.x)}" cy="${Y(m.y)}" r="4" fill="currentColor"/>`+text(X(m.x)+8,Y(m.y)-10,m.label);
 return svg(body,{width,height,title});
}

