import { diagram, tableFig } from '../lib/diag.js';
import { chart, out, fresh, C } from '../lib/fig.js';

export function generate() {
  fresh('voltmeter-0-25v');

  diagram({
    title: 'Вольтметр 0–25 В: делитель, защита, АЦП',
    w: 800, h: 320,
    boxes: [
      { id: 'in', x: 20, y: 120, w: 130, h: 60, text: 'измеряемое\nнапряжение\n0…25 В', tone: 'warn', size: 12 },
      { id: 'r1', x: 190, y: 120, w: 110, h: 60, text: 'R1 30 кОм', tone: 'muted', size: 13 },
      { id: 'node', x: 340, y: 100, w: 130, h: 100, text: 'узел 0…5 В\nR2 7,5 кОм на GND\nстабилитрон 5,1 В', tone: 'ok', size: 12 },
      { id: 'rs', x: 510, y: 120, w: 90, h: 60, text: 'Rс 1 кОм', tone: 'muted', size: 13 },
      { id: 'a0', x: 640, y: 110, w: 140, h: 80, text: 'Arduino A0\nАЦП 10 бит', tone: 'accent', size: 13 },
    ],
    arrows: [['in', 'r1'], ['r1', 'node'], ['node', 'rs'], ['rs', 'a0']],
    notes: [{ x: 20, y: 270, text: 'коэффициент деления 7,5/(30 + 7,5) = 0,2: 25 В → 5 В; шаг АЦП 25/1024 = 24,4 мВ', size: 13, tone: 'ok', weight: 700 }],
  }).save(out('voltmeter-0-25v', 'block'));

  chart({
    title: 'Напряжение на входе A0 при защите стабилитроном',
    xLabel: 'Измеряемое напряжение, В', yLabel: 'Напряжение на A0, В',
    xRange: [0, 40], yRange: [0, 8.5],
    series: [
      { fn: v => 0.2 * v, label: 'только делитель 0,2', color: C.bad, width: 2.6, dash: '8 5' },
      { fn: v => { const d = 0.2 * v; return d <= 4.8 ? d : 4.8 + 0.3 * Math.log1p(d - 4.8); }, label: 'со стабилитроном 5,1 В', color: C.ok, width: 3 },
    ],
    hlines: [{ v: 5.5, label: 'предел входа 5,5 В', color: C.warn }],
    legendAt: { x: 90, y: 90, cols: 1 },
    xTicks: [0, 10, 20, 25, 30, 40], yTicks: [0, 2, 4, 6, 8],
    samples: 150,
  }).save(out('voltmeter-0-25v', 'clamp'));
}
