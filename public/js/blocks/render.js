import { el,esc } from '../dom.js';
import { mountQuiz } from './quiz.js';
const calloutNames={tip:'Совет',warning:'Внимание',mistake:'Типичная ошибка',safety:'Безопасность',fact:'Факт',board:'Где это на плате'};
const benchGear=[['psu','Блок питания WANPTEK TPS3010'],['scope','Осциллограф Rigol DHO804'],['dmm','Мультиметр Rigol DM858E'],['awg','Генератор OWON DGE2070'],['lcr','Тестер LCR-P1']];
const format=text=>esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
export async function renderBlock(root, b, context) {
  if (b.type === 'html') {
    root.append(el('div', {
      class: 'prose',
      html: b.html
    }));
    return;
  }
  if (['quiz', 'predict'].includes(b.type)) {
    mountQuiz(root, b, {
      ...context,
      saved: context.answers.find(a => a.block_id === b.id)
    });
    return;
  }
  if (b.type === 'callout') {
    root.append(el('aside', {
      class: 'callout ' + b.kind,
      html: '<strong>' + calloutNames[b.kind] + '</strong><p>' + format(b.text) + '</p>'
    }));
    return;
  }
  if (b.type === 'checkpoint') {
    root.append(el('section', {
      class: 'checkpoint',
      html: '<h3>Если запомнишь одно…</h3><ul>' + b.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>'
    }));
    return;
  }
  if (b.type === 'bench') {
    const gear = benchGear.filter(([key]) => b[key]);
    const rows = gear.map(([key, name]) => '<div class="bench-device ' + key + '"><span>' + name + '</span><p>' + format(b[key]) + '</p></div>').join('');
    const list = items => items.map(i => '<li>' + format(i) + '</li>').join('');
    root.append(el('section', {
      class: 'bench',
      html: '<h3>' + esc(b.title) + '</h3><div class="bench-devices">' + rows + '</div>' +
        (b.warn ? '<p class="bench-warn">' + format(b.warn) + '</p>' : '') +
        '<ol>' + list(b.steps) + '</ol>' +
        '<details class="bench-expect"><summary>Что должно получиться</summary><ul>' + list(b.expect) + '</ul></details>'
    }));
    return;
  }
  if (b.type === 'example') {
    let step = 0;
    const list = el('ol');
    const result = el('p', {
      text: 'Результат: ' + b.result,
      hidden: true
    });
    const button = el('button', {
      type: 'button',
      text: 'Следующий шаг'
    });
    button.onclick = () => {
      if (step < b.steps.length) {
        list.append(el('li', {
          text: typeof b.steps[step] === 'object' ? Object.entries(b.steps[step]).map(([k, v]) => k + ': ' +
            v).join(' ') : b.steps[step]
        }));
      }
      step++;
      if (step === b.steps.length) {
        button.hidden = true;
        result.hidden = false;
      }
    };
    root.append(el('section', {
      class: 'example'
    }, [el('h3', {
      text: b.title
    }), list, button, result]));
    return;
  }
  if (b.type === 'figure') {
    const figure = el('figure');
    const response = await fetch('/figures/' + b.file);
    if (!response.ok) {
      throw Error('Не найден рисунок ' + b.file);
    }
    const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
    if (svg.tagName !== 'svg') {
      throw Error('Некорректный SVG');
    }
    svg.querySelectorAll('script,foreignObject').forEach(n => n.remove());
    svg.querySelectorAll('*').forEach(n => [...n.attributes].filter(a => /^on/i.test(a.name)).forEach(a => n.removeAttribute(a.name)));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', b.alt);
    figure.append(document.importNode(svg, true), el('figcaption', {
      text: b.caption
    }));
    root.append(figure);
    return;
  }
  if (b.type === 'recall') {
    if (!b.questions.length) {
      return;
    }
    const box = el('section', {}, [el('h3', {
      text: 'Вспомним предыдущие уроки'
    })]);
    b.questions.forEach(q => mountQuiz(box, q, {
      lessonId: q.source_lesson,
      recall: true
    }));
    root.append(box);
    return;
  }
  if (b.type === 'widget') {
    const box = el('section', {
      class: 'widget'
    }, [el('p', {
      class: 'muted',
      text: b.caption
    })]);
    const mount = el('div');
    box.append(mount);
    root.append(box);
    const module = await import('../widgets/' + b.name + '.js');
    const dispose = module.mount(mount, b.params || {});
    if (typeof dispose === 'function') {
      context.disposers.push(dispose);
    }
  }
}

