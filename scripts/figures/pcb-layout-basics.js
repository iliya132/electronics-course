import { diagram } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

// IPC-2221, внешний слой: I = 0,048·ΔT^0,44·A^0,725 (A в mil²), толщина 35 мкм = 1,378 mil
const widthMm = (I, dT = 10, k = 0.048, thick = 1.378) => {
  const A = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725);
  return A / thick * 0.0254;
};

export function generate() {
  fresh('pcb-layout-basics');

  chart({
    title: 'Ширина дорожки по току (IPC-2221)',
    xLabel: 'Ток, А', yLabel: 'Ширина дорожки, мм',
    xRange: [0, 4], yRange: [0, 2.2],
    series: [{ fn: I => I <= 0 ? 0 : widthMm(I), label: 'внешний слой', color: C.accent, width: 3 },
             { fn: I => I <= 0 ? 0 : widthMm(I, 10, 0.024), label: 'внутренний слой', color: C.warn, width: 3, dash: '8 5' }],
    markers: [{ x: 1, y: widthMm(1), label: '1 А: 0,30 мм', dx: 10, dy: 24, anchor: 'start' }, { x: 3, y: widthMm(3), label: '3 А: 1,37 мм', dx: -10, dy: -14, anchor: 'end' }],
    xTicks: [0, 1, 2, 3, 4], yTicks: [0, 0.5, 1, 1.5, 2],
    legendAt: { x: 90, y: 90, cols: 1 },
    samples: 120,
  }).save(out('pcb-layout-basics', 'trace-width'));

  diagram({
    title: 'Развязка: рядом с выводом питания, а не «где-то на плате»',
    w: 820, h: 320,
    boxes: [
      { id: 'u1', x: 40, y: 80, w: 160, h: 80, text: 'МК\nвывод VDD', tone: 'accent', size: 13 },
      { id: 'c1', x: 40, y: 190, w: 160, h: 40, text: '100 нФ рядом: 2 мм', tone: 'ok', size: 12 },
      { id: 'u2', x: 440, y: 80, w: 160, h: 80, text: 'МК\nвывод VDD', tone: 'accent', size: 13 },
      { id: 'c2', x: 640, y: 190, w: 160, h: 40, text: '100 нФ далеко: 30 мм', tone: 'bad', size: 12 },
    ],
    arrows: [['u1', 'c1', '', { both: true, tone: 'ok' }], ['u2', 'c2', '', { both: true, tone: 'bad', dash: '5 4' }]],
    notes: [
      { x: 40, y: 60, text: 'правильно: малая петля', size: 13, tone: 'ok', weight: 700 },
      { x: 440, y: 60, text: 'неправильно: большая петля', size: 13, tone: 'bad', weight: 700 },
      { x: 40, y: 270, text: 'импульс тока замыкается в петле «МК — конденсатор»: чем она меньше, тем меньше индуктивность и помехи', size: 12 },
    ],
  }).save(out('pcb-layout-basics', 'decoupling'));
}
