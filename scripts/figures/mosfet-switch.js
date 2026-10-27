import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('mosfet-switch');

  // 1. N-MOSFET нижний ключ: лента 12 В, 2 А
  const f = new Fig(560, 380, 'N-MOSFET как нижний ключ для нагрузки 2 А');
  sch.wire(f, [[330, 40], [480, 40]]);
  f.circle(480, 40, 4.5, { fill: 'none' });
  f.text(480, 26, '+12 В', { anchor: 'middle', size: 13, weight: 700, fill: C.warn });
  sch.wire(f, [[330, 40], [330, 60]]);
  sch.resistor(f, 330, 110, { rot: 90, len: 100, name: 'лента', value: '6 Ом (2 А)', off: -30 });
  sch.wire(f, [[330, 160], [330, 200]]);
  sch.mosfet(f, 300, 250);
  sch.wire(f, [[330, 300], [330, 322]]);
  sch.gnd(f, 330, 322);
  sch.wire(f, [[60, 250], [110, 250]]);
  sch.resistor(f, 150, 250, { len: 80, name: 'Rз 100 Ом', off: 28 });
  sch.wire(f, [[190, 250], [266, 250]]);
  sch.node(f, 230, 250);
  sch.wire(f, [[230, 250], [230, 262]]);
  sch.resistor(f, 230, 292, { rot: 90, len: 60, name: 'Rпд', value: '100 кОм', off: -30 });
  sch.gnd(f, 230, 322);
  f.circle(60, 250, 4.5, { fill: 'none' });
  f.text(14, 282, 'вывод МК, 3,3 В', { size: 12, fill: C.muted });
  sch.current(f, 330, 182, 'down', 'Iс = 2 А', { off: 14, len: 30 });
  f.text(392, 236, 'Rds(on) ≈ 50 мОм', { size: 14, fill: C.warn, weight: 700 });
  f.text(392, 258, 'при Uзи = 3,3 В', { size: 12, fill: C.muted });
  f.text(392, 292, 'Uси = 0,1 В', { size: 14, fill: C.warn, weight: 700 });
  f.text(392, 168, 'P = I²·R = 0,2 Вт', { size: 14, fill: C.warn, weight: 700 });
  f.text(14, 306, 'ток затвора ≈ 0', { size: 12, fill: C.ok, weight: 600 });
  f.save(out('mosfet-switch', 'nmos-switch'));

  // 2. Rds(on) от Uзи (иллюстративная модель логического MOSFET)
  const R = v => 0.015 + 0.0594 / (v - 1.2);
  const g = chart({
    title: 'Rds(on) от напряжения на затворе (модель)',
    xLabel: 'Напряжение затвор–исток Uзи, В', yLabel: 'Rds(on), мОм',
    xRange: [1.5, 10], yRange: [0, 220],
    series: [{ fn: v => R(v) * 1000, label: 'логический MOSFET (иллюстрация)', color: C.accent, width: 3 }],
    markers: [
      { x: 2.5, y: R(2.5) * 1000, label: '2,5 В: 61 мОм', dx: 14, dy: -34, anchor: 'start' },
      { x: 3.3, y: R(3.3) * 1000, label: '3,3 В: 43 мОм', dx: 16, dy: -8, anchor: 'start' },
      { x: 4.5, y: R(4.5) * 1000, label: '4,5 В: 33 мОм', dx: 16, dy: 26, anchor: 'start' },
      { x: 10, y: R(10) * 1000, label: '10 В: 22 мОм', dx: -10, dy: -14, anchor: 'end' },
    ],
    vlines: [{ v: 1.8, label: 'Uпор ≈ 1,2…2 В', color: C.bad }],
    legendAt: { x: 190, y: 120, cols: 1 },
    xTicks: [2, 3, 4, 6, 8, 10], yTicks: [0, 50, 100, 150, 200],
    samples: 300,
  });
  g.save(out('mosfet-switch', 'rds-vgs'));
}
