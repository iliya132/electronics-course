import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('comparator-hysteresis');

  // 1. Компаратор LM393 с положительной обратной связью
  const f = new Fig(680, 360, 'Компаратор с гистерезисом на LM393');
  sch.opamp(f, 300, 170, { supply: false });
  sch.wire(f, [[150, 148], [260, 148]]);
  f.circle(150, 148, 4.5, { fill: 'none' });
  f.text(150, 132, 'Uоп = 2,5 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[40, 192], [70, 192]]);
  f.circle(40, 192, 4.5, { fill: 'none' });
  f.text(40, 176, 'Uвх', { anchor: 'middle', size: 13, weight: 700 });
  sch.resistor(f, 110, 192, { len: 80, name: 'R1', value: '10 кОм', off: 28 });
  sch.wire(f, [[150, 192], [260, 192]]);
  sch.node(f, 200, 192);
  sch.wire(f, [[200, 192], [200, 270], [250, 270]]);
  sch.resistor(f, 290, 270, { len: 80, name: 'Rf', value: '100 кОм', off: 28 });
  sch.wire(f, [[330, 270], [450, 270], [450, 170]]);
  sch.node(f, 450, 170);
  sch.wire(f, [[450, 50], [450, 80]]);
  f.circle(450, 50, 4.5, { fill: 'none' });
  f.text(450, 36, '+5 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.resistor(f, 450, 110, { rot: 90, len: 60, name: 'Rп', value: '1 кОм', off: 30 });
  sch.wire(f, [[450, 140], [450, 170]]);
  sch.wire(f, [[420, 170], [450, 170], [540, 170]]);
  f.circle(540, 170, 4.5, { fill: 'none' });
  f.text(540, 154, 'Uвых', { anchor: 'middle', size: 13, weight: 700 });
  f.text(400, 322, 'выход LM393 — открытый коллектор:\nнужна подтяжка Rп ≪ Rf', { size: 12, fill: C.muted });
  f.save(out('comparator-hysteresis', 'schmitt'));

  // 2. Петля гистерезиса по формулам
  const Vref = 2.5, R1 = 10, Rf = 100, VH = 5;
  const up = Vref * (1 + R1 / Rf), dn = up - VH * R1 / Rf;
  const g = chart({
    title: `Петля гистерезиса: пороги ${String(dn.toFixed(2)).replace('.', ',')} и ${String(up.toFixed(2)).replace('.', ',')} В`,
    xLabel: 'Входное напряжение Uвх, В', yLabel: 'Uвых, В',
    xRange: [0, 5], yRange: [-0.5, 5.8],
    series: [
      { points: [[0, 0], [up, 0], [up + 0.0001, 5], [5, 5]], label: 'Uвх растёт', color: C.accent, width: 3 },
      { points: [[5, 5], [dn, 5], [dn - 0.0001, 0], [0, 0]], label: 'Uвх падает', color: C.bad, width: 3, dash: '8 5' },
    ],
    vlines: [{ v: dn, color: C.muted }, { v: up, color: C.muted }],
    legendAt: { x: 300, y: 250, cols: 1 },
    xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 1, 2, 3, 4, 5],
  });
  g.save(out('comparator-hysteresis', 'loop'));
}
