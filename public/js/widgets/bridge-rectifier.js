import { el } from '../dom.js';
import { controls, chart, number as f } from './controls.js';
export function mount(container, params = {}) {
  const out = el('output', {
    'aria-live': 'polite'
  });
  const diagram = el('div');
  const graph = el('div');
  const render = s => {
    const peak = Math.max(0, s.u * Math.SQRT2 - 2 * s.vf);
    const ripple = s.i / (100 * s.c * 1e-6);
    out.textContent = 'Uпик = ' + f(s.u) + '·√2−2·' + f(s.vf) + ' = ' + f(peak) + ' В; ΔU ≈ I/(100·C) = ' +
      f(ripple) + ' В. Вход 50 Гц. ' + (s.phase ? 'Отрицательная полуволна: D2/D3.' :
      'Положительная полуволна: D1/D4.') + (ripple > peak * .2 ?
      ' Большая пульсация: линейная модель C уже неточна.' : '');
    const a = s.phase ? 'currentColor' : 'var(--accent)';
    const b = s.phase ? 'var(--accent)' : 'currentColor';
    diagram.innerHTML = "<svg viewBox=\"0 0 480 260\" role=\"img\" aria-label=\"Мост: пути тока в выбранны" +
      "й полупериод\"><g fill=\"none\" stroke-width=\"3\"><path d=\"M60 130L240 40L420 13" + "0\" stroke=\"" + a +
      '"/><path d="M60 130L240 220L420 130" stroke="' + b +
      ("\"/><path d=\"M240 40H460V220H240\" stroke=\"var(--accent)\"/></g><g fill=\"curren" +
      "tColor\" font-size=\"16\" text-anchor=\"middle\"><text x=\"35\" y=\"135\">~A</text><t" +
      "ext x=\"425\" y=\"155\">~B</text><text x=\"240\" y=\"24\">+ выход</text><text x=\"240" +
      "\" y=\"248\">− выход</text><text x=\"136\" y=\"73\">D1 A→+</text><text x=\"340\" y=\"7" +
      "3\">D2 B→+</text><text x=\"136\" y=\"208\">D3 −→A</text><text x=\"340\" y=\"208\">D4 " +
      "−→B</text><text x=\"440\" y=\"105\">Rн</text></g></svg>");
    // В положительную полуволну активны A→+ и −→B, в отрицательную — B→+ и −→A.
    const paths = diagram.querySelectorAll('path');
    paths[0].setAttribute('d', 'M60 130L240 40M240 220L420 130');
    paths[1].setAttribute('d', 'M420 130L240 40M240 220L60 130');
    const rect = t => Math.max(0, Math.abs(s.u * Math.SQRT2 * Math.sin(2 * Math.PI * 50 * t)) - 2 * s.vf);
    const filtered = t => Math.max(rect(t), peak - ripple * ((t * 100 + .5) % 1));
    graph.innerHTML = chart(rect, {
      xmax: .04,
      ymax: Math.max(1, s.u * 1.5),
      xlabel: 't, с',
      ylabel: 'U, В',
      second: s.filter ? filtered : undefined
    });
    graph.append(el('p', {
      class: 'muted',
      text: "Сплошная линия — после моста; пунктир — приближение с C. Влияние зарядных им" +
        "пульсов и сопротивления источника не учтено."
    }));
  };
  const state = controls(container, [['u', 'Вход RMS, В', 1, 12, .1, 6], ['vf', 'Падение диода, В', .2, 1, .1, .7],
    ['i', 'Нагрузка, А', .01, .3, .01, .05], ['c', 'C, мкФ', 100, 4700, 100, 1000]], params, render);
  state.phase = 0;
  state.filter = 1;
  const toggle = el('button', {
    text: 'Сменить полупериод'
  });
  toggle.onclick = () => {
    state.phase = 1 - state.phase;
    render(state);
  };
  const cap = el('input', {
    type: 'checkbox'
  });
  cap.checked = true;
  cap.onchange = () => {
    state.filter = Number(cap.checked);
    render(state);
  };
  container.append(el('div', {
    class: 'row wrap'
  }, [toggle, el('label', {}, [cap, ' Конденсатор'])]), out, diagram, graph);
  render(state);
}
