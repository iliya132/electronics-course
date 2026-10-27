import { Fig, C, chart, sch, out, fresh } from '../lib/fig.js';

export function generate() {
  fresh('adc-basics');

  // 1. Лестница квантования (3 бита для наглядности)
  const n = 3, ref = 3.3, lsb = ref / 2 ** n;
  const g = chart({
    title: 'Квантование: 3-разрядный АЦП, Uref = 3,3 В',
    xLabel: 'Входное напряжение, В', yLabel: 'Код × LSB, В',
    xRange: [0, 3.3], yRange: [0, 3.3],
    series: [
      { fn: x => x, label: 'идеальный сигнал', color: C.muted, width: 2, dash: '6 5' },
      { fn: x => Math.min(2 ** n - 1, Math.floor(x / lsb)) * lsb, label: `ступени по LSB = ${(lsb * 1000).toFixed(0)} мВ`, color: C.accent, width: 3 },
    ],
    legendAt: { x: 90, y: 90, cols: 1 },
    xTicks: [0, 0.825, 1.65, 2.475, 3.3], yTicks: [0, 1, 2, 3],
    samples: 600,
  });
  g.save(out('adc-basics', 'staircase'));

  // 2. RC-фильтр перед АЦП
  const f = new Fig(720, 260, 'RC-фильтр перед входом АЦП');
  sch.wire(f, [[30, 110], [90, 110]]);
  f.circle(30, 110, 4.5, { fill: 'none' });
  f.text(30, 94, 'сигнал', { anchor: 'middle', size: 13, weight: 700 });
  sch.resistor(f, 130, 110, { len: 80, name: 'R', value: '1 кОм', off: 28 });
  sch.wire(f, [[170, 110], [400, 110]]);
  sch.node(f, 260, 110);
  sch.wire(f, [[260, 110], [260, 140]]);
  sch.capacitor(f, 260, 160, { rot: 90, len: 40, name: 'C', value: '100 нФ', off: 30 });
  sch.wire(f, [[260, 180], [260, 200]]);
  sch.gnd(f, 260, 200);
  sch.block(f, 400, 80, 110, 60, 'вход\nАЦП', { size: 14 });
  f.text(540, 98, 'fср = 1/(2π·R·C)\n= 1,6 кГц', { size: 13, fill: C.ok, weight: 700 });
  f.text(540, 150, 'выше 1,6 кГц шум\nослабляется', { size: 12, fill: C.muted });
  f.save(out('adc-basics', 'rc-filter'));
}
