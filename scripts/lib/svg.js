export const escape=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const text=(x,y,label,attrs='')=>`<text x="${x}" y="${y}" ${attrs}>${escape(label)}</text>`;
export const line=(x1,y1,x2,y2,attrs='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`;
export const arrow=(x1,y1,x2,y2)=>line(x1,y1,x2,y2,'stroke="currentColor" stroke-width="2" marker-end="url(#arrow)"');
export function svg(body,{width=480,height=300,title='Учебная схема'}={}){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img">
 <title>${escape(title)}</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="currentColor"/></marker></defs>
 <g font-family="system-ui" font-size="18" fill="currentColor" stroke="none">${body}</g></svg>`;
}
export function blocks(labels,title='Блок-схема'){
 const width=480,pad=24,w=width-2*pad,h=52,gap=32,height=labels.length*(h+gap)+24;
 const body=labels.map((label,i)=>{const y=16+i*(h+gap);return `<rect x="${pad}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="currentColor"/>`+
 text(width/2,y+32,label,'text-anchor="middle"')+(i<labels.length-1?arrow(width/2,y+h,width/2,y+h+gap-6):'');}).join('');
 return svg(body,{width,height,title});
}

