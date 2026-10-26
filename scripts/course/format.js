export function rows(source){
 return Object.fromEntries(source.trim().split('\n').filter(Boolean).map(line=>{
 const [id,model,concept,check,truth,wrong1,wrong2,diagram,widget]=line.split('|');
 if(!diagram||!wrong2)throw Error('Неполная авторская запись '+id);
 return [id,{model,concept,check,truth,wrong1,wrong2,diagram:diagram.split(';'),widget:widget||undefined}];
 }));
}

