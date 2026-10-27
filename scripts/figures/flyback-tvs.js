import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('flyback-tvs');

  // 1. Катушка реле с обратным диодом
  const f = new Fig(480, 300, 'Обратный диод на катушке реле');
  sch.wire(f, [[40, 50], [330, 50]]);
  f.circle(40, 50, 4.5, { fill: 'none' });
  f.text(40, 36, '+12 В', { size: 12, weight: 700, fill: C.warn });
  sch.node(f, 130, 50);
  sch.wire(f, [[130, 50], [130, 70]]);
  sch.inductor(f, 130, 120, { rot: 90, len: 100, name: 'катушка', off: 14 });
  sch.wire(f, [[130, 170], [130, 190]]);
  sch.node(f, 130, 190);
  sch.node(f, 250, 50);
  sch.wire(f, [[250, 50], [250, 68]]);
  sch.diode(f, 250, 120, { rot: 270, len: 90, name: 'VD', off: 26 });
  sch.wire(f, [[250, 172], [250, 190]]);
  sch.node(f, 250, 190);
  sch.wire(f, [[130, 190], [250, 190]]);
  sch.wire(f, [[190, 190], [190, 208]]);
  f.rect(160, 208, 60, 34, { r: 6, width: 2.4 });
  f.text(190, 230, 'ключ', { anchor: 'middle', size: 13, weight: 700 });
  sch.wire(f, [[190, 242], [190, 258]]);
  sch.gnd(f, 190, 258);
  f.path('M 262 160 C 300 190 300 70 262 80', { stroke: C.ok, width: 2.2, dash: '6 4' });
  f.text(296, 128, 'ток катушки\nпосле выключения', { size: 12, fill: C.ok, weight: 600 });
  f.text(300, 232, 'в норме диод закрыт: катод\nна плюсе, анод на ключе', { size: 12, fill: C.muted });
  f.save(out('flyback-tvs', 'relay-diode'));

  // 2. Напряжение на ключе при выключении (иллюстративная модель)
  const Vs = 12, T0 = 0;
  const spike = t => t < T0 ? 0.2 : Vs + 68 * Math.exp(-(t - T0) / 0.25);
  const clamp = t => t < T0 ? 0.2 : (t < 5 ? Vs + 0.7 : Vs);
  const g = chart({
    title: 'Напряжение на ключе при выключении катушки',
    xLabel: 'Время, мс (0 — ключ выключили)', yLabel: 'Напряжение, В',
    xRange: [-1, 7], yRange: [0, 90],
    series: [
      { fn: spike, label: 'без диода (иллюстрация)', color: C.bad, width: 2.6 },
      { fn: clamp, label: 'с диодом: Uпит + 0,7 В', color: C.accent, width: 3 },
    ],
    legendAt: { x: 250, y: 90, cols: 1 },
    samples: 600,
    yTicks: [0, 30, 60, 90],
  });
  g.save(out('flyback-tvs', 'spike'));
}
