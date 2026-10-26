function wordIndex(text,term){
 const hay=text.toLocaleLowerCase('ru'),needle=term.toLocaleLowerCase('ru');
 let at=hay.indexOf(needle);
 while(at>=0){
  const before=hay[at-1]||'',after=hay[at+needle.length]||'';
  if(!/[\p{L}\p{N}_]/u.test(before)&&!/[\p{L}\p{N}_]/u.test(after))return at;
  at=hay.indexOf(needle,at+1);
 }return -1;
}
export function applyTerms(root, terms, ids) {
  const used = new Set();
  const allowed = terms.filter(t => ids.includes(t.id)).sort((a, b) => b.term.length - a.term.length);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.parentElement.closest('.prose')) {
      nodes.push(walker.currentNode);
    }
  }
  for (const node of nodes) {
    if (node.parentElement.closest('a,abbr,code,pre,h1,h2,h3')) {
      continue;
    }
    let remaining = node.textContent;
    let changed = false;
    const fragment = document.createDocumentFragment();
    while (remaining) {
      const match = allowed.filter(t => !used.has(t.id)).map(t => ({
        t,
        i: wordIndex(remaining, t.term)
      })).filter(m => m.i >= 0).sort((a, b) => a.i - b.i)[0];
      if (!match) {
        fragment.append(remaining);
        break;
      }
      fragment.append(remaining.slice(0, match.i));
      const abbr = document.createElement('abbr');
      abbr.className = 'term';
      abbr.tabIndex = 0;
      abbr.dataset.definition = match.t.definition;
      abbr.setAttribute('aria-label', match.t.term + ': ' + match.t.definition);
      const position = () => {
        const rect = abbr.getBoundingClientRect();
        const width = Math.min(300, innerWidth * .8);
        const left = Math.max(8 - rect.left, Math.min(0, innerWidth - 8 - rect.left - width));
        abbr.style.setProperty('--tooltip-left', left + 'px');
      };
      abbr.addEventListener('mouseenter', position);
      abbr.addEventListener('focus', position);
      abbr.addEventListener('click', () => abbr.focus());
      abbr.textContent = remaining.slice(match.i, match.i + match.t.term.length);
      fragment.append(abbr);
      remaining = remaining.slice(match.i + match.t.term.length);
      used.add(match.t.id);
      changed = true;
    }
    if (changed) {
      node.replaceWith(fragment);
    }
  }
}

