export function applyTerms(root,terms,ids){
 const used=new Set(),allowed=terms.filter(t=>ids.includes(t.id)).sort((a,b)=>b.term.length-a.term.length);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())if(walker.currentNode.parentElement.closest('.prose'))nodes.push(walker.currentNode);
 for(const node of nodes){
  if(node.parentElement.closest('a,abbr,code,pre,h1,h2,h3'))continue;
  let remaining=node.textContent,changed=false;const fragment=document.createDocumentFragment();
  while(remaining){
   const match=allowed.filter(t=>!used.has(t.id)).map(t=>({t,i:remaining.toLocaleLowerCase('ru').indexOf(t.term.toLocaleLowerCase('ru'))}))
    .filter(m=>m.i>=0).sort((a,b)=>a.i-b.i)[0];
   if(!match){fragment.append(remaining);break;}
   fragment.append(remaining.slice(0,match.i));const abbr=document.createElement('abbr');abbr.className='term';abbr.tabIndex=0;abbr.title=match.t.definition;abbr.setAttribute('aria-label',match.t.term+': '+match.t.definition);
   abbr.textContent=remaining.slice(match.i,match.i+match.t.term.length);fragment.append(abbr);
   remaining=remaining.slice(match.i+match.t.term.length);used.add(match.t.id);changed=true;
  }
  if(changed)node.replaceWith(fragment);
 }
}

